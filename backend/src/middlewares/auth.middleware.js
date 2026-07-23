import { verifyAccessToken } from '../utils/jwt.util.js';
import User from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'AUTH_TOKEN_MISSING');
    }

    const token = header.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError('Session expired, please sign in again', 401, 'AUTH_TOKEN_EXPIRED');
    }

    const user = await User.findById(payload.sub).populate('role');
    if (!user || user.status !== 'active') {
      throw new AppError('Account not active', 403, 'ACCOUNT_INACTIVE');
    }

    req.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
      organizationId: user.organizationId,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * optionalAuthenticate — for routes like Sightings that accept both
 * authenticated and anonymous submissions (per the API Specification).
 * If a valid Bearer token is present, req.user is populated exactly like
 * authenticate(); if it's missing or invalid, the request just continues
 * with req.user left undefined instead of failing.
 */
export async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).populate('role');
    if (user && user.status === 'active') {
      req.user = {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        organizationId: user.organizationId,
      };
    }
  } catch {
    // Invalid/expired token on an optional route — treat as anonymous
    // rather than blocking the request.
  }
  next();
}