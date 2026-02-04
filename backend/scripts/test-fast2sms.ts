
import dotenv from 'dotenv';
dotenv.config();

// Key provided by user
const FAST2SMS_API_KEY = 'I2M0PWgVjA9cqOvmhzQtn4B6GDZlybsLxCaJXH3EoriR7dwFSeMOW6XkPQ58NxYdH0LUmhzKqRaurlwD';

const testFast2SMS = async () => {
    const phone = process.argv[2];

    if (!phone) {
        console.error('❌ Please provide a phone number');
        process.exit(1);
    }

    console.log(`🧪 Testing Fast2SMS (GET) for ${phone}...`);

    try {
        const otp = '123456';

        // Construct Query Params for Quick SMS (Fallback)
        const params = new URLSearchParams({
            authorization: FAST2SMS_API_KEY,
            route: 'q',
            message: 'Your Skillpal verification code is 123456',
            language: 'english',
            flash: '0',
            numbers: phone
        });

        const url = `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`;
        console.log('📦 Request URL:', url.replace(FAST2SMS_API_KEY, 'HIDDEN_KEY'));

        const response = await fetch(url, {
            method: 'GET'
        });

        const data = await response.json() as any;
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
