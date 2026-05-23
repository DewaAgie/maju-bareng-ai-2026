import nodemailer from 'nodemailer';
import env from './env.js';

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // If SMTP credentials are configured, use them
  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Create an Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Using Ethereal test email account:', testAccount.user);
  }

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });

    // Log preview URL for Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Email preview URL:', previewUrl);
    }

    return info;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    // Don't throw — email failure shouldn't block registration
    return null;
  }
}

export async function sendWelcomeEmail(member) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏋️ Welcome to GymCore!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Your fitness journey starts here</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="color: #1e293b; margin-top: 0;">Hi ${member.fullName}! 👋</h2>
        <p style="color: #475569; line-height: 1.6;">
          You've been registered as a member. Here are your details:
        </p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #334155;"><strong>Email:</strong> ${member.email}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Member ID:</strong> ${member.id}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>QR Code:</strong> ${member.qrCode}</p>
        </div>
        <p style="color: #475569; line-height: 1.6;">
          You can use your QR code or barcode for quick check-in at the gym. See you there! 💪
        </p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
        © ${new Date().getFullYear()} GymCore. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: member.email,
    subject: '🏋️ Welcome to GymCore — Your Membership is Active!',
    html,
  });
}
