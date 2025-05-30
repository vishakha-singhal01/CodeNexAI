import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user
    pass: process.env.SMTP_PASS,  // generated ethereal password
  },
});

export const sendVerificationEmail = async (userEmail: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Verify your email',
    html: `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (userEmail: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Reset your password',
    html: `<p>Please click this link to verify your email: <a href="${resetLink}">${resetLink}</a></p>`,
  };

  console.log('Sending password reset email to:', userEmail);
  console.log('Reset link:', resetLink);
  console.log('Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
