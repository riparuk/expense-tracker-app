import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function getAuthUserId(req: NextRequest): number | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7);
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}