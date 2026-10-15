/**
 * EduPredict: Smart Student Academic & Placement Prediction System
 * MIT World Peace University - First Year M.Sc Computer Science (2026-27)
 * Hardened Express Backend Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { initializeDatabase, db } = require('./database/db');
const { seedDatabase } = require('./database/seed');
const { sanitizeInput } = require('./middleware/sanitize');

// Route imports
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require('./routes/admin.routes');
const commonRoutes = require('./routes/common.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:8000', 'http://127.0.0.1:8000']
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Access from this origin is restricted.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Body Parsers with safe payload size limit (mitigates DoS memory exhaustion)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Global Input Sanitization (Strips XSS tags & pseudo-protocols)
app.use(sanitizeInput);

// 5. Rate Limiting Protection
// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please slow down and try again later.'
  }
});
app.use('/api/', generalLimiter);

// Strict Rate Limiter for Authentication (prevents brute-force credential stuffing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 login/register requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
  }
});
app.use('/api/auth/', authLimiter);

// 6. Secure Uploads Serving
app.use(
  '/uploads',
  (req, res, next) => {
    // Prevent MIME-confusion attacks and script execution
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  },
  express.static(UPLOAD_DIR)
);

// 7. Health & Security Verification Ping
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'EduPredict Placement Engine API',
    institution: 'MIT World Peace University',
    group: 'Group 13 - M.Sc Computer Science',
    timestamp: new Date().toISOString(),
    security: {
      headers_active: true,
      rate_limiting: true,
      xss_sanitization: true,
      rbac_enforced: true,
      database_mode: db.isMySQL() ? 'MySQL' : 'Atomic Local JSON Store'
    }
  });
});

// 8. Register Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/common', commonRoutes);

// 9. 404 Handler for Unrecognized Endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.method} ${req.originalUrl}" does not exist.`
  });
});

// 10. Centralized Production Error Handler (Hides debug stack traces)
app.use((err, req, res, next) => {
  // Log securely to audit trail
  db.audit.log({
    action: 'UNHANDLED_SERVER_ERROR',
    endpoint: req.originalUrl,
    ip_address: req.ip || '127.0.0.1',
    status_code: 500,
    details: err.message
  });

  console.error('[SERVER ERROR]', err.message);

  // In production/debug-off mode, never leak stack trace or internal filenames
  res.status(err.status || 500).json({
    success: false,
    message: NODE_ENV === 'development' ? err.message : 'An internal processing error occurred. Please try again later.'
  });
});

// 11. Server Startup Sequence
async function startServer() {
  try {
    await initializeDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log('======================================================');
      console.log(` EduPredict Server running on http://localhost:${PORT}`);
      console.log(` Environment: ${NODE_ENV} | Rate Limiting: Active`);
      console.log(` RBAC Protection: Active (Admin / Teacher / Student)`);
      console.log('======================================================');
    });
  } catch (err) {
    console.error('[FATAL] Failed to initialize EduPredict Server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
