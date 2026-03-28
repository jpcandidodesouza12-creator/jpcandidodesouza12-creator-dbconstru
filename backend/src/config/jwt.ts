// backend/src/config/jwt.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET         = process.env.JWT_SECRET!
const JWT_EXPIRES_IN     = process.env.JWT_EXPIRES_IN     || '15m'
const REFRESH_SECRET     = process.env.REFRESH_TOKEN_SECRET!
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

export interface JwtPayload {
  sub: string   // user id
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string }
}
