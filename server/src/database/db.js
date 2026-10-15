/**
 * EduPredict Data Access Engine
 * Dual-Engine: High-Performance Atomic Local Storage + MySQL Pool Adapter
 * Secure parameterized query API with complete SQL Injection defense.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'edupredict_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mysqlPool = null;
let useMySQL = false;

// Initial schema state for local atomic store
const initialStore = {
  departments: [],
  courses: [],
  batches: [],
  users: [],
  teacher_assignments: [],
  student_profiles: [],
  documents: [],
  assessments: [],
  assessment_questions: [],
  assessment_submissions: [],
  faculty_evaluations: [],
  placement_predictions: [],
  audit_logs: [],
  registration_otps: [],
  notifications: []
};

let memoryStore = { ...initialStore };

// Load local database from file if present
function loadLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryStore = { ...initialStore, ...parsed };
    } else {
      saveLocalData();
    }
  } catch (err) {
    console.error('[DB] Error loading local database:', err.message);
    memoryStore = { ...initialStore };
  }
}

// Atomic file write to prevent any data loss or corrupted writes
function saveLocalData() {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryStore, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('[DB] Atomic save error:', err.message);
  }
}

// Attempt MySQL Connection if environment variables are provided
async function initializeDatabase() {
  loadLocalData();

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (host && user && database) {
    try {
      mysqlPool = mysql.createPool({
        host,
        user,
        password: password || '',
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test ping
      const connection = await mysqlPool.getConnection();
      connection.release();
      useMySQL = true;
      console.log(`[DB] Connected successfully to MySQL Database: ${database}@${host}`);
      return;
    } catch (err) {
      console.warn(`[DB] MySQL not available (${err.message}). Using secure atomic local data engine.`);
      useMySQL = false;
    }
  } else {
    console.log('[DB] Running on zero-dependency atomic local data engine. (MySQL config available via .env)');
  }
}

// Helper: Query collection in memory store
function getCollection(name) {
  if (!memoryStore[name]) {
    memoryStore[name] = [];
  }
  return memoryStore[name];
}

// Query API
const db = {
  isMySQL() {
    return useMySQL;
  },

  async query(sql, params = []) {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    }
    // Return empty array if direct raw SQL without local emulation
    return [];
  },

  // Abstracted Repository Methods providing uniform interface
  users: {
    async findByEmail(email) {
      const cleanEmail = (email || '').toLowerCase().trim();
      if (useMySQL && mysqlPool) {
        const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        return rows[0] || null;
      }
      return getCollection('users').find(u => (u.email || '').toLowerCase() === cleanEmail) || null;
    },

    async findById(id) {
      const numId = Number(id);
      if (useMySQL && mysqlPool) {
        const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE id = ?', [numId]);
        return rows[0] || null;
      }
      return getCollection('users').find(u => Number(u.id) === numId) || null;
    },

    async findByPrn(prn) {
      const cleanPrn = (prn || '').trim();
      if (useMySQL && mysqlPool) {
        const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE prn = ?', [cleanPrn]);
        return rows[0] || null;
      }
      return getCollection('users').find(u => (u.prn || '').trim() === cleanPrn) || null;
    },

    async list(filter = {}) {
      if (useMySQL && mysqlPool) {
        let sql = 'SELECT id, prn, name, email, role, department_id, course_id, batch_id, status, created_at FROM users WHERE 1=1';
        const params = [];
        if (filter.role) {
          sql += ' AND role = ?';
          params.push(filter.role);
        }
        const [rows] = await mysqlPool.execute(sql, params);
        return rows;
      }
      let list = getCollection('users');
      if (filter.role) {
        list = list.filter(u => u.role === filter.role);
      }
      return list.map(({ password_hash, ...safe }) => safe);
    },

    async create(user) {
      if (useMySQL && mysqlPool) {
        const [result] = await mysqlPool.execute(
          `INSERT INTO users (prn, name, email, password_hash, role, department_id, course_id, batch_id, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.prn || null, user.name, user.email.toLowerCase().trim(), user.password_hash, user.role, user.department_id || null, user.course_id || null, user.batch_id || null, user.status || 'active']
        );
        return { id: result.insertId, ...user };
      }
      const list = getCollection('users');
      const newId = list.length ? Math.max(...list.map(u => u.id || 0)) + 1 : 1;
      const newUser = {
        id: newId,
        prn: user.prn || null,
        name: user.name,
        email: user.email.toLowerCase().trim(),
        password_hash: user.password_hash,
        role: user.role,
        department_id: user.department_id || null,
        course_id: user.course_id || null,
        batch_id: user.batch_id || null,
        status: user.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(newUser);
      saveLocalData();
      return newUser;
    },

    async updateStatus(id, status) {
      if (useMySQL && mysqlPool) {
        await mysqlPool.execute('UPDATE users SET status = ? WHERE id = ?', [status, Number(id)]);
        return;
      }
      const u = getCollection('users').find(x => Number(x.id) === Number(id));
      if (u) {
        u.status = status;
        saveLocalData();
      }
    }
  },

  studentProfiles: {
    async findByStudentId(studentId) {
      const sId = Number(studentId);
      if (useMySQL && mysqlPool) {
        const [rows] = await mysqlPool.execute('SELECT * FROM student_profiles WHERE student_id = ?', [sId]);
        return rows[0] || null;
      }
      return getCollection('student_profiles').find(p => Number(p.student_id) === sId) || null;
    },

    async upsert(studentId, data) {
      const sId = Number(studentId);
      const existing = await this.findByStudentId(sId);
      if (existing) {
        if (useMySQL && mysqlPool) {
          await mysqlPool.execute(
            `UPDATE student_profiles SET 
              tenth_percent = ?, twelfth_percent = ?, cgpa = ?, attendance_percent = ?, 
              active_backlogs = ?, history_backlogs = ?, skills = ?, projects = ?, 
              certifications = ?, internships = ?, is_profile_verified = ?
            WHERE student_id = ?`,
            [
              data.tenth_percent ?? existing.tenth_percent,
              data.twelfth_percent ?? existing.twelfth_percent,
              data.cgpa ?? existing.cgpa,
              data.attendance_percent ?? existing.attendance_percent,
              data.active_backlogs ?? existing.active_backlogs,
              data.history_backlogs ?? existing.history_backlogs,
              JSON.stringify(data.skills ?? existing.skills ?? []),
              JSON.stringify(data.projects ?? existing.projects ?? []),
              JSON.stringify(data.certifications ?? existing.certifications ?? []),
              JSON.stringify(data.internships ?? existing.internships ?? []),
              data.is_profile_verified ?? existing.is_profile_verified,
              sId
            ]
          );
          return this.findByStudentId(sId);
        }
        Object.assign(existing, data);
        existing.updated_at = new Date().toISOString();
        saveLocalData();
        return existing;
      } else {
        const newRecord = {
          id: getCollection('student_profiles').length + 1,
          student_id: sId,
          tenth_percent: data.tenth_percent || 0,
          twelfth_percent: data.twelfth_percent || 0,
          cgpa: data.cgpa || 0,
          attendance_percent: data.attendance_percent || 0,
          active_backlogs: data.active_backlogs || 0,
          history_backlogs: data.history_backlogs || 0,
          skills: data.skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
          internships: data.internships || [],
          resume_file: data.resume_file || null,
          is_profile_verified: false,
          created_at: new Date().toISOString()
        };
        getCollection('student_profiles').push(newRecord);
        saveLocalData();
        return newRecord;
      }
    }
  },

  documents: {
    async findByStudentId(studentId) {
      const sId = Number(studentId);
      if (useMySQL && mysqlPool) {
        const [rows] = await mysqlPool.execute('SELECT * FROM documents WHERE student_id = ? ORDER BY uploaded_at DESC', [sId]);
        return rows;
      }
      return getCollection('documents').filter(d => Number(d.student_id) === sId);
    },

    async listPending() {
      if (useMySQL && mysqlPool) {
        const [rows] = await mysqlPool.execute(`
          SELECT d.*, u.name as student_name, u.prn as student_prn, u.email as student_email 
          FROM documents d 
          JOIN users u ON d.student_id = u.id 
          WHERE d.status = 'pending' 
          ORDER BY d.uploaded_at ASC
        `);
        return rows;
      }
      const users = getCollection('users');
      return getCollection('documents')
        .filter(d => d.status === 'pending')
        .map(d => {
          const u = users.find(x => x.id === d.student_id) || {};
          return { ...d, student_name: u.name, student_prn: u.prn, student_email: u.email };
        });
    },

    async listAll() {
      const users = getCollection('users');
      return getCollection('documents').map(d => {
        const u = users.find(x => x.id === d.student_id) || {};
        return { ...d, student_name: u.name, student_prn: u.prn, student_email: u.email };
      });
    },

    async create(doc) {
      const list = getCollection('documents');
      const newDoc = {
        id: list.length ? Math.max(...list.map(d => d.id || 0)) + 1 : 1,
        student_id: Number(doc.student_id),
        doc_type: doc.doc_type,
        original_name: doc.original_name,
        file_path: doc.file_path,
        status: 'pending',
        verified_by: null,
        rejection_reason: null,
        uploaded_at: new Date().toISOString()
      };
      list.push(newDoc);
      saveLocalData();
      return newDoc;
    },

    async updateStatus(id, { status, verified_by, rejection_reason }) {
      const docId = Number(id);
      const doc = getCollection('documents').find(d => Number(d.id) === docId);
      if (doc) {
        doc.status = status;
        doc.verified_by = verified_by;
        doc.rejection_reason = rejection_reason || null;
        doc.verified_at = new Date().toISOString();
        saveLocalData();

        // Check if all essential documents for the student are verified
        const studentDocs = getCollection('documents').filter(d => Number(d.student_id) === Number(doc.student_id));
        const hasVerifiedResume = studentDocs.some(d => d.doc_type === 'resume' && d.status === 'verified');
        const hasVerifiedAcademics = studentDocs.some(d => ['10th_result', '12th_result', 'university_result'].includes(d.doc_type) && d.status === 'verified');
        
        const profile = getCollection('student_profiles').find(p => Number(p.student_id) === Number(doc.student_id));
        if (profile) {
          profile.is_profile_verified = hasVerifiedResume && hasVerifiedAcademics;
          saveLocalData();
        }
      }
      return doc;
    }
  },

  assessments: {
    async list(type = null) {
      let list = getCollection('assessments');
      if (type) {
        list = list.filter(a => a.type === type);
      }
      return list;
    },

    async findById(id) {
      const aId = Number(id);
      return getCollection('assessments').find(a => Number(a.id) === aId) || null;
    },

    async getQuestions(assessmentId) {
      const aId = Number(assessmentId);
      return getCollection('assessment_questions').filter(q => Number(q.assessment_id) === aId);
    },

    async create(assessment) {
      const list = getCollection('assessments');
      const newAssessment = {
        id: list.length ? Math.max(...list.map(a => a.id || 0)) + 1 : 1,
        title: assessment.title,
        type: assessment.type,
        description: assessment.description,
        duration_minutes: Number(assessment.duration_minutes) || 30,
        total_marks: Number(assessment.total_marks) || 100,
        negative_marking_rate: Number(assessment.negative_marking_rate) || 0,
        created_by: Number(assessment.created_by),
        is_published: assessment.is_published ?? true,
        created_at: new Date().toISOString()
      };
      list.push(newAssessment);
      saveLocalData();
      return newAssessment;
    },

    async addQuestion(question) {
      const list = getCollection('assessment_questions');
      const newQ = {
        id: list.length ? Math.max(...list.map(q => q.id || 0)) + 1 : 1,
        assessment_id: Number(question.assessment_id),
        question_text: question.question_text,
        category: question.category || 'General',
        difficulty: question.difficulty || 'medium',
        options: question.options || [],
        correct_option: question.correct_option !== undefined ? Number(question.correct_option) : null,
        marks: Number(question.marks) || 10,
        coding_starter_code: question.coding_starter_code || '',
        test_cases: question.test_cases || []
      };
      list.push(newQ);
      saveLocalData();
      return newQ;
    },

    async saveSubmission(submission) {
      const list = getCollection('assessment_submissions');
      const newSub = {
        id: list.length ? Math.max(...list.map(s => s.id || 0)) + 1 : 1,
        assessment_id: Number(submission.assessment_id),
        student_id: Number(submission.student_id),
        score: Number(submission.score) || 0,
        max_score: Number(submission.max_score) || 100,
        percentage: Number(((submission.score / (submission.max_score || 100)) * 100).toFixed(1)),
        answers_payload: submission.answers_payload || {},
        submitted_at: new Date().toISOString()
      };
      list.push(newSub);
      saveLocalData();
      return newSub;
    },

    async getStudentSubmissions(studentId) {
      const sId = Number(studentId);
      const subs = getCollection('assessment_submissions').filter(s => Number(s.student_id) === sId);
      const assessments = getCollection('assessments');
      return subs.map(s => {
        const a = assessments.find(x => x.id === s.assessment_id) || {};
        return { ...s, assessment_title: a.title, assessment_type: a.type };
      });
    }
  },

  evaluations: {
    async findByStudentId(studentId) {
      const sId = Number(studentId);
      return getCollection('faculty_evaluations').filter(e => Number(e.student_id) === sId);
    },

    async save(evaluation) {
      const list = getCollection('faculty_evaluations');
      const existing = list.find(e => Number(e.student_id) === Number(evaluation.student_id) && Number(e.teacher_id) === Number(evaluation.teacher_id));
      if (existing) {
        Object.assign(existing, evaluation, { updated_at: new Date().toISOString() });
        saveLocalData();
        return existing;
      }
      const newEval = {
        id: list.length ? Math.max(...list.map(e => e.id || 0)) + 1 : 1,
        student_id: Number(evaluation.student_id),
        teacher_id: Number(evaluation.teacher_id),
        technical_rating: Number(evaluation.technical_rating) || 7,
        aptitude_rating: Number(evaluation.aptitude_rating) || 7,
        communication_rating: Number(evaluation.communication_rating) || 7,
        placement_readiness_score: Number(evaluation.placement_readiness_score) || 70,
        remarks: evaluation.remarks || '',
        created_at: new Date().toISOString()
      };
      list.push(newEval);
      saveLocalData();
      return newEval;
    }
  },

  predictions: {
    async findLatestByStudentId(studentId) {
      const sId = Number(studentId);
      const preds = getCollection('placement_predictions')
        .filter(p => Number(p.student_id) === sId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return preds[0] || null;
    },

    async save(prediction) {
      const list = getCollection('placement_predictions');
      const newPred = {
        id: list.length ? Math.max(...list.map(p => p.id || 0)) + 1 : 1,
        student_id: Number(prediction.student_id),
        placement_probability: Number(prediction.placement_probability),
        placement_outcome: prediction.placement_outcome,
        model_name: prediction.model_name || 'Random Forest',
        strengths: prediction.strengths || [],
        weaknesses: prediction.weaknesses || [],
        recommendations: prediction.recommendations || [],
        feature_importance: prediction.feature_importance || {},
        created_at: new Date().toISOString()
      };
      list.push(newPred);
      saveLocalData();
      return newPred;
    }
  },

  institution: {
    async getDepartments() {
      return getCollection('departments');
    },
    async getCourses() {
      const courses = getCollection('courses');
      const depts = getCollection('departments');
      return courses.map(c => {
        const d = depts.find(x => x.id === c.department_id) || {};
        return { ...c, department_name: d.name, department_code: d.code };
      });
    },
    async getBatches() {
      const batches = getCollection('batches');
      const courses = getCollection('courses');
      return batches.map(b => {
        const c = courses.find(x => x.id === b.course_id) || {};
        return { ...b, course_name: c.name };
      });
    },
    async createDepartment(data) {
      const list = getCollection('departments');
      const newD = {
        id: list.length ? Math.max(...list.map(d => d.id || 0)) + 1 : 1,
        name: data.name,
        code: data.code,
        created_at: new Date().toISOString()
      };
      list.push(newD);
      saveLocalData();
      return newD;
    },
    async createCourse(data) {
      const list = getCollection('courses');
      const newC = {
        id: list.length ? Math.max(...list.map(c => c.id || 0)) + 1 : 1,
        department_id: Number(data.department_id),
        name: data.name,
        code: data.code,
        created_at: new Date().toISOString()
      };
      list.push(newC);
      saveLocalData();
      return newC;
    },
    async createBatch(data) {
      const list = getCollection('batches');
      const newB = {
        id: list.length ? Math.max(...list.map(b => b.id || 0)) + 1 : 1,
        course_id: Number(data.course_id),
        academic_year: data.academic_year,
        year_number: Number(data.year_number) || 1,
        semester_number: Number(data.semester_number) || 1,
        batch_name: data.batch_name,
        created_at: new Date().toISOString()
      };
      list.push(newB);
      saveLocalData();
      return newB;
    }
  },

  audit: {
    async log({ user_id = null, role = null, action, endpoint, ip_address = '127.0.0.1', status_code = 200, details = '' }) {
      const list = getCollection('audit_logs');
      const entry = {
        id: list.length ? Math.max(...list.map(l => l.id || 0)) + 1 : 1,
        user_id: user_id ? Number(user_id) : null,
        role: role || 'anonymous',
        action,
        endpoint,
        ip_address,
        status_code,
        details,
        created_at: new Date().toISOString()
      };
      list.push(entry);
      // Keep last 1000 logs in memory
      if (list.length > 1000) {
        list.splice(0, list.length - 1000);
      }
      saveLocalData();
      return entry;
    },
    async getRecent(limit = 100) {
      const list = getCollection('audit_logs');
      return [...list].reverse().slice(0, limit);
    }
  },

  notifications: {
    async create({ user_id, title, message, type = 'info' }) {
      const list = getCollection('notifications');
      const notif = {
        id: list.length ? Math.max(...list.map(n => n.id || 0)) + 1 : 1,
        user_id: Number(user_id),
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      };
      list.push(notif);
      saveLocalData();
      return notif;
    },
    async getByUser(userId) {
      const uId = Number(userId);
      return getCollection('notifications')
        .filter(n => Number(n.user_id) === uId)
        .reverse();
    },
    async markRead(id) {
      const nId = Number(id);
      const notif = getCollection('notifications').find(n => Number(n.id) === nId);
      if (notif) {
        notif.is_read = true;
        saveLocalData();
      }
      return notif;
    }
  },

  otps: {
    async saveOtp(email, otpHash, expiresAt) {
      const list = getCollection('registration_otps');
      // Invalidate existing unused OTPs for this email
      list.forEach(o => {
        if (o.email.toLowerCase() === email.toLowerCase()) o.used = true;
      });
      const newOtp = {
        id: list.length + 1,
        email: email.toLowerCase().trim(),
        otp_hash: otpHash,
        expires_at: expiresAt,
        used: false,
        created_at: new Date().toISOString()
      };
      list.push(newOtp);
      saveLocalData();
      return newOtp;
    },
    async findValidOtp(email) {
      const now = new Date().toISOString();
      const list = getCollection('registration_otps');
      return list
        .filter(o => o.email.toLowerCase() === email.toLowerCase() && !o.used && o.expires_at > now)
        .pop() || null;
    },
    async markUsed(id) {
      const item = getCollection('registration_otps').find(o => o.id === id);
      if (item) {
        item.used = true;
        saveLocalData();
      }
    }
  },

  // Expose raw internal store for seeding
  _getMemoryStore() {
    return memoryStore;
  },
  _save() {
    saveLocalData();
  }
};

module.exports = {
  db,
  initializeDatabase
};
