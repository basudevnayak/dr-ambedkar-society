// lib/auth.js
import jwt from 'jsonwebtoken';

export async function verifyToken(token) {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function withAuth(handler, requiredRole = null) {
  return async (request) => {
    const token = request.cookies.get('token')?.value;
    const user = await verifyToken(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (requiredRole && user.role !== requiredRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    request.user = user;
    return handler(request);
  };
}