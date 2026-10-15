/**
 * EduPredict Input Sanitization and XSS Defense Middleware
 * Automatically scrubs potentially malicious HTML, scripts, and injection payloads.
 */

function cleanString(str) {
  if (typeof str !== 'string') return str;
  return str
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove javascript: pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    // Remove inline JS events (e.g. onload=, onerror=, onclick=)
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' ? sanitizeObject(item) : cleanString(item)));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Preserve password fields intact to avoid mangling valid complex user passwords
    if (key.toLowerCase().includes('password')) {
      cleaned[key] = value;
    } else if (typeof value === 'string') {
      cleaned[key] = cleanString(value);
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

module.exports = {
  sanitizeInput,
  cleanString
};
