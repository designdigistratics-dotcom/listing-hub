import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS || '24', 10);

export const createToken = (userId: string, role: string): string => {
    const payload: JwtPayload = {
        userId,
        role,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: `${JWT_EXPIRATION_HOURS}h`,
    });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch {
        return null;
    }
};
