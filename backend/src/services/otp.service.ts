import prisma from '../utils/prisma';
import { addMinutes } from 'date-fns';

// ==================== OTP Service ====================

/**
 * Generate a random 6-digit OTP
 */
const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to a phone number
 * In development, logs OTP to console. In production, integrate with SMS provider.
 */
export const sendOtp = async (phone: string) => {
    // Validate phone number (10 digits for India)
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
        throw new Error('Invalid phone number. Please enter a 10-digit mobile number.');
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = addMinutes(new Date(), 5); // 5 minutes expiry

    // Upsert OTP record (replace if exists)
    await prisma.otpRecord.upsert({
        where: { phone: cleanPhone },
        update: {
            otp,
            expiresAt,
            verified: false,
        },
        create: {
            phone: cleanPhone,
            otp,
            expiresAt,
            verified: false,
        },
    });

    // In production, send OTP via SMS provider (MeraOTP)
    // We also send if explicitly enabled or if in production
    const isProduction = process.env.NODE_ENV === 'production';
    const otpEnabled = process.env.ENABLE_OTP === 'true' || isProduction;

    if (otpEnabled) {
        try {
            const apiKey = process.env.MERA_OTP_API_KEY;
            const brandName = process.env.MERA_OTP_BRAND_NAME || 'SkillPal';
            const senderId = process.env.MERA_OTP_SENDER_ID || 'MRAOTP';

            if (!apiKey) {
                console.error('MERA_OTP_API_KEY is not set in environment variables');
                if (isProduction) {
                    console.log(`[production-fallback] OTP for ${cleanPhone}: ${otp}`);
                    return { message: 'OTP generated (SMS provider not configured)' };
                } else {
                    console.log(`[DEV] OTP for ${cleanPhone}: ${otp}`);
                    return { message: 'OTP logged to console (No API key)' };
                }
            }

            const response = await fetch('https://meraotp.in/api/sendSMS', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey,
                    mobileNo: cleanPhone,
                    messageType: 'AUTH_OTP',
                    brandName,
                    otp,
                    senderId
                })
            });

            const data: any = await response.json();

            if (response.ok && (data.status === 'Success' || data.success === true)) {
                console.log(`OTP sent successfully to ${cleanPhone} via MeraOTP`);
            } else {
                console.error('MeraOTP Error Response:', data);
                // In non-production, we fallback to console so testing doesn't break
                if (!isProduction) {
                    console.log(`[DEV-FALLBACK] OTP for ${cleanPhone}: ${otp}`);
                } else {
                    throw new Error(data.message || 'Failed to send SMS via provider');
                }
            }
        } catch (error) {
            console.error('SMS Sending System Error:', error);
            if (!isProduction) {
                console.log(`[DEV-SYSTEM-ERROR-FALLBACK] OTP for ${cleanPhone}: ${otp}`);
            }
        }
    } else {
        // Development mode: Log to console
        console.log(`[DEV] OTP for ${cleanPhone}: ${otp}`);
    }

    return { message: 'OTP sent successfully' };
};

/**
 * Verify OTP for a phone number
 */
export const verifyOtp = async (phone: string, otp: string) => {
    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
        throw new Error('Invalid OTP format');
    }

    // Find OTP record
    const record = await prisma.otpRecord.findFirst({
        where: {
            phone: cleanPhone,
            otp: cleanOtp,
        },
    });

    if (!record) {
        throw new Error('Invalid OTP');
    }

    // Check if expired
    if (new Date() > record.expiresAt) {
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Mark as verified
    await prisma.otpRecord.update({
        where: { id: record.id },
        data: { verified: true },
    });

    return { message: 'OTP verified successfully', verified: true };
};

/**
 * Check if a phone number has been recently verified (within 30 minutes)
 */
export const isPhoneVerified = async (phone: string): Promise<boolean> => {
    const cleanPhone = phone.trim();
    const thirtyMinutesAgo = addMinutes(new Date(), -30);

    const record = await prisma.otpRecord.findFirst({
        where: {
            phone: cleanPhone,
            verified: true,
            createdAt: { gte: thirtyMinutesAgo },
        },
    });

    return !!record;
};

/**
 * Clear OTP verification after successful lead submission
 */
export const clearOtpVerification = async (phone: string) => {
    const cleanPhone = phone.trim();
    await prisma.otpRecord.deleteMany({
        where: { phone: cleanPhone },
    });
};
