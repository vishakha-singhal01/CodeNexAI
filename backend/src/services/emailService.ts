import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  // Only proceed if email is provided
  if (!email) {
    console.warn("Attempted to send verification email without an email address.");
    return;
  }

  // Create a nodemailer transporter using your Brevo SMTP credentials
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST, // Brevo SMTP host
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'), // Brevo SMTP port (587 is common, but check your Brevo settings)
    secure: false, // Use `true` if you're using port 465
    auth: {
      user: process.env.BREVO_SMTP_USER, // Your Brevo SMTP username (usually your Brevo email address)
      pass: process.env.BREVO_SMTP_PASSWORD, // Your Brevo SMTP password
    },
  });

  const mailOptions = {
    from: process.env.BREVO_SMTP_USER, // Sender address (must be a verified Brevo sender)
    to: email, // Recipient address
    subject: 'Verify Your Email',
    html: `<p>Please click this link to verify your email: <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">${process.env.FRONTEND_URL}/verify-email/${verificationToken}</a></p>`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error; // Re-throw the error for handling in the calling function
  }
};

export const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  // Only proceed if email is provided
  if (!email) {
    console.warn("Attempted to send reset password email without an email address.");
    return;
  }

  // Create a nodemailer transporter using your Brevo SMTP credentials
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST, // Brevo SMTP host
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'), // Brevo SMTP port (587 is common, but check your Brevo settings)
    secure: false, // Use `true` if you're using port 465
    auth: {
      user: process.env.BREVO_SMTP_USER, // Your Brevo SMTP username (usually your Brevo email address)
      pass: process.env.BREVO_SMTP_PASSWORD, // Your Brevo SMTP password
    },
  });

  const mailOptions = {
    from: process.env.BREVO_SMTP_USER, // Sender address (must be a verified Brevo sender)
    to: email, // Recipient address
    subject: 'Reset Your Password',
    html: `<p>Please click this link to reset your password: <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">${process.env.FRONTEND_URL}/reset-password/${resetToken}</a></p>`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully!');
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw error; // Re-throw the error for handling in the calling function
  }
};
