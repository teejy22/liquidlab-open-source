import sgMail from '@sendgrid/mail';
import { TradingPlatform, User } from '@shared/schema';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendPlatformApprovalNotification(
  platform: TradingPlatform,
  user: User
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email notification');
    return;
  }

  try {
    const msg = {
      to: 'admin@liquidlab.trade',
      from: 'noreply@liquidlab.trade',
      subject: `New Platform Awaiting Approval: ${platform.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #090909;">New Platform Approval Request</h2>
          
          <p>A new trading platform has been created and is awaiting your approval:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Platform Details</h3>
            <p><strong>Platform Name:</strong> ${platform.name}</p>
            <p><strong>Platform ID:</strong> ${platform.id}</p>
            <p><strong>Created By:</strong> ${user.username} (${user.email})</p>
            <p><strong>Created At:</strong> ${new Date(platform.createdAt).toLocaleString()}</p>
            ${platform.customDomain ? `<p><strong>Custom Domain:</strong> ${platform.customDomain}</p>` : ''}
          </div>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Action Required</h3>
            <p>Please review this platform and take one of the following actions:</p>
            <ul>
              <li><strong>Approve:</strong> Allow the platform to go live and accept real trades</li>
              <li><strong>Reject:</strong> Block the platform with a reason for rejection</li>
            </ul>
            
            <p>You can manage platform approvals in the admin dashboard:</p>
            <a href="https://liquidlab.trade/admin/dashboard" style="display: inline-block; background-color: #1dd1a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Review Platform</a>
          </div>
          
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Security Reminder</h3>
            <p>Before approving, please check for:</p>
            <ul>
              <li>Suspicious platform names or descriptions</li>
              <li>Known scam patterns or misleading content</li>
              <li>Proper platform configuration and setup</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from LiquidLab Platform Management System.
          </p>
        </div>
      `,
      text: `
        New Platform Approval Request
        
        A new trading platform has been created and is awaiting your approval:
        
        Platform Name: ${platform.name}
        Platform ID: ${platform.id}
        Created By: ${user.username} (${user.email})
        Created At: ${new Date(platform.createdAt).toLocaleString()}
        ${platform.customDomain ? `Custom Domain: ${platform.customDomain}` : ''}
        
        Please review this platform in the admin dashboard at:
        https://liquidlab.trade/admin/dashboard
        
        You can approve or reject the platform with appropriate notes.
      `
    };

    await sgMail.send(msg);
    console.log(`Platform approval notification sent for platform ${platform.id}`);
  } catch (error) {
    console.error('Error sending platform approval notification:', error);
    // Don't throw error to prevent platform creation from failing
  }
}

export async function sendPlatformApprovedNotification(
  platform: TradingPlatform,
  user: User
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email notification');
    return;
  }

  try {
    const msg = {
      to: user.email,
      from: 'noreply@liquidlab.trade',
      subject: `Your Platform "${platform.name}" Has Been Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #090909;">Platform Approved! 🎉</h2>
          
          <p>Great news! Your trading platform has been approved and is now ready to go live.</p>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Platform Details</h3>
            <p><strong>Platform Name:</strong> ${platform.name}</p>
            <p><strong>Platform URL:</strong> https://${platform.slug}.liquidlab.trade</p>
            ${platform.customDomain ? `<p><strong>Custom Domain:</strong> ${platform.customDomain}</p>` : ''}
            <p><strong>Approved On:</strong> ${new Date(platform.approvalDate || Date.now()).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Next Steps</h3>
            <ol>
              <li><strong>Verify Your Platform:</strong> Complete the verification process to display the trust badge</li>
              <li><strong>Configure Settings:</strong> Fine-tune your platform settings in the builder</li>
              <li><strong>Share Your Platform:</strong> Start promoting your platform to traders</li>
              <li><strong>Monitor Performance:</strong> Track your revenue and platform metrics in the dashboard</li>
            </ol>
            
            <a href="https://liquidlab.trade/dashboard" style="display: inline-block; background-color: #1dd1a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Go to Dashboard</a>
          </div>
          
          ${platform.approvalNotes ? `
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Admin Notes</h3>
            <p>${platform.approvalNotes}</p>
          </div>
          ` : ''}
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
      text: `
        Platform Approved!
        
        Great news! Your trading platform "${platform.name}" has been approved and is now ready to go live.
        
        Platform URL: https://${platform.slug}.liquidlab.trade
        ${platform.customDomain ? `Custom Domain: ${platform.customDomain}` : ''}
        Approved On: ${new Date(platform.approvalDate || Date.now()).toLocaleString()}
        
        ${platform.approvalNotes ? `Admin Notes: ${platform.approvalNotes}` : ''}
        
        Next Steps:
        1. Verify your platform to display the trust badge
        2. Configure your platform settings in the builder
        3. Start promoting your platform to traders
        4. Monitor your revenue in the dashboard
        
        Go to your dashboard: https://liquidlab.trade/dashboard
      `
    };

    await sgMail.send(msg);
    console.log(`Platform approved notification sent for platform ${platform.id}`);
  } catch (error) {
    console.error('Error sending platform approved notification:', error);
  }
}

export async function sendPlatformRejectedNotification(
  platform: TradingPlatform,
  user: User
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email notification');
    return;
  }

  try {
    const msg = {
      to: user.email,
      from: 'noreply@liquidlab.trade',
      subject: `Platform "${platform.name}" Requires Changes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #090909;">Platform Review Update</h2>
          
          <p>Thank you for submitting your platform. After review, we need you to make some changes before it can be approved.</p>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Reason for Changes Required</h3>
            <p>${platform.rejectionReason}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What to Do Next</h3>
            <ol>
              <li><strong>Review the Feedback:</strong> Carefully read the reason provided above</li>
              <li><strong>Make Changes:</strong> Update your platform to address the issues</li>
              <li><strong>Resubmit:</strong> Save your changes and we'll review again</li>
            </ol>
            
            <a href="https://liquidlab.trade/builder" style="display: inline-block; background-color: #1dd1a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Edit Platform</a>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Common Issues</h3>
            <ul>
              <li>Misleading platform names or descriptions</li>
              <li>Missing or unclear platform information</li>
              <li>Violation of our terms of service</li>
              <li>Suspicious or potentially harmful content</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            If you believe this decision was made in error or need clarification, please contact our support team.
          </p>
        </div>
      `,
      text: `
        Platform Review Update
        
        Thank you for submitting your platform "${platform.name}". After review, we need you to make some changes before it can be approved.
        
        Reason for Changes Required:
        ${platform.rejectionReason}
        
        What to Do Next:
        1. Review the feedback carefully
        2. Make the necessary changes to your platform
        3. Save your changes and we'll review again
        
        Edit your platform: https://liquidlab.trade/builder
        
        If you believe this decision was made in error or need clarification, please contact our support team.
      `
    };

    await sgMail.send(msg);
    console.log(`Platform rejected notification sent for platform ${platform.id}`);
  } catch (error) {
    console.error('Error sending platform rejected notification:', error);
  }
}