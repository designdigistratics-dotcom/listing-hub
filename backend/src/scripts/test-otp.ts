
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root of backend
dotenv.config({ path: path.join(process.cwd(), '.env') });

const testMeraOTP = async () => {
    const apiKey = process.env.MERA_OTP_API_KEY;
    const brandName = process.env.MERA_OTP_BRAND_NAME || 'SkillPal';
    const testPhone = process.argv[2];

    if (!apiKey) {
        console.error('Error: MERA_OTP_API_KEY not found in .env');
        process.exit(1);
    }

    if (!testPhone || !/^\d{10}$/.test(testPhone)) {
        console.error('Usage: npx ts-node src/scripts/test-otp.ts <10-digit-phone>');
        process.exit(1);
    }

    console.log(`Testing MeraOTP with Brand: ${brandName}, Phone: ${testPhone}`);

    try {
        const response = await fetch('https://meraotp.in/api/sendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                mobileNo: testPhone,
                messageType: 'AUTH_OTP',
                brandName,
                otp: '123456',
                senderId: 'MRAOTP'
            })
        });

        const data: any = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok && (data.status === 'Success' || data.success === true)) {
            console.log('SUCCESS: OTP request sent successfully!');
        } else {
            console.log('FAILURE: API returned an error.');
        }
    } catch (error) {
        console.error('ERROR: Network or unexpected error:', error);
    }
};

testMeraOTP();
