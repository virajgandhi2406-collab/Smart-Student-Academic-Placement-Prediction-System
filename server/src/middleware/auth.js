/**
 * EduPredict Authentication & Role-Based Access Control (RBAC) Middleware
 * Enforces stateless JWT validation, token expiry, and strict role permissions.
 */

const jwt = require('jsonwebtoken');
const { db } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'edupredict_super_secure_jwt_secret_mitwpu_2026';

/**
 * Verify JWT Token from Authorization header
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No authentication token provided in request.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid token format. Format must be "Bearer <token>".'
    });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name, prn }
    next();
  } catch (err) {
    db.audit.log({
      action: 'INVALID_TOKEN_ATTEMPT',
      endpoint: req.originalUrl,
      ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
      status_code: 401,
      details: `JWT Verification Failed: ${err.message}`
    });

    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid authentication token. Please log in again.'
    });
  }
}

/**
 * Enforce Role-Based Access Control (RBAC)
 * @param {string|string[]} allowedRoles
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized privilege escalation attempt
      db.audit.log({
        user_id: req.user.id,
        role: req.user.role,
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        endpoint: req.originalUrl,
        ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
        status_code: 403,
        details: `User with role "${req.user.role}" attempted to access restricted endpoint requiring [${roles.join(', ')}]`
      });

      return res.status(403).json({
        success: false,
        message: `Forbidden: Your account role (${req.user.role}) is not authorized to access this resource.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET
};
