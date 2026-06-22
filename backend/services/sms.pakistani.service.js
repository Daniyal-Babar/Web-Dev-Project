/**
 * Pakistani SMS Gateway Service
 * Using Sparrow SMS or similar local provider
 */

const axios = require('axios');

const SMS_API_URL = process.env.SMS_API_URL || 'https://api.sparrowsms.com/v2/sms';
const SMS_API_TOKEN = process.env.SMS_API_TOKEN;
const SMS_FROM = process.env.SMS_FROM || 'RentalApp';

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Pakistani SMS Gateway
 * @param {string} phoneNumber - Pakistani phone number (03XXXXXXXXX)
 * @param {string} otp - 6-digit OTP
 */
const sendOTP = async (phoneNumber, otp) => {
  try {
    // Format phone number for Pakistani gateway
    const formattedNumber = phoneNumber.startsWith('0') 
      ? phoneNumber 
      : '0' + phoneNumber;

    const message = `Your Rental Marketplace OTP is: ${otp}. Valid for 5 minutes. Do not share.`;

    const response = await axios.post(
      SMS_API_URL,
      {
        token: SMS_API_TOKEN,
        from: SMS_FROM,
        to: formattedNumber,
        text: message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('OTP sent successfully:', response.data);
    return {
      success: true,
      messageId: response.data.id || response.data.message_id,
      to: formattedNumber
    };
  } catch (error) {
    console.error('SMS Gateway error:', error.response?.data || error.message);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

/**
 * Send OTP for payment verification
 */
const sendPaymentOTP = async (phoneNumber) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await sendOTP(phoneNumber, otp);

  return {
    otp,
    expiresAt,
    phoneNumber
  };
};

module.exports = {
  generateOTP,
  sendOTP,
  sendPaymentOTP
};
