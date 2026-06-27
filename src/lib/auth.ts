import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb';
import User from '@/models/User';

export async function verifyAuth(request: Request) {
  try {
    // Get cookie from request
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      console.log('No cookie header found');
      return null;
    }

    // Parse cookies
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookies[key] = decodeURIComponent(value);
      }
    });

    const token = cookies.token;
    if (!token) {
      console.log('No token found in cookies');
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    if (!decoded.userId) {
      console.log('Invalid token: no userId');
      return null;
    }

    // Connect to database
    await connectToDatabase();

    // Find user with password excluded
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('User not found');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Helper to set auth cookie
export function setAuthCookie(token: string) {
  return {
    'Set-Cookie': `token=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
  };
}

// Helper to clear auth cookie
export function clearAuthCookie() {
  return {
    'Set-Cookie': `token=; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=0; Path=/`,
  };
}