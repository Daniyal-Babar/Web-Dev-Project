/**
 * Twilio SMS Service
 * Sends OTP to Pakistani mobile numbers
 */

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Pakistani phone number (03XXXXXXXXX)
 * @param {string} otp - 6-digit OTP
 */
const sendOTP = async (phoneNumber, otp) => {
  try {
    // Convert Pakistani number format to international
    // 03XXXXXXXXX -> +923XXXXXXXXX
    const internationalNumber = phoneNumber.startsWith('0') 
      ? '+92' + phoneNumber.substring(1)
      : '+92' + phoneNumber;

    const message = await client.messages.create({
      body: `Your Rental Marketplace payment verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      from: twilioPhoneNumber,
      to: internationalNumber
    });

    console.log('OTP sent successfully:', message.sid);
    return {
      success: true,
      messageSid: message.sid,
      to: internationalNumber
    };
  } catch (error) {
    console.error('Twilio SMS error:', error);
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
