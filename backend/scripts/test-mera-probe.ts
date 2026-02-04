
import dotenv from 'dotenv';
dotenv.config();

const testMeraOtp = async () => {
    const apiKey = process.env.MERA_OTP_API_KEY;
    const phone = process.argv[2];

    console.log('🧪 Probing MeraOTP Endpoints...');

    if (!apiKey || !phone) {
        console.error('❌ Missing API KEY or Phone');
        process.exit(1);
    }

    const payloadObj = {
        apiKey,
        mobileNo: phone,
        messageType: 'AUTH_OTP',
        brandName: process.env.MERA_OTP_BRAND_NAME || 'SkillPal',
        otp: '123456',
        senderId: process.env.MERA_OTP_SENDER_ID || 'MRAOTP'
    };

    // Helper to log response
    const logResp = async (label: string, resp: Response) => {
        const ct = resp.headers.get('content-type') || '';
        console.log(`\n--- ${label} ---`);
        console.log(`Status: ${resp.status}`);
        if (ct.includes('json')) {
            console.log(await resp.json());
        } else {
            const txt = await resp.text();
            console.log(`Text: ${txt.substring(0, 200)}...`);
        }
    };

    try {
        // 1. JSON POST (Standard)
        const res1 = await fetch('https://meraotp.in/api/sendSMS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'PostmanRuntime/7.32.0' // Try generic UA
            },
            body: JSON.stringify(payloadObj)
        });
        await logResp('JSON POST', res1);

        // 2. FORM POST (UrlEncoded)
        const params = new URLSearchParams();
        Object.entries(payloadObj).forEach(([k, v]) => params.append(k, v));

        const res2 = await fetch('https://meraotp.in/api/sendSMS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            },
            body: params
        });
        await logResp('FORM POST', res2);

        // 3. GET with Query Params
        const res3 = await fetch(`https://meraotp.in/api/sendSMS?${params.toString()}`, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        await logResp('GET Query', res3);

        // 4. Try www subdomain
        const res4 = await fetch('https://www.meraotp.in/api/sendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadObj)
        });
        await logResp('JSON POST (www)', res4);

    } catch (error) {
        console.error('💥 Error:', error);
    }
};

testMeraOtp();
