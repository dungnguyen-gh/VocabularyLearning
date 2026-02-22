import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function setAuthCookie(res: NextApiResponse, token: string): void {
  const isDev = process.env.NODE_ENV === 'development';
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${isDev ? '' : 'Secure; '}SameSite=Strict`);
}

export function clearAuthCookie(res: NextApiResponse): void {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  
  const tokenMatch = cookie.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

export function getUserFromRequest(req: NextApiRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse): TokenPayload | null {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}
