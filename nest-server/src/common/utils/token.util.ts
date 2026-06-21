import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/jwt.constant';

export interface TokenPayload {
  id: string;
  userName: string;
  roleList: string;
}

export function verifyTokenFromRequest(req: Request): TokenPayload | null {
  const token = req.headers['authorization'];
  if (!token || typeof token !== 'string') return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
