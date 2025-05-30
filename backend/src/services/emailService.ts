import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Sender address
      to: options.to, // List of receivers
      subject: options.subject, // Subject line
      text: options.text, // Plain text body
      html: options.html, // HTML body
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const sendVerificationEmail = async (userEmail: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const subject = 'Verify Your Email Address';
  const text = `Please verify your email address by clicking on the following link, or by pasting it into your browser: \n\n${verificationLink}\n\nThis link will expire in 15 minutes. If you did not request this, please ignore this email.`;
  const html = `
    <p>Please verify your email address by clicking on the link below:</p>
    <p><a href="${verificationLink}">${verificationLink}</a></p>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not create an account, no further action is required.</p>
  `;

  await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  });

  };

export const sendPasswordResetEmail = async (userEmail: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const subject = 'Password Reset Request';
  const text = `You requested a password reset. Click the link to reset your password: \n\n${resetLink}\n\nThis link will expire in 15 minutes. If you did not request this, please ignore this email.`;
  const html = `
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `;

  await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  });

  };