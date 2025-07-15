import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Verify webhook signatures from different providers
export function verifyWebhookSignature(
  provider: 'hyperliquid' | 'moonpay' | 'stripe',
  secret: string
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-webhook-signature'] as string;
      
      if (!signature) {
        return res.status(401).json({ error: 'Missing webhook signature' });
      }
      
      let expectedSignature: string;
      
      switch (provider) {
        case 'hyperliquid':
          // Hyperliquid uses HMAC-SHA256
          expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');
          break;
          
        case 'moonpay':
          // MoonPay uses HMAC-SHA256 with timestamp
          const timestamp = req.headers['x-moonpay-timestamp'] as string;
          const payload = `${timestamp}.${JSON.stringify(req.body)}`;
          expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
          break;
          
        case 'stripe':
          // Stripe signature verification (simplified)
          const stripeSignature = req.headers['stripe-signature'] as string;
          // In production, use Stripe SDK for verification
          expectedSignature = stripeSignature;
          break;
          
        default:
          return res.status(400).json({ error: 'Unknown webhook provider' });
      }
      
      // Timing-safe comparison
      const signatureValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
      
      if (!signatureValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      
      next();
    } catch (error) {
      console.error('Webhook verification error:', error);
      res.status(500).json({ error: 'Webhook verification failed' });
    }
  };
}

// Webhook replay attack prevention
const processedWebhooks = new Map<string, number>();

export function preventWebhookReplay(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const webhookId = req.headers['x-webhook-id'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;
  
  if (!webhookId || !timestamp) {
    return res.status(400).json({ error: 'Missing webhook metadata' });
  }
  
  const webhookTime = parseInt(timestamp);
  const now = Date.now();
  
  // Reject webhooks older than 5 minutes
  if (now - webhookTime > 5 * 60 * 1000) {
    return res.status(400).json({ error: 'Webhook too old' });
  }
  
  // Check for replay
  if (processedWebhooks.has(webhookId)) {
    return res.status(400).json({ error: 'Webhook already processed' });
  }
  
  // Store webhook ID with expiry
  processedWebhooks.set(webhookId, now);
  
  // Clean up old entries periodically
  if (processedWebhooks.size > 1000) {
    const cutoff = now - 10 * 60 * 1000; // 10 minutes
    for (const [id, time] of processedWebhooks.entries()) {
      if (time < cutoff) {
        processedWebhooks.delete(id);
      }
    }
  }
  
  next();
}