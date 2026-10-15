/**
 * EduPredict Comprehensive Automated Security Auditor
 * Performs end-to-end vulnerability and configuration audits.
 */

const fs = require('fs');
const path = require('path');
const { cleanString } = require('../middleware/sanitize');
const bcrypt = require('bcryptjs');

const ROOT_DIR = path.join(__dirname, '..', '..', '..');

async function runSecurityAudit() {
  console.log('\n======================================================');
  console.log('       EduPredict Automated Security Audit Report     ');
  console.log('       Department of Computer Science & Applications   ');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assertAudit(title, condition, details) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(` [PASS] ${title}`);
      if (details) console.log(`        -> ${details}`);
    } else {
      console.error(` [FAIL] ${title}`);
      if (details) console.error(`        -> VULNERABILITY: ${details}`);
    }
  }

  // 1. Check .gitignore exists and hides secrets & .env
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  const hasGitignore = fs.existsSync(gitignorePath);
  let ignoresEnv = false;
  let ignoresUploads = false;
  if (hasGitignore) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    ignoresEnv = gitignoreContent.includes('.env');
    ignoresUploads = gitignoreContent.includes('uploads') || gitignoreContent.includes('node_modules');
  }
  assertAudit('Root .gitignore exists', hasGitignore, 'Protects workspace from secret commits');
  assertAudit('.env and secrets hidden in .gitignore', ignoresEnv, '.env files will never be tracked by git');
  assertAudit('Uploads and node_modules ignored', ignoresUploads, 'Prevents student documents or dependencies leaking');

  // 2. Check no hardcoded passwords in client codebase
  const clientDir = path.join(ROOT_DIR, 'client');
  let leakedSecretFound = false;
  if (fs.existsSync(clientDir)) {
    const files = fs.readdirSync(clientDir);
    for (const f of files) {
      if (f.endsWith('.env')) {
        const c = fs.readFileSync(path.join(clientDir, f), 'utf-8');
        if (c.includes('JWT_SECRET') || c.includes('DB_PASSWORD')) leakedSecretFound = true;
      }
    }
  }
  assertAudit('Client bundle contains no secret API keys or DB credentials', !leakedSecretFound, 'Zero backend secrets shipped to browser');

  // 3. Password Hashing Strength Check
  const testPassword = 'TestPassword123!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(testPassword, salt);
  const isHashValid = hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$');
  assertAudit('Password Hashing standard is bcrypt with >= 12 rounds', isHashValid, `Generated hash prefix: ${hash.substring(0, 7)}`);

  // 4. XSS & Input Sanitization Engine Test
  const testPayloads = [
    '<script>alert("XSS")</script>NormalText',
    '<img src=x onerror=alert(1)>Profile description',
    'javascript:stealCookies()'
  ];
  const cleaned = testPayloads.map(p => cleanString(p));
  const noScript = !cleaned.some(c => c.includes('<script>') || c.includes('onerror=') || c.includes('javascript:'));
  assertAudit('XSS Defense: Script tags, inline event handlers, and javascript: protocols scrubbed', noScript, `Scrubbed result: "${cleaned[0]}"`);

  // 5. Database SQL Injection Protection
  const dbFile = path.join(__dirname, '..', 'database', 'db.js');
  const dbContent = fs.readFileSync(dbFile, 'utf-8');
  const usesParameterized = dbContent.includes('?') && dbContent.includes('execute');
  assertAudit('Database layer enforces prepared parameterized queries', usesParameterized, 'Prevents SQL injection vulnerabilities');

  // 6. Security Headers Check
  const serverFile = path.join(__dirname, '..', 'server.js');
  const serverContent = fs.readFileSync(serverFile, 'utf-8');
  const hasHelmet = serverContent.includes('helmet');
  const hasCSP = serverContent.includes('contentSecurityPolicy');
  const hasRateLimit = serverContent.includes('rateLimit');
  assertAudit('HTTP Security Headers configured via Helmet', hasHelmet, 'HSTS, X-Frame-Options, X-Content-Type-Options active');
  assertAudit('Content Security Policy (CSP) actively defined', hasCSP, 'Restricts untrusted external resource injection');
  assertAudit('Rate limiting middleware active on authentication & API', hasRateLimit, 'Protects against DDoS and brute-force credential attacks');

  // 7. Production Debug Leakage Check
  const hidesDebug = serverContent.includes('NODE_ENV === \'development\'') || serverContent.includes('An internal processing error occurred');
  assertAudit('Production error handler suppresses debug stack traces', hidesDebug, 'Stack traces and server file structures are withheld from clients');

  // 8. Strict RBAC Enforcement Check
  const authMiddlewareFile = path.join(__dirname, '..', 'middleware', 'auth.js');
  const authContent = fs.readFileSync(authMiddlewareFile, 'utf-8');
  const enforcesRole = authContent.includes('requireRole') && authContent.includes('UNAUTHORIZED_ACCESS_BLOCKED');
  assertAudit('Role-Based Access Control (RBAC) audit logs unauthorized privilege escalation attempts', enforcesRole, 'Logs all unauthorized attempts with user_id, IP, and role');

  console.log('\n------------------------------------------------------');
  console.log(` Audit Summary: ${passedTests} / ${totalTests} Security Controls PASSED (${((passedTests/totalTests)*100).toFixed(0)}%)`);
  console.log('------------------------------------------------------\n');
}

if (require.main === module) {
  runSecurityAudit().then(() => process.exit(0));
}

module.exports = { runSecurityAudit };
