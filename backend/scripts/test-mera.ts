
import dotenv from 'dotenv';
dotenv.config();

const testMeraOtp = async () => {
    const apiKey = process.env.MERA_OTP_API_KEY;
    const phone = process.argv[2]; // Get phone from command line args

    console.log('🧪 Testing MeraOTP...');
    console.log(`🔑 API Key Present: ${!!apiKey}`);
    if (apiKey) console.log(`🔑 API Key: ${apiKey.substring(0, 4)}...`);

    if (!phone) {
        console.error('❌ Please provide a phone number as argument: npx ts-node scripts/test-mera.ts <phone>');
        process.exit(1);
    }

    if (!apiKey) {
        console.error('❌ MERA_OTP_API_KEY is missing in .env');
        process.exit(1);
    }

    console.log(`📱 Sending test OTP to ${phone}...`);

    try {
        const payload = {
            apiKey,
            mobileNo: phone,
            messageType: 'AUTH_OTP',
            brandName: process.env.MERA_OTP_BRAND_NAME || 'SkillPal',
            otp: '123456',
            senderId: process.env.MERA_OTP_SENDER_ID || 'MRAOTP'
        };

        console.log('📦 Request Payload:', JSON.stringify(payload, null, 2));

        const response = await fetch('https://meraotp.in/api/sendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const validContentType = response.headers.get('content-type')?.includes('application/json');

        if (validContentType) {
            const data = await response.json();
            console.log('📥 Response Status:', response.status);
            console.log('📄 Response Body:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('📥 Response Status:', response.status);
            console.log('📄 Response Body (Text):', text.substring(0, 500)); // First 500 chars
            console.error('❌ Expected JSON but got HTML/Text. The endpoint might be wrong.');
        }

    } catch (error) {
        console.error('💥 Error:', error);
    }
};

testMeraOtp();
