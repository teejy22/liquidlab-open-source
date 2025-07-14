import { Request, Response } from 'express';
import { storage } from '../storage';
import { createAuditLog } from '../security/audit';
import crypto from 'crypto';

// Verify webhook signature from Hyperliquid
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function handleHyperliquidWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-hyperliquid-signature'] as string;
    const webhookSecret = process.env.HYPERLIQUID_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('HYPERLIQUID_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      await createAuditLog({
        action: 'webhook_invalid_signature',
        resource: 'hyperliquid_webhook',
        ipAddress: req.ip,
        metadata: { signature }
      });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { type, data } = req.body;

    // Handle trade execution events
    if (type === 'trade.executed') {
      const {
        platformId,
        tradeId,
        userId,
        market,
        side,
        size,
        price,
        fee,
        builderCode,
        timestamp
      } = data;

      // Only process trades with our builder code
      if (builderCode === 'LIQUIDLAB2025') {
        // Calculate revenue split
        const totalFee = parseFloat(fee);
        const platformShare = totalFee * 0.7; // 70% to platform
        const liquidlabShare = totalFee * 0.3; // 30% to LiquidLab

        // Record the fee transaction
        await storage.recordFeeTransaction({
          platformId: platformId,
          transactionId: tradeId,
          userId: userId,
          transactionType: 'trade',
          feeAmount: totalFee.toString(),
          platformEarnings: platformShare.toString(),
          liquidlabEarnings: liquidlabShare.toString(),
          metadata: {
            market,
            side,
            size,
            price,
            timestamp
          },
          status: 'completed'
        });

        // Log successful processing
        await createAuditLog({
          platformId,
          action: 'trade_fee_recorded',
          resource: 'fee_transaction',
          metadata: {
            tradeId,
            totalFee,
            platformShare,
            liquidlabShare
          }
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Endpoint to verify webhook configuration
export async function verifyWebhookEndpoint(req: Request, res: Response) {
  const challenge = req.query.challenge as string;
  if (challenge) {
    // Hyperliquid sends a challenge during webhook setup
    return res.send(challenge);
  }
  res.json({ status: 'ready' });
}