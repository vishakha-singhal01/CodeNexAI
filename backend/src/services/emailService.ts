import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendVerificationEmail = async (userEmail: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const sendSmtpEmail = {
    to: [{ email: userEmail }],
    templateId: 4, // Replace with your Brevo template ID for email verification
    params: {
      VERIFICATION_LINK: verificationLink,
    },
    headers: {
      'X-Mailin-custom': 'custom_header_1:custom_value_1 | custom_header_2:custom_value_2',
    },
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (userEmail: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const sendSmtpEmail = {
    to: [{ email: userEmail }],
    templateId: 5, // Replace with your Brevo template ID for password reset
    params: {
      RESET_LINK: resetLink,
    },
    headers: {
      'X-Mailin-custom': 'custom_header_1:custom_value_1 | custom_header_2:custom_value_2',
    },
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
