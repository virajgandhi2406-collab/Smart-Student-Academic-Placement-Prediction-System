/**
 * EduPredict Faculty/Teacher Portal Routes
 * Strictly protected by `requireRole(['teacher', 'admin'])`.
 * Implements document verification workflows (approve/reject with reason),
 * student evaluations, assessment creation, and at-risk student monitoring.
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole(['teacher', 'admin']));

// 1. Get Assigned Students List with Detailed Academic & Verification Status
router.get('/students', async (req, res) => {
  try {
    const students = await db.users.list({ role: 'student' });
    const studentData = await Promise.all(students.map(async (s) => {
      const profile = await db.studentProfiles.findByStudentId(s.id);
      const docs = await db.documents.findByStudentId(s.id);
      const submissions = await db.assessments.getStudentSubmissions(s.id);
      const evals = await db.evaluations.findByStudentId(s.id);
      const latestPred = await db.predictions.findLatestByStudentId(s.id);

      const pendingDocs = docs.filter(d => d.status === 'pending').length;
      const verifiedDocs = docs.filter(d => d.status === 'verified').length;

      return {
        id: s.id,
        prn: s.prn,
        name: s.name,
        email: s.email,
        status: s.status,
        profile: profile || {},
        is_verified: profile ? profile.is_profile_verified : false,
        pending_documents_count: pendingDocs,
        verified_documents_count: verifiedDocs,
        total_documents_count: docs.length,
        submissions_count: submissions.length,
        latest_evaluation: evals[evals.length - 1] || null,
        latest_prediction: latestPred || null
      };
    }));

    return res.json({ success: true, students: studentData });
  } catch (err) {
    console.error('[TEACHER] Students list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students list.' });
  }
});

// 2. Get Pending Documents for Verification Queue
router.get('/pending-documents', async (req, res) => {
  try {
    const pending = await db.documents.listPending();
    return res.json({ success: true, pending_documents: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load verification queue.' });
  }
});

// 3. Verify Document (Approve or Reject with Reason)
router.post('/verify-document', async (req, res) => {
  try {
    const { document_id, action, rejection_reason } = req.body;
    if (!document_id || !action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: Must provide document_id and action ("approve" or "reject").'
      });
    }

    if (action === 'reject' && (!rejection_reason || rejection_reason.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear rejection reason to help the student correct the document.'
      });
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected';
    const updatedDoc = await db.documents.updateStatus(document_id, {
      status: newStatus,
      verified_by: req.user.id,
      rejection_reason: action === 'reject' ? rejection_reason : null
    });

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Notify student about verification status
    await db.notifications.create({
      user_id: updatedDoc.student_id,
      title: `Document ${action === 'approve' ? 'Verified' : 'Rejected'}`,
      message: action === 'approve' 
        ? `Your uploaded document (${updatedDoc.doc_type}) was verified by Prof. ${req.user.name}.`
        : `Your document (${updatedDoc.doc_type}) was rejected. Reason: "${rejection_reason}". Please re-upload.`,
      type: action === 'approve' ? 'success' : 'warning'
    });

    await db.audit.log({
      user_id: req.user.id,
      role: req.user.role,
      action: `DOCUMENT_${action.toUpperCase()}D`,
      endpoint: '/api/teacher/verify-document',
      ip_address: req.ip || '127.0.0.1',
      status_code: 200,
      details: `Teacher ${req.user.name} ${action}d doc #${document_id} for student #${updatedDoc.student_id}`
    });

    return res.json({
      success: true,
      message: `Document has been ${action === 'approve' ? 'approved and verified' : 'rejected with feedback'}.`,
      document: updatedDoc
    });
  } catch (err) {
    console.error('[TEACHER] Verify error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update document verification.' });
  }
});

// 4. Submit Faculty Evaluation for a Student
router.post('/evaluate-student', async (req, res) => {
  try {
    const {
      student_id,
      technical_rating,
      aptitude_rating,
      communication_rating,
      placement_readiness_score,
      remarks
    } = req.body;

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const evaluation = await db.evaluations.save({
      student_id: Number(student_id),
      teacher_id: req.user.id,
      technical_rating: Number(technical_rating) || 7,
      aptitude_rating: Number(aptitude_rating) || 7,
      communication_rating: Number(communication_rating) || 7,
      placement_readiness_score: Number(placement_readiness_score) || 75,
      remarks: remarks || ''
    });

    await db.notifications.create({
      user_id: student_id,
      title: 'Faculty Evaluation Received',
      message: `Prof. ${req.user.name} published a new placement readiness assessment score: ${placement_readiness_score}%.`,
      type: 'info'
    });

    await db.audit.log({
      user_id: req.user.id,
      role: req.user.role,
      action: 'FACULTY_EVALUATION_SUBMITTED',
      endpoint: '/api/teacher/evaluate-student',
      ip_address: req.ip || '127.0.0.1',
      status_code: 200,
      details: `Evaluated student #${student_id} with readiness score ${placement_readiness_score}`
    });

    return res.json({
      success: true,
      message: 'Student evaluation saved successfully.',
      evaluation
    });
  } catch (err) {
    console.error('[TEACHER] Evaluation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record student evaluation.' });
  }
});

// 5. Create Assessment (Coding or Aptitude)
router.post('/create-assessment', async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      duration_minutes,
      total_marks,
      negative_marking_rate,
      questions
    } = req.body;

    if (!title || !type || !['coding', 'aptitude'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Valid title and type ("coding" or "aptitude") are required.' });
    }

    const newAssessment = await db.assessments.create({
      title,
      type,
      description: description || '',
      duration_minutes: duration_minutes || 30,
      total_marks: total_marks || 100,
      negative_marking_rate: negative_marking_rate || 0,
      created_by: req.user.id,
      is_published: true
    });

    if (Array.isArray(questions)) {
      for (const q of questions) {
        await db.assessments.addQuestion({
          assessment_id: newAssessment.id,
          ...q
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `New ${type} assessment created and published successfully.`,
      assessment: newAssessment
    });
  } catch (err) {
    console.error('[TEACHER] Create assessment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create assessment.' });
  }
});

module.exports = router;
