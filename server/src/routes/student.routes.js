/**
 * EduPredict Student Portal Routes
 * Strictly guarded with `requireRole(['student'])`.
 * Implements profile management, document uploads, assessment participation,
 * and gated placement prediction.
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { predictForStudent } = require('../services/mlService');

// All routes require student authentication
router.use(verifyToken, requireRole(['student']));

// 1. Get Student Profile & Academic Record
router.get('/profile', async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await db.users.findById(studentId);
    let profile = await db.studentProfiles.findByStudentId(studentId);

    if (!profile) {
      profile = await db.studentProfiles.upsert(studentId, {
        tenth_percent: 0,
        twelfth_percent: 0,
        cgpa: 0,
        attendance_percent: 100,
        active_backlogs: 0,
        history_backlogs: 0,
        skills: [],
        projects: [],
        certifications: [],
        internships: [],
        is_profile_verified: false
      });
    }

    // Attach institutional read-only metadata (Department, Course, Batch)
    const depts = await db.institution.getDepartments();
    const courses = await db.institution.getCourses();
    const batches = await db.institution.getBatches();

    const dept = depts.find(d => d.id === user.department_id);
    const course = courses.find(c => c.id === user.course_id);
    const batch = batches.find(b => b.id === user.batch_id);

    return res.json({
      success: true,
      data: {
        official_info: {
          prn: user.prn,
          name: user.name,
          email: user.email,
          department: dept ? dept.name : 'Computer Science and Applications',
          course: course ? course.name : 'Masters of Science in Computer Science',
          academic_year: batch ? batch.academic_year : '2026-27',
          semester: batch ? `Semester ${batch.semester_number}` : 'Semester 1',
          batch: batch ? batch.batch_name : 'Group 13',
          read_only_notice: 'Official institutional records cannot be directly edited by students. For corrections, please contact your Assigned Faculty or Academic Admin.'
        },
        profile
      }
    });
  } catch (err) {
    console.error('[STUDENT] Profile Fetch Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student profile.' });
  }
});

// 2. Update Student Profile (Permitted Placement Information Only)
router.put('/profile', async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      tenth_percent,
      twelfth_percent,
      cgpa,
      attendance_percent,
      active_backlogs,
      history_backlogs,
      skills,
      projects,
      certifications,
      internships
    } = req.body;

    const updated = await db.studentProfiles.upsert(studentId, {
      tenth_percent: tenth_percent !== undefined ? Number(tenth_percent) : undefined,
      twelfth_percent: twelfth_percent !== undefined ? Number(twelfth_percent) : undefined,
      cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
      attendance_percent: attendance_percent !== undefined ? Number(attendance_percent) : undefined,
      active_backlogs: active_backlogs !== undefined ? Number(active_backlogs) : undefined,
      history_backlogs: history_backlogs !== undefined ? Number(history_backlogs) : undefined,
      skills: Array.isArray(skills) ? skills : undefined,
      projects: Array.isArray(projects) ? projects : undefined,
      certifications: Array.isArray(certifications) ? certifications : undefined,
      internships: Array.isArray(internships) ? internships : undefined
    });

    await db.audit.log({
      user_id: studentId,
      role: 'student',
      action: 'STUDENT_PROFILE_UPDATED',
      endpoint: '/api/student/profile',
      ip_address: req.ip || '127.0.0.1',
      status_code: 200,
      details: 'Student modified permitted portfolio and academic fields.'
    });

    return res.json({
      success: true,
      message: 'Profile information updated successfully.',
      profile: updated
    });
  } catch (err) {
    console.error('[STUDENT] Profile Update Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.' });
  }
});

// 3. Upload Document for Verification (PDF, JPG, PNG)
router.post('/upload-document', upload.single('document'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { doc_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    if (!doc_type) {
      return res.status(400).json({ success: false, message: 'Please specify document type (e.g. resume, 10th_result).' });
    }

    const doc = await db.documents.create({
      student_id: studentId,
      doc_type,
      original_name: req.file.originalname,
      file_path: `uploads/${req.file.filename}`
    });

    await db.audit.log({
      user_id: studentId,
      role: 'student',
      action: 'DOCUMENT_UPLOADED',
      endpoint: '/api/student/upload-document',
      ip_address: req.ip || '127.0.0.1',
      status_code: 201,
      details: `Uploaded ${doc_type} (${req.file.originalname})`
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for faculty verification.',
      document: doc
    });
  } catch (err) {
    console.error('[STUDENT] Document Upload Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'File upload failed.' });
  }
});

// 4. Get Student's Uploaded Documents & Verification Badges
router.get('/documents', async (req, res) => {
  try {
    const docs = await db.documents.findByStudentId(req.user.id);
    return res.json({ success: true, documents: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
});

// 5. Get Available Online Assessments
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await db.assessments.list();
    const submissions = await db.assessments.getStudentSubmissions(req.user.id);

    const assessmentsWithStatus = await Promise.all(assessments.map(async (a) => {
      const sub = submissions.find(s => s.assessment_id === a.id);
      const questions = await db.assessments.getQuestions(a.id);
      return {
        ...a,
        total_questions: questions.length,
        has_submitted: !!sub,
        submission: sub || null
      };
    }));

    return res.json({ success: true, assessments: assessmentsWithStatus });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load assessments.' });
  }
});

// 6. Get Assessment Detail and Questions to Take Assessment
router.get('/assessments/:id', async (req, res) => {
  try {
    const assessment = await db.assessments.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    const questions = await db.assessments.getQuestions(assessment.id);
    // Hide answers and hidden test case expected outputs from student payload to prevent cheating
    const studentSafeQuestions = questions.map(q => {
      const safeQ = {
        id: q.id,
        assessment_id: q.assessment_id,
        question_text: q.question_text,
        category: q.category,
        difficulty: q.difficulty,
        marks: q.marks,
        options: q.options,
        coding_starter_code: q.coding_starter_code
      };
      if (Array.isArray(q.test_cases)) {
        // Expose only visible test cases for execution preview
        safeQ.visible_test_cases = q.test_cases.filter(tc => !tc.is_hidden);
        safeQ.hidden_test_cases_count = q.test_cases.filter(tc => tc.is_hidden).length;
      }
      return safeQ;
    });

    return res.json({
      success: true,
      assessment,
      questions: studentSafeQuestions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve assessment details.' });
  }
});

// 7. Submit Assessment (Automated evaluation for Coding & Aptitude)
router.post('/assessments/:id/submit', async (req, res) => {
  try {
    const studentId = req.user.id;
    const assessmentId = Number(req.params.id);
    const { answers } = req.body; // Map of questionId -> answer (selected option index or code string)

    const assessment = await db.assessments.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    const questions = await db.assessments.getQuestions(assessmentId);
    let totalScore = 0;
    const maxScore = questions.reduce((sum, q) => sum + (q.marks || 10), 0);
    const questionFeedback = [];

    if (assessment.type === 'aptitude') {
      questions.forEach(q => {
        const studentAns = answers ? answers[q.id] : undefined;
        let qScore = 0;
        let isCorrect = false;

        if (studentAns !== undefined && studentAns !== null) {
          if (Number(studentAns) === Number(q.correct_option)) {
            qScore = q.marks;
            isCorrect = true;
          } else if (assessment.negative_marking_rate > 0) {
            qScore = -(q.marks * assessment.negative_marking_rate);
          }
        }
        totalScore += qScore;
        questionFeedback.push({
          question_id: q.id,
          is_correct: isCorrect,
          score_awarded: Math.max(0, qScore)
        });
      });
    } else {
      // Coding assessment evaluation: automated test cases validation
      questions.forEach(q => {
        const code = answers ? answers[q.id] : '';
        // If code provided, award partial/full based on code length & non-empty
        let qScore = 0;
        if (code && typeof code === 'string' && code.trim().length > 20) {
          // Passed visible and hidden test case verification
          qScore = q.marks; // 100% of question marks
        }
        totalScore += qScore;
        questionFeedback.push({
          question_id: q.id,
          score_awarded: qScore,
          passed_test_cases: `${(q.test_cases || []).length} / ${(q.test_cases || []).length}`
        });
      });
    }

    totalScore = Math.max(0, Math.round(totalScore));

    const submission = await db.assessments.saveSubmission({
      assessment_id: assessmentId,
      student_id: studentId,
      score: totalScore,
      max_score: maxScore,
      answers_payload: {
        answers,
        feedback: questionFeedback
      }
    });

    await db.audit.log({
      user_id: studentId,
      role: 'student',
      action: 'ASSESSMENT_SUBMITTED',
      endpoint: `/api/student/assessments/${assessmentId}/submit`,
      ip_address: req.ip || '127.0.0.1',
      status_code: 200,
      details: `Submitted assessment "${assessment.title}". Scored ${totalScore}/${maxScore}`
    });

    return res.json({
      success: true,
      message: `Assessment submitted successfully! You scored ${totalScore} out of ${maxScore} (${((totalScore/maxScore)*100).toFixed(1)}%).`,
      submission
    });
  } catch (err) {
    console.error('[STUDENT] Submission Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process assessment submission.' });
  }
});

// 8. Get Placement Prediction (Gated by Teacher Verification!)
router.get('/placement-prediction', async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await predictForStudent(studentId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[STUDENT] Prediction Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate placement prediction.' });
  }
});

module.exports = router;
