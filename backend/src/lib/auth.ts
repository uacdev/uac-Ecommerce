import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export type AuthPayload = { sub: string; email: string };
export type ResetPayload = { sub: string; email: string; purpose: 'password-reset' };
export type CustomerPayload = { sub: string; email: string; purpose: 'customer' };
export type CustomerResetPayload = { sub: string; email: string; purpose: 'customer-password-reset' };

const getSecret = (): string => {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_SECRET is not set');
    return s;
};

const getTtl = (): SignOptions['expiresIn'] =>
    (process.env.JWT_TTL as SignOptions['expiresIn']) || '7d';

export const RESET_TOKEN_TTL: SignOptions['expiresIn'] = '30m';

export const signToken = (payload: AuthPayload): string =>
    jwt.sign(payload, getSecret(), { expiresIn: getTtl() });

export const verifyToken = (token: string): AuthPayload =>
    jwt.verify(token, getSecret()) as AuthPayload;

export const signResetToken = (payload: Omit<ResetPayload, 'purpose'>): string =>
    jwt.sign({ ...payload, purpose: 'password-reset' }, getSecret(), { expiresIn: RESET_TOKEN_TTL });

export const verifyResetToken = (token: string): ResetPayload & { iat: number } => {
    const decoded = jwt.verify(token, getSecret()) as ResetPayload & { iat: number };
    if (decoded.purpose !== 'password-reset') throw new Error('Token is not a password-reset token');
    return decoded;
};

export const CUSTOMER_TOKEN_TTL: SignOptions['expiresIn'] = '30d';

export const signCustomerToken = (payload: Omit<CustomerPayload, 'purpose'>): string =>
    jwt.sign({ ...payload, purpose: 'customer' }, getSecret(), { expiresIn: CUSTOMER_TOKEN_TTL });

export const verifyCustomerToken = (token: string): CustomerPayload & { iat: number } => {
    const decoded = jwt.verify(token, getSecret()) as CustomerPayload & { iat: number };
    if (decoded.purpose !== 'customer') throw new Error('Token is not a customer token');
    return decoded;
};

export const signCustomerResetToken = (payload: Omit<CustomerResetPayload, 'purpose'>): string =>
    jwt.sign({ ...payload, purpose: 'customer-password-reset' }, getSecret(), { expiresIn: RESET_TOKEN_TTL });

export const verifyCustomerResetToken = (token: string): CustomerResetPayload & { iat: number } => {
    const decoded = jwt.verify(token, getSecret()) as CustomerResetPayload & { iat: number };
    if (decoded.purpose !== 'customer-password-reset') throw new Error('Token is not a customer-password-reset token');
    return decoded;
};

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
