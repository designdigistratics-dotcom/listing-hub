
import dotenv from 'dotenv';
dotenv.config();

const FAST2SMS_API_KEY = 'I2M0PWgVjA9cqOvmhzQtn4B6GDZlybsLxCaJXH3EoriR7dwFSeMOW6XkPQ58NxYdH0LUmhzKqRaurlwD';

const testFast2SMS = async () => {
    const phone = process.argv[2];

    if (!phone) {
        console.error('❌ Please provide a phone number');
        process.exit(1);
    }

    console.log(`🧪 Testing Fast2SMS for ${phone}...`);

    try {
        const payload = {
            authorization: FAST2SMS_API_KEY,
            route: 'q', // Quick SMS route (good for testing)
            message: 'Your Skillpal verification code is 123456',
            language: 'english',
            flash: 0,
            numbers: phone,
        };

        console.log('📦 Sending Payload:', JSON.stringify(payload, null, 2));

        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('📥 Response Status:', response.status);
        console.log('📄 Response Body:', JSON.stringify(data, null, 2));

        if (data.return) {
            console.log('✅ Success!');
        } else {
            console.log('❌ Failed:', data.message);
        }

    } catch (error) {
        console.error('💥 Error:', error);
    }
};

testFast2SMS();
