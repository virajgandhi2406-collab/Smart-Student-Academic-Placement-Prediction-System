import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  FileCheck,
  CheckCircle,
  XCircle,
  Award,
  AlertTriangle,
  PlusCircle,
  Search,
  BookOpen,
  Send,
  Eye,
  Clock,
  Sparkles
} from 'lucide-react';

export default function TeacherPortal() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('verification');
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Dialog State
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Evaluation Modal State
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [evalData, setEvalData] = useState({
    technical_rating: 8,
    aptitude_rating: 8,
    communication_rating: 7,
    placement_readiness_score: 80,
    remarks: ''
  });

  // Create Assessment State
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    type: 'coding',
    description: '',
    duration_minutes: 45,
    total_marks: 100,
    negative_marking_rate: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Students
      const sRes = await fetch('/api/teacher/students', { headers });
      const sData = await sRes.json();
      if (sData.success) setStudents(sData.students || []);

      // 2. Fetch Pending Verification Documents
      const dRes = await fetch('/api/teacher/pending-documents', { headers });
      const dData = await dRes.json();
      if (dData.success) setPendingDocs(dData.pending_documents || []);
    } catch (err) {
      console.error('Failed to load teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Handle Document Verification (Approve)
  const handleApprove = async (docId) => {
    try {
      const res = await fetch('/api/teacher/verify-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ document_id: docId, action: 'approve' })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Verification failed.');
      }
    } catch (err) {
      alert('Error verifying document.');
    }
  };

  // Handle Document Rejection with Reason
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }

    try {
      const res = await fetch('/api/teacher/verify-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: rejectingDoc.id,
          action: 'reject',
          rejection_reason: rejectionReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setRejectingDoc(null);
        setRejectionReason('');
        loadData();
      } else {
        alert(data.message || 'Rejection failed.');
      }
    } catch (err) {
      alert('Error rejecting document.');
    }
  };

  // Handle Faculty Evaluation Submission
  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/evaluate-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: evaluatingStudent.id,
          ...evalData
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluatingStudent(null);
        loadData();
      } else {
        alert(data.message || 'Failed to submit evaluation.');
      }
    } catch (err) {
      alert('Error saving evaluation.');
    }
  };

  // Handle Create Assessment
  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/create-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAssessment)
      });
      const data = await res.json();
      if (data.success) {
        alert('Assessment created and published!');
        setNewAssessment({
          title: '',
          type: 'coding',
          description: '',
          duration_minutes: 45,
          total_marks: 100,
          negative_marking_rate: 0
        });
      }
    } catch (err) {
      alert('Failed to create assessment.');
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.prn || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRiskStudents = students.filter(s =>
    (s.profile?.active_backlogs > 0) || (Number(s.profile?.cgpa) < 6.5) || (Number(s.profile?.attendance_percent) < 75)
  );

  return (
    <div style={{ maxWidth: 1400, margin: '24px auto', padding: '0 20px' }}>
      {/* Teacher Header Banner */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-info"><BookOpen size={13} /> Faculty Mentor Console</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>School of Computer Science & Engineering</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>
              Faculty Portal • {user?.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Supervising M.Sc. Computer Science (MSC40040) • First Year Batch 2026-27
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="glass-panel" style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Students</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{students.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', textAlign: 'center', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase' }}>Pending Verifications</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>{pendingDocs.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '8px 16px', background: 'rgba(244, 63, 94, 0.1)', textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <div style={{ fontSize: '0.7rem', color: '#fb7185', textTransform: 'uppercase' }}>At-Risk Students</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fb7185' }}>{atRiskStudents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <button
          className={`btn btn-sm ${activeTab === 'verification' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('verification')}
        >
          <FileCheck size={16} /> Verification Queue ({pendingDocs.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} /> Assigned Students & Evaluation ({students.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'at-risk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('at-risk')}
        >
          <AlertTriangle size={16} /> At-Risk Students Watchlist ({atRiskStudents.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'assessments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('assessments')}
        >
          <PlusCircle size={16} /> Assessment Studio
        </button>
      </div>

      {/* TAB 1: DOCUMENT VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student Document Verification Queue</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Review and approve student credentials. Verification unlocks their ML placement prediction.
              </p>
            </div>
            <span className="badge badge-warning">{pendingDocs.length} Pending Review</span>
          </div>

          {pendingDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 12px', display: 'block' }} />
              All submitted student documents have been verified and processed!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingDocs.map(doc => (
                <div key={doc.id} className="glass-panel" style={{ padding: 18, background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{doc.student_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({doc.student_prn})</span>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{doc.doc_type}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        File: <strong>{doc.original_name}</strong> • Uploaded on {new Date(doc.uploaded_at).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(doc.id)}
                      >
                        <CheckCircle size={15} /> Approve & Verify
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setRejectingDoc(doc);
                          setRejectionReason('');
                        }}
                      >
                        <XCircle size={15} /> Reject with Reason
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNED STUDENTS LIST & FACULTY EVALUATION */}
      {activeTab === 'students' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Assigned M.Sc. CS Students</h2>
            <div style={{ position: 'relative', width: 280 }}>
              <input
                className="form-input"
                placeholder="Search by student name or PRN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: 12 }}>Student Details</th>
                  <th style={{ padding: 12 }}>CGPA / Attendance</th>
                  <th style={{ padding: 12 }}>Backlogs</th>
                  <th style={{ padding: 12 }}>Verification</th>
                  <th style={{ padding: 12 }}>ML Prediction</th>
                  <th style={{ padding: 12 }}>Faculty Rating</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.prn} • {s.email}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div>{s.profile?.cgpa || '0.00'} CGPA</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.profile?.attendance_percent || 100}% Att.</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ color: s.profile?.active_backlogs > 0 ? '#f43f5e' : '#10b981', fontWeight: 600 }}>
                        {s.profile?.active_backlogs || 0} active
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {s.is_verified ? (
                        <span className="badge badge-verified">Verified</span>
                      ) : (
                        <span className="badge badge-pending">Pending</span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      {s.latest_prediction ? (
                        <span className={`badge ${s.latest_prediction.placement_outcome === 'Placed' ? 'badge-verified' : 'badge-rejected'}`}>
                          {s.latest_prediction.placement_probability}% ({s.latest_prediction.placement_outcome})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Not generated</span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      {s.latest_evaluation ? (
                        <span className="badge badge-info">
                          {s.latest_evaluation.placement_readiness_score}% Readiness
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unevaluated</span>
                      )}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEvaluatingStudent(s);
                          setEvalData({
                            technical_rating: s.latest_evaluation?.technical_rating || 8,
                            aptitude_rating: s.latest_evaluation?.aptitude_rating || 8,
                            communication_rating: s.latest_evaluation?.communication_rating || 7,
                            placement_readiness_score: s.latest_evaluation?.placement_readiness_score || 80,
                            remarks: s.latest_evaluation?.remarks || ''
                          });
                        }}
                      >
                        <Award size={14} /> Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AT-RISK STUDENTS WATCHLIST */}
      {activeTab === 'at-risk' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={24} color="#f43f5e" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>At-Risk Student Intervention Watchlist</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Identifies students with active backlogs, CGPA below 6.5, or attendance below 75% for early counseling.
              </p>
            </div>
          </div>

          {atRiskStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
              No students are currently flagged as at-risk in this batch!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {atRiskStudents.map(s => (
                <div key={s.id} className="glass-panel" style={{ padding: 16, borderLeft: '4px solid #f43f5e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.name} ({s.prn})</div>
                      <div style={{ fontSize: '0.8rem', color: '#fb7185', marginTop: 4 }}>
                        ⚠️ Risk Factors: {s.profile?.active_backlogs > 0 && `${s.profile.active_backlogs} active backlog(s); `}
                        {s.profile?.cgpa < 6.5 && `Low CGPA (${s.profile.cgpa}); `}
                        {s.profile?.attendance_percent < 75 && `Low attendance (${s.profile.attendance_percent}%); `}
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEvaluatingStudent(s);
                        setEvalData({
                          technical_rating: 6,
                          aptitude_rating: 6,
                          communication_rating: 6,
                          placement_readiness_score: 55,
                          remarks: 'Academic intervention and remedial mentoring recommended.'
                        });
                      }}
                    >
                      Remedial Counseling
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSESSMENT STUDIO */}
      {activeTab === 'assessments' && (
        <div className="glass-panel" style={{ padding: 28, maxWidth: 800 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Create & Publish New Assessment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
            Configure online coding challenges or aptitude multiple-choice tests with automatic evaluation.
          </p>

          <form onSubmit={handleCreateAssessment}>
            <div className="form-group">
              <label className="form-label">Assessment Title</label>
              <input
                className="form-input"
                placeholder="e.g. Advanced Graph Algorithms & Trees"
                value={newAssessment.title}
                onChange={e => setNewAssessment({ ...newAssessment, title: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Assessment Type</label>
                <select
                  className="form-select"
                  value={newAssessment.type}
                  onChange={e => setNewAssessment({ ...newAssessment, type: e.target.value })}
                >
                  <option value="coding">Coding Assessment (Code Editor & Test Cases)</option>
                  <option value="aptitude">Aptitude Assessment (Timed MCQs)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newAssessment.duration_minutes}
                  onChange={e => setNewAssessment({ ...newAssessment, duration_minutes: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={newAssessment.total_marks}
                  onChange={e => setNewAssessment({ ...newAssessment, total_marks: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Negative Marking Rate (0 to 1)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={newAssessment.negative_marking_rate}
                  onChange={e => setNewAssessment({ ...newAssessment, negative_marking_rate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Instructions</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Instructions for students taking this test..."
                value={newAssessment.description}
                onChange={e => setNewAssessment({ ...newAssessment, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Publish Assessment
            </button>
          </form>
        </div>
      )}

      {/* Rejection Reason Modal Dialog */}
      {rejectingDoc && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: '#fb7185' }}>
              Reject Document Verification
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Provide a clear reason for rejecting <strong>{rejectingDoc.original_name}</strong> submitted by {rejectingDoc.student_name}.
            </p>

            <form onSubmit={handleReject}>
              <div className="form-group">
                <label className="form-label">Rejection Reason (Student will be notified to correct)</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. Incomplete marksheet scan; signature and seal not legible. Please re-upload with high resolution."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRejectingDoc(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Modal Dialog */}
      {evaluatingStudent && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>
              Faculty Evaluation: {evaluatingStudent.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              PRN: <strong>{evaluatingStudent.prn}</strong> • Grade student competencies for ML feature aggregation.
            </p>

            <form onSubmit={handleSaveEvaluation}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Technical Competence (1 - 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={evalData.technical_rating}
                    onChange={e => setEvalData({ ...evalData, technical_rating: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Aptitude & Problem Solving (1 - 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={evalData.aptitude_rating}
                    onChange={e => setEvalData({ ...evalData, aptitude_rating: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Communication & Professionalism (1 - 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={evalData.communication_rating}
                    onChange={e => setEvalData({ ...evalData, communication_rating: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Placement Readiness Score (1 - 100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input"
                    value={evalData.placement_readiness_score}
                    onChange={e => setEvalData({ ...evalData, placement_readiness_score: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Faculty Feedback & Mentorship Remarks</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Specific feedback regarding interview readiness, project depth, or areas to strengthen..."
                  value={evalData.remarks}
                  onChange={e => setEvalData({ ...evalData, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEvaluatingStudent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
