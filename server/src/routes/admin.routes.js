/**
 * EduPredict Administration Portal Routes
 * STRICT SECURITY: Protected by `requireRole(['admin'])`.
 * Any attempt by non-admins to call these endpoints immediately logs an audit violation
 * and responds with 403 Forbidden.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Strict Admin Gate
router.use(verifyToken, requireRole(['admin']));

// 1. Get Administrative Overview & System Health
router.get('/overview', async (req, res) => {
  try {
    const allUsers = await db.users.list();
    const students = allUsers.filter(u => u.role === 'student');
    const teachers = allUsers.filter(u => u.role === 'teacher');
    const assessments = await db.assessments.list();
    const documents = await db.documents.listAll();
    const depts = await db.institution.getDepartments();
    const courses = await db.institution.getCourses();
    const batches = await db.institution.getBatches();

    const pendingDocs = documents.filter(d => d.status === 'pending').length;
    const verifiedDocs = documents.filter(d => d.status === 'verified').length;

    // Fetch placement readiness breakdown
    const studentsWithPredictions = await Promise.all(students.map(async (s) => {
      return db.predictions.findLatestByStudentId(s.id);
    }));

    const validPredictions = studentsWithPredictions.filter(Boolean);
    const placedCount = validPredictions.filter(p => p.placement_outcome === 'Placed').length;
    const avgProbability = validPredictions.length 
      ? Number((validPredictions.reduce((acc, p) => acc + Number(p.placement_probability), 0) / validPredictions.length).toFixed(1)) 
      : 0;

    return res.json({
      success: true,
      stats: {
        total_students: students.length,
        total_teachers: teachers.length,
        total_departments: depts.length,
        total_courses: courses.length,
        total_batches: batches.length,
        total_assessments: assessments.length,
        documents_summary: {
          total: documents.length,
          pending: pendingDocs,
          verified: verifiedDocs,
          verification_rate_percent: documents.length ? Number(((verifiedDocs / documents.length) * 100).toFixed(1)) : 0
        },
        placement_summary: {
          predicted_students: validPredictions.length,
          predicted_placed: placedCount,
          average_placement_probability: avgProbability
        }
      }
    });
  } catch (err) {
    console.error('[ADMIN] Overview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve administrative overview.' });
  }
});

// 2. User Management: List Users
router.get('/users', async (req, res) => {
  try {
    const roleFilter = req.query.role;
    const users = await db.users.list({ role: roleFilter });
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve user list.' });
  }
});

// 3. User Management: Onboard Single User
router.post('/users', async (req, res) => {
  try {
    const { name, email, prn, role, department_id, course_id, batch_id, password } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required fields.' });
    }

    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student, teacher, or admin.' });
    }

    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const rawPassword = password || 'EduPredict@2026';
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(rawPassword, salt);

    const newUser = await db.users.create({
      name,
      email,
      prn: prn || null,
      role,
      department_id: department_id ? Number(department_id) : null,
      course_id: course_id ? Number(course_id) : null,
      batch_id: batch_id ? Number(batch_id) : null,
      password_hash,
      status: 'active'
    });

    if (role === 'student') {
      await db.studentProfiles.upsert(newUser.id, {
        tenth_percent: 0,
        twelfth_percent: 0,
        cgpa: 0,
        attendance_percent: 100,
        skills: [],
        projects: [],
        certifications: [],
        internships: [],
        is_profile_verified: false
      });
    }

    await db.audit.log({
      user_id: req.user.id,
      role: 'admin',
      action: 'ADMIN_USER_CREATED',
      endpoint: '/api/admin/users',
      ip_address: req.ip || '127.0.0.1',
      status_code: 201,
      details: `Admin created ${role} user: ${name} (${email})`
    });

    const { password_hash: ph, ...safe } = newUser;
    return res.status(201).json({
      success: true,
      message: `User ${name} successfully created.`,
      user: safe
    });
  } catch (err) {
    console.error('[ADMIN] Create user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to onboard user.' });
  }
});

// 4. Excel / Bulk CSV User Onboarding Simulation (Synopsis 1.5.2)
router.post('/bulk-onboard', async (req, res) => {
  try {
    const { users } = req.body; // Array of { name, email, prn, role }
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Must supply an array of user rows for bulk onboarding.' });
    }

    const salt = await bcrypt.genSalt(12);
    const defaultHash = await bcrypt.hash('EduPredict@2026', salt);

    const createdUsers = [];
    const errors = [];

    for (let i = 0; i < users.length; i++) {
      const row = users[i];
      try {
        if (!row.email || !row.name) {
          errors.push(`Row ${i + 1}: Missing name or email.`);
          continue;
        }

        const existing = await db.users.findByEmail(row.email);
        if (existing) {
          errors.push(`Row ${i + 1}: Email ${row.email} already registered.`);
          continue;
        }

        const role = ['teacher', 'admin'].includes(row.role) ? row.role : 'student';
        const u = await db.users.create({
          name: row.name,
          email: row.email,
          prn: row.prn || null,
          role,
          department_id: row.department_id ? Number(row.department_id) : 1,
          course_id: row.course_id ? Number(row.course_id) : 1,
          batch_id: row.batch_id ? Number(row.batch_id) : 1,
          password_hash: defaultHash,
          status: 'active'
        });

        if (role === 'student') {
          await db.studentProfiles.upsert(u.id, {
            tenth_percent: row.tenth_percent || 0,
            twelfth_percent: row.twelfth_percent || 0,
            cgpa: row.cgpa || 0,
            attendance_percent: 100,
            skills: row.skills || [],
            projects: [],
            certifications: [],
            internships: [],
            is_profile_verified: false
          });
        }
        createdUsers.push(u.name);
      } catch (rowErr) {
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
      }
    }

    await db.audit.log({
      user_id: req.user.id,
      role: 'admin',
      action: 'BULK_USER_ONBOARDING',
      endpoint: '/api/admin/bulk-onboard',
      ip_address: req.ip || '127.0.0.1',
      status_code: 200,
      details: `Bulk onboarded ${createdUsers.length} users. Errors: ${errors.length}`
    });

    return res.json({
      success: true,
      message: `Bulk onboarding completed. ${createdUsers.length} user(s) successfully created.`,
      created_count: createdUsers.length,
      errors
    });
  } catch (err) {
    console.error('[ADMIN] Bulk onboard error:', err);
    return res.status(500).json({ success: false, message: 'Bulk processing failed.' });
  }
});

// 5. Institutional Structure Management
router.get('/structure', async (req, res) => {
  try {
    const departments = await db.institution.getDepartments();
    const courses = await db.institution.getCourses();
    const batches = await db.institution.getBatches();

    return res.json({
      success: true,
      data: { departments, courses, batches }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load institutional structure.' });
  }
});

router.post('/department', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Department name and code required.' });
    const dept = await db.institution.createDepartment({ name, code });
    return res.status(201).json({ success: true, message: 'Department created.', department: dept });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
});

router.post('/course', async (req, res) => {
  try {
    const { department_id, name, code } = req.body;
    if (!department_id || !name || !code) return res.status(400).json({ success: false, message: 'Department, name, and code required.' });
    const course = await db.institution.createCourse({ department_id, name, code });
    return res.status(201).json({ success: true, message: 'Course created.', course });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { course_id, academic_year, year_number, semester_number, batch_name } = req.body;
    if (!course_id || !academic_year || !batch_name) return res.status(400).json({ success: false, message: 'Course, academic year, and batch name required.' });
    const batch = await db.institution.createBatch({ course_id, academic_year, year_number, semester_number, batch_name });
    return res.status(201).json({ success: true, message: 'Batch created.', batch });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create batch.' });
  }
});

// 6. Security & Audit Logs Viewer
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = await db.audit.getRecent(limit);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
});

module.exports = router;
