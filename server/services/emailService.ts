import sgMail from '@sendgrid/mail';
import { TradingPlatform, User, PayoutRecord, MoonpayTransaction } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users, tradingPlatforms } from '@shared/schema';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

const DEFAULT_FROM_EMAIL = 'notifications@liquidlab.trade';
const DEFAULT_FROM_NAME = 'LiquidLab';

class EmailService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
  }

  private async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('SendGrid not configured. Email would have been sent:', params);
      return false;
    }

    try {
      await sgMail.send({
        to: params.to,
        from: params.from || {
          email: DEFAULT_FROM_EMAIL,
          name: DEFAULT_FROM_NAME
        },
        subject: params.subject,
        text: params.text,
        html: params.html || params.text,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  // Welcome email when user creates account
  async sendWelcomeEmail(user: User): Promise<boolean> {
    if (!user.email) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066ff;">Welcome to LiquidLab! 🚀</h1>
        <p>Hi ${user.username || 'there'},</p>
        <p>Thank you for joining LiquidLab, the premier platform for building custom trading interfaces on Hyperliquid DEX.</p>
        
        <h2>Getting Started</h2>
        <ul>
          <li>Build your first trading platform with our drag-and-drop builder</li>
          <li>Earn 70% of all trading fees from your platforms</li>
          <li>Get 50% of MoonPay affiliate commissions</li>
          <li>Deploy with custom domains for your brand</li>
        </ul>
        
        <p>Ready to start building?</p>
        <a href="https://liquidlab.trade/builder" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Create Your First Platform</a>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Best regards,<br>The LiquidLab Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to LiquidLab - Start Building Trading Platforms',
      html
    });
  }

  // Platform created notification
  async sendPlatformCreatedEmail(platform: TradingPlatform, owner: User): Promise<boolean> {
    if (!owner.email) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066ff;">Platform Created Successfully! 🎉</h1>
        <p>Hi ${owner.username || 'there'},</p>
        <p>Your trading platform "<strong>${platform.name}</strong>" has been created successfully!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Platform Details</h3>
          <p><strong>Platform ID:</strong> #${platform.id}</p>
          <p><strong>Builder Wallet:</strong> Configured automatically</p>
          <p><strong>Revenue Share:</strong> You earn 70% of all trading fees</p>
          <p><strong>MoonPay Commission:</strong> You earn 50% of affiliate fees</p>
        </div>
        
        <h2>Next Steps</h2>
        <ol>
          <li>Share your platform link with traders</li>
          <li>Consider adding a custom domain for professional branding</li>
          <li>Monitor your earnings in the dashboard</li>
        </ol>
        
        <a href="https://liquidlab.trade/dashboard" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Dashboard</a>
        
        <p>Best regards,<br>The LiquidLab Team</p>
      </div>
    `;

    return this.sendEmail({
      to: owner.email,
      subject: `Platform "${platform.name}" Created Successfully`,
      html
    });
  }

  // Payout processed notification
  async sendPayoutProcessedEmail(
    payout: PayoutRecord, 
    platform: TradingPlatform, 
    owner: User,
    tradingFees: string,
    moonpayFees: string
  ): Promise<boolean> {
    if (!owner.email) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066ff;">Payout Processed! 💰</h1>
        <p>Hi ${owner.username || 'there'},</p>
        <p>We've sent your earnings to your wallet!</p>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0066ff;">Payout Details</h3>
          <p><strong>Amount:</strong> ${payout.amount} USDC</p>
          <p><strong>Platform:</strong> ${platform.name}</p>
          <p><strong>Period:</strong> ${payout.period}</p>
          
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 16px 0;">
          
          <p><strong>Breakdown:</strong></p>
          <ul style="margin: 8px 0;">
            <li>Trading Fees (70%): $${tradingFees}</li>
            <li>MoonPay Commissions (50%): $${moonpayFees}</li>
          </ul>
          
          <p><strong>Transaction Hash:</strong><br>
          <a href="https://arbiscan.io/tx/${payout.txHash}" style="color: #0066ff; word-break: break-all;">${payout.txHash}</a></p>
        </div>
        
        <p>The USDC has been sent to your wallet on Arbitrum. It should arrive within a few minutes.</p>
        
        <a href="https://liquidlab.trade/dashboard/payouts" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Payout History</a>
        
        <p>Thank you for being part of LiquidLab!</p>
        
        <p>Best regards,<br>The LiquidLab Team</p>
      </div>
    `;

    return this.sendEmail({
      to: owner.email,
      subject: `Payout Processed: ${payout.amount} USDC`,
      html
    });
  }

  // Weekly revenue summary
  async sendWeeklyRevenueSummary(
    owner: User,
    platforms: TradingPlatform[],
    weeklyStats: {
      totalTradingFees: string;
      totalMoonpayFees: string;
      totalEarnings: string;
      tradeCount: number;
      moonpayPurchases: number;
    }
  ): Promise<boolean> {
    if (!owner.email) return false;

    const platformList = platforms.map(p => 
      `<li>${p.name} - ID: #${p.id}</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066ff;">Weekly Revenue Report 📊</h1>
        <p>Hi ${owner.username || 'there'},</p>
        <p>Here's your weekly earnings summary for LiquidLab:</p>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #0066ff;">Total Earnings: $${weeklyStats.totalEarnings}</h2>
          
          <div style="display: flex; gap: 20px; margin: 20px 0;">
            <div style="flex: 1;">
              <h4 style="margin: 0; color: #666;">Trading Fees</h4>
              <p style="font-size: 24px; margin: 8px 0; color: #0066ff;">$${weeklyStats.totalTradingFees}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${weeklyStats.tradeCount} trades</p>
            </div>
            
            <div style="flex: 1;">
              <h4 style="margin: 0; color: #666;">MoonPay Commissions</h4>
              <p style="font-size: 24px; margin: 8px 0; color: #0066ff;">$${weeklyStats.totalMoonpayFees}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${weeklyStats.moonpayPurchases} purchases</p>
            </div>
          </div>
        </div>
        
        <h3>Your Active Platforms</h3>
        <ul>${platformList}</ul>
        
        <p>Payouts are processed weekly on Mondays. If your balance exceeds $10, you'll receive USDC on Arbitrum.</p>
        
        <a href="https://liquidlab.trade/dashboard" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Full Dashboard</a>
        
        <p>Keep growing your platforms!</p>
        
        <p>Best regards,<br>The LiquidLab Team</p>
      </div>
    `;

    return this.sendEmail({
      to: owner.email,
      subject: `Weekly Revenue Report: $${weeklyStats.totalEarnings} earned`,
      html
    });
  }

  // Platform verification status change
  async sendPlatformVerificationEmail(
    platform: TradingPlatform, 
    owner: User, 
    verified: boolean
  ): Promise<boolean> {
    if (!owner.email) return false;

    const statusText = verified ? 'Verified' : 'Verification Pending';
    const statusColor = verified ? '#00cc66' : '#ff9900';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${statusColor};">Platform ${statusText} ✓</h1>
        <p>Hi ${owner.username || 'there'},</p>
        
        ${verified ? `
          <p>Great news! Your platform "<strong>${platform.name}</strong>" has been verified by LiquidLab.</p>
          
          <div style="background: #f0fff0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #00cc66;">
            <h3 style="margin-top: 0; color: #00cc66;">✓ Verification Complete</h3>
            <p>Your platform now displays the official verification badge, giving traders confidence in your platform's legitimacy.</p>
          </div>
        ` : `
          <p>Your platform "<strong>${platform.name}</strong>" is currently under review for verification.</p>
          
          <div style="background: #fffaf0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ff9900;">
            <h3 style="margin-top: 0; color: #ff9900;">⏳ Verification In Progress</h3>
            <p>We're reviewing your platform to ensure it meets our quality standards. This usually takes 24-48 hours.</p>
          </div>
        `}
        
        <a href="https://liquidlab.trade/dashboard" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Platform Status</a>
        
        <p>Best regards,<br>The LiquidLab Team</p>
      </div>
    `;

    return this.sendEmail({
      to: owner.email,
      subject: `Platform ${statusText}: ${platform.name}`,
      html
    });
  }

  // Domain verification reminder
  async sendDomainVerificationReminder(
    platform: TradingPlatform, 
    owner: User,
    domain: string,
    verificationToken: string
  ): Promise<boolean> {
    if (!owner.email) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066ff;">Complete Your Domain Setup 🌐</h1>
        <p>Hi ${owner.username || 'there'},</p>
        <p>You've added the domain <strong>${domain}</strong> to your platform "${platform.name}", but it needs verification.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">DNS Verification Required</h3>
          <p>Add this TXT record to your domain's DNS settings:</p>
          
          <div style="background: white; padding: 16px; border-radius: 4px; font-family: monospace; margin: 16px 0;">
            <strong>Type:</strong> TXT<br>
            <strong>Name:</strong> _liquidlab<br>
            <strong>Value:</strong> ${verificationToken}
          </div>
          
          <p>Once added, DNS changes can take up to 48 hours to propagate.</p>
        </div>
        
        <a href="https://liquidlab.trade/builder" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Domain</a>
        
        <p>Need help? Check our <a href="https://liquidlab.trade/docs/custom-domains" style="color: #0066ff;">custom domain guide</a>.</p>
        
        <p>Best regards,<br>The LiquidLab Team</p>
      </div>
    `;

    return this.sendEmail({
      to: owner.email,
      subject: `Action Required: Verify domain ${domain}`,
      html
    });
  }

  // Test email functionality
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'LiquidLab Email Test',
      text: 'This is a test email from LiquidLab. If you received this, email notifications are working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0066ff;">Email Test Successful! ✅</h1>
          <p>This is a test email from LiquidLab.</p>
          <p>If you received this, email notifications are working correctly!</p>
          <p>Best regards,<br>The LiquidLab Team</p>
        </div>
      `
    });
  }
}

export const emailService = new EmailService();