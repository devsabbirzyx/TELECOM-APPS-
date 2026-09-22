// SMS Service for Bangladeshi Gateways (Alpha SMS, BulkSMSBD) and Development Mock

export const sendOtpSms = async (phoneNumber, otp) => {
  const provider = process.env.SMS_GATEWAY_PROVIDER || 'mock';
  const formattedPhone = phoneNumber.startsWith('+88') ? phoneNumber : `+88${phoneNumber}`;
  const message = `Your OfferHut verification code is: ${otp}. Do not share this OTP with anyone.`;

  console.log(`[SMS Service] Sending OTP to ${formattedPhone} via ${provider}`);

  if (provider === 'mock') {
    // In development mode, log clearly to console for easy testing
    console.log(`\n=========================================`);
    console.log(`📱 [MOCK SMS] To: ${formattedPhone}`);
    console.log(`🔑 OTP Code: ${otp}`);
    console.log(`=========================================\n`);
    return { success: true, provider: 'mock', messageId: `mock_${Date.now()}` };
  }

  if (provider === 'alphasms') {
    try {
      const apiKey = process.env.ALPHA_SMS_API_KEY;
      const response = await fetch('https://api.sms.net.bd/sendsms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          msg: message,
          to: formattedPhone.replace('+', '')
        })
      });
      const data = await response.json();
      return { success: data.error === 0, response: data };
    } catch (err) {
      console.error('[SMS Service] Alpha SMS Error:', err);
      return { success: false, error: err.message };
    }
  }

  if (provider === 'bulksmsbd') {
    try {
      const apiKey = process.env.BULK_SMS_BD_API_KEY;
      const response = await fetch(`http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formattedPhone}&senderid=8809612&message=${encodeURIComponent(message)}`);
      const data = await response.json();
      return { success: data.response_code === 202, response: data };
    } catch (err) {
      console.error('[SMS Service] BulkSMSBD Error:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, provider: 'default' };
};
