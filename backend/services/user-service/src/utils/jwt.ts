import jwt, {Secret} from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface IJWTPayload {
  userId: string;
  email: string;
  plan: string;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

export const generateToken = (user: IUser): string => {
  const payload: IJWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    plan: user.plan,
    apiCallsUsed: user.apiCallsUsed,
    apiCallsLimit: user.apiCallsLimit
  };

  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): IJWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as IJWTPayload;
  } catch (error) {
    return null;
  }
};
