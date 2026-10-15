import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Brain,
  Code2,
  FileCheck,
  Award,
  BookOpen,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Send,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Lock,
  Check
} from 'lucide-react';

export default function StudentPortal() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('prediction');
  const [loading, setLoading] = useState(true);

  // Student Profile & Data
  const [officialInfo, setOfficialInfo] = useState({});
  const [profile, setProfile] = useState({});
  const [documents, setDocuments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [predictionData, setPredictionData] = useState(null);

  // Assessment Runner State
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [codingCode, setCodingCode] = useState('');
  const [activeQIndex, setActiveQIndex] = useState(0);

  // Document Upload State
  const [uploadType, setUploadType] = useState('resume');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  // Profile Edit State
  const [skillInput, setSkillInput] = useState('');
  const [profileSaveMsg, setProfileSaveMsg] = useState('');

  // Fetch all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Profile & Official Info
      const profRes = await fetch('/api/student/profile', { headers });
      const profData = await profRes.json();
      if (profData.success) {
        setOfficialInfo(profData.data.official_info);
        setProfile(profData.data.profile);
      }

      // 2. Documents
      const docRes = await fetch('/api/student/documents', { headers });
      const docData = await docRes.json();
      if (docData.success) {
        setDocuments(docData.documents || []);
      }

      // 3. Assessments
      const assessRes = await fetch('/api/student/assessments', { headers });
      const assessData = await assessRes.json();
      if (assessData.success) {
        setAssessments(assessData.assessments || []);
      }

      // 4. ML Prediction
      const predRes = await fetch('/api/student/placement-prediction', { headers });
      const predData = await predRes.json();
      if (predData.success) {
        setPredictionData(predData);
        if (!predData.is_locked && predData.prediction && predData.prediction.placement_probability >= 75) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Handle Document Upload
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMsg('Please choose a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('doc_type', uploadType);

    try {
      const res = await fetch('/api/student/upload-document', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg('Document uploaded successfully and queued for faculty review.');
        setSelectedFile(null);
        loadData();
      } else {
        setUploadMsg(data.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadMsg('File upload service error.');
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setProfileSaveMsg('Profile changes saved successfully!');
        setTimeout(() => setProfileSaveMsg(''), 3500);
        loadData();
      }
    } catch (err) {
      setProfileSaveMsg('Failed to save profile changes.');
    }
  };

  // Start Assessment Test
  const startAssessment = async (assessment) => {
    try {
      const res = await fetch(`/api/student/assessments/${assessment.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveAssessment(data.assessment);
        setAssessmentQuestions(data.questions || []);
        setSelectedAnswers({});
        setAssessmentResult(null);
        setActiveQIndex(0);
        if (data.questions && data.questions[0] && data.questions[0].coding_starter_code) {
          setCodingCode(data.questions[0].coding_starter_code);
        }
      }
    } catch (err) {
      alert('Could not start assessment.');
    }
  };

  // Submit Assessment
  const handleSubmitAssessment = async () => {
    try {
      const answersPayload = { ...selectedAnswers };
      if (activeAssessment.type === 'coding') {
        const curQ = assessmentQuestions[activeQIndex];
        if (curQ) answersPayload[curQ.id] = codingCode;
      }

      const res = await fetch(`/api/student/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersPayload })
      });
      const data = await res.json();
      if (data.success) {
        setAssessmentResult(data);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        loadData();
      } else {
        alert(data.message || 'Failed to submit assessment.');
      }
    } catch (err) {
      alert('Error submitting assessment.');
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '24px auto', padding: '0 20px' }}>
      {/* Top Banner & Quick Metrics */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome, {user?.name}</h1>
              {profile.is_profile_verified ? (
                <span className="badge badge-verified"><ShieldCheck size={14} /> Profile Verified</span>
              ) : (
                <span className="badge badge-pending"><Clock size={14} /> Verification Pending</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              PRN: <strong>{user?.prn}</strong> • {officialInfo.course || 'Masters of Science in Computer Science'} ({officialInfo.batch || 'Group 13'})
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Download size={15} /> Export Placement Report
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid-4" style={{ marginTop: 20 }}>
          <div className="glass-panel" style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cumulative CGPA</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{profile.cgpa || '0.00'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span></div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 4 }}>Attendance: {profile.attendance_percent || 100}%</div>
          </div>

          <div className="glass-panel" style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Backlogs</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: profile.active_backlogs > 0 ? '#f43f5e' : '#10b981', marginTop: 4 }}>
              {profile.active_backlogs || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>History: {profile.history_backlogs || 0}</div>
          </div>

          <div className="glass-panel" style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Documents Status</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 4 }}>
              {documents.filter(d => d.status === 'verified').length} / {documents.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {documents.filter(d => d.status === 'pending').length} pending review
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 16, background: 'rgba(37, 99, 235, 0.08)', borderColor: 'var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-accent)', textTransform: 'uppercase', fontWeight: 700 }}>ML Placement Probability</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-accent)', marginTop: 4 }}>
              {predictionData?.is_locked ? 'Locked' : `${predictionData?.prediction?.placement_probability || '--'}%`}
            </div>
            <div style={{ fontSize: '0.75rem', color: predictionData?.prediction?.placement_outcome === 'Placed' ? '#34d399' : '#fbbf24', marginTop: 4 }}>
              {predictionData?.is_locked ? 'Verification Required' : predictionData?.prediction?.placement_outcome}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
        <button
          className={`btn btn-sm ${activeTab === 'prediction' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('prediction')}
        >
          <Brain size={16} /> Placement Prediction (ML)
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'official' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('official')}
        >
          <BookOpen size={16} /> Official Institutional Record
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <Briefcase size={16} /> Profile & Skills Portfolio
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'documents' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileCheck size={16} /> Documents Verification ({documents.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'assessments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('assessments')}
        >
          <Code2 size={16} /> Online Assessments (Coding & Aptitude)
        </button>
      </div>

      {/* TAB 1: PLACEMENT PREDICTION HUB (GATED ML) */}
      {activeTab === 'prediction' && (
        <div>
          {predictionData?.is_locked ? (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <AlertCircle size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Placement Prediction Locked</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '10px auto 20px', lineHeight: 1.6 }}>
                As per institutional academic guidelines (Synopsis Requirement 1.5.1 #6), Machine Learning placement predictions are only released once all required academic credentials and documents (Resume and Marksheets) have been verified by your assigned faculty mentor.
              </p>
              <div style={{ display: 'inline-flex', gap: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('documents')}>
                  <UploadCloud size={16} /> Upload Required Documents
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('official')}>
                  <BookOpen size={16} /> View Faculty Assignment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Probability Gauge & Outcome */}
              <div className="glass-panel glow-border" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    <Sparkles size={12} /> {predictionData?.prediction?.model_name || 'Random Forest Ensemble'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Verified Analysis
                  </span>
                </div>

                <div style={{ textAlign: 'center', margin: '30px 0' }}>
                  <div style={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--text-accent)',
                    lineHeight: 1
                  }}>
                    {predictionData?.prediction?.placement_probability}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                    Estimated Placement Probability
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <span className={`badge ${predictionData?.prediction?.placement_outcome === 'Placed' ? 'badge-verified' : 'badge-rejected'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                      {predictionData?.prediction?.placement_outcome === 'Placed' ? 'Likely Placed (Top Tier)' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                {/* Feature Importance Weights Breakdown */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Key Contributing Factors (Feature Importance)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(predictionData?.prediction?.feature_importance || {}).map(([feat, weight]) => (
                      <div key={feat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                          <span style={{ fontWeight: 600 }}>{Math.round(weight * 100)}% weight</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${weight * 100 * 2.5}%`, background: 'var(--accent-primary)', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Strengths, Weaknesses, Recommendations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Strengths */}
                <div className="glass-panel" style={{ padding: 24, borderLeft: '4px solid #10b981' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <CheckCircle2 size={18} /> Strong Areas (Key Assets)
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    {(predictionData?.prediction?.strengths || []).map((s, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Check size={14} color="#10b981" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="glass-panel" style={{ padding: 24, borderLeft: '4px solid #f59e0b' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <AlertCircle size={18} /> Improvement Areas (Skill Gaps)
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    {(predictionData?.prediction?.weaknesses || []).map((w, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>!</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Recommendations */}
                <div className="glass-panel" style={{ padding: 24, borderLeft: '4px solid var(--accent-primary)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <TrendingUp size={18} /> Personalized Recommendations
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    {(predictionData?.prediction?.recommendations || []).map((r, idx) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowRight size={14} color="var(--accent-primary)" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OFFICIAL INSTITUTIONAL RECORD (READ-ONLY) */}
      {activeTab === 'official' && (
        <div className="glass-panel" style={{ padding: 28, maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Institutional Academic Identity</h2>
          </div>

          <div style={{
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            marginBottom: 24,
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <Info size={16} color="var(--text-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Institution Controlled:</strong> {officialInfo.read_only_notice || 'Official records are strictly managed by administrative staff. If there is an error in your department, PRN, or batch, please contact your mentor or university admin.'}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Permanent Registration Number (PRN)</label>
              <input className="form-input" value={officialInfo.prn || user?.prn || ''} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={officialInfo.name || user?.name || ''} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Institutional Email</label>
              <input className="form-input" value={officialInfo.email || user?.email || ''} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={officialInfo.department || 'Department of Computer Science and Applications'} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Course / Degree</label>
              <input className="form-input" value={officialInfo.course || 'Masters of Science in Computer Science'} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year & Semester</label>
              <input className="form-input" value={`${officialInfo.academic_year || '2026-27'} • ${officialInfo.semester || 'Semester 1'}`} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Batch</label>
              <input className="form-input" value={officialInfo.batch || 'Group 13'} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Mentor / Supervisor</label>
              <input className="form-input" value="Prof. Pradeep Tiwari Sir" readOnly />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE & SKILLS PORTFOLIO (PERMITTED EDITS) */}
      {activeTab === 'portfolio' && (
        <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: 28, maxWidth: 1000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Placement Profile & Portfolio</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Update your academic scores, technical skills, projects, and certifications.</p>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={15} /> Save Changes
            </button>
          </div>

          {profileSaveMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: 16, fontSize: '0.85rem' }}>
              {profileSaveMsg}
            </div>
          )}

          {/* Academic Percentages */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-accent)', marginBottom: 12 }}>Academic Credentials</h3>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">10th Standard Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={profile.tenth_percent || ''}
                onChange={e => setProfile({ ...profile, tenth_percent: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">12th / Diploma Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={profile.twelfth_percent || ''}
                onChange={e => setProfile({ ...profile, twelfth_percent: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">University Aggregate CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={profile.cgpa || ''}
                onChange={e => setProfile({ ...profile, cgpa: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overall Attendance (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={profile.attendance_percent || ''}
                onChange={e => setProfile({ ...profile, attendance_percent: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Backlogs Count</label>
              <input
                type="number"
                className="form-input"
                value={profile.active_backlogs || 0}
                onChange={e => setProfile({ ...profile, active_backlogs: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Historical Cleared Backlogs</label>
              <input
                type="number"
                className="form-input"
                value={profile.history_backlogs || 0}
                onChange={e => setProfile({ ...profile, history_backlogs: e.target.value })}
              />
            </div>
          </div>

          {/* Technical Skills */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-accent)', marginBottom: 12 }}>Technical Skills Tag Cloud</h3>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input
                className="form-input"
                placeholder="Add skill (e.g. Docker, TypeScript, PyTorch)..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (skillInput.trim()) {
                      const cur = Array.isArray(profile.skills) ? profile.skills : [];
                      if (!cur.includes(skillInput.trim())) {
                        setProfile({ ...profile, skills: [...cur, skillInput.trim()] });
                      }
                      setSkillInput('');
                    }
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (skillInput.trim()) {
                    const cur = Array.isArray(profile.skills) ? profile.skills : [];
                    if (!cur.includes(skillInput.trim())) {
                      setProfile({ ...profile, skills: [...cur, skillInput.trim()] });
                    }
                    setSkillInput('');
                  }
                }}
              >
                Add Skill
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(Array.isArray(profile.skills) ? profile.skills : []).map((s, idx) => (
                <span key={idx} style={{
                  background: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: '#93c5fd',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {s}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== idx) })}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-accent)', marginBottom: 12 }}>Featured Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {(Array.isArray(profile.projects) ? profile.projects : []).map((proj, pIdx) => (
              <div key={pIdx} className="glass-panel" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{proj.title}</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 4 }}>{proj.description}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem', marginTop: 8 }}>
                  {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer">GitHub Repository ↗</a>}
                  {proj.live_url && <a href={proj.live_url} target="_blank" rel="noreferrer">Live Demo ↗</a>}
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* TAB 4: DOCUMENT VERIFICATION TRACKER */}
      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 24, alignItems: 'start' }}>
          {/* Upload Card */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UploadCloud size={20} color="var(--accent-primary)" /> Upload Supporting Document
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Upload your documents for faculty verification. Supported formats: <strong>PDF, JPG, PNG</strong> (Max 5MB).
            </p>

            <form onSubmit={handleDocumentUpload}>
              <div className="form-group">
                <label className="form-label">Document Category</label>
                <select className="form-select" value={uploadType} onChange={e => setUploadType(e.target.value)}>
                  <option value="resume">Resume / CV (PDF)</option>
                  <option value="10th_result">10th Standard Marksheet</option>
                  <option value="12th_result">12th / Diploma Marksheet</option>
                  <option value="university_result">University Semester Grade Card</option>
                  <option value="certifications">Technical Certification Proof</option>
                  <option value="internship_proof">Internship Completion Letter</option>
                  <option value="project_evidence">Project Architecture / Evidence</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select File</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="form-input"
                  onChange={e => setSelectedFile(e.target.files[0])}
                />
              </div>

              {uploadMsg && (
                <div style={{ fontSize: '0.8rem', color: uploadMsg.includes('success') ? '#34d399' : '#fb7185', marginBottom: 12 }}>
                  {uploadMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit for Verification
              </button>
            </form>
          </div>

          {/* Verification Table */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Uploaded Documents Status</h3>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No documents uploaded yet. Upload your resume and marksheets to initiate faculty verification.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {documents.map(doc => (
                  <div key={doc.id} className="glass-panel" style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.original_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Category: <strong>{doc.doc_type}</strong> • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`badge ${doc.status === 'verified' ? 'badge-verified' : doc.status === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                        {doc.status}
                      </span>
                    </div>

                    {/* If Rejected: Show Teacher Reason */}
                    {doc.status === 'rejected' && doc.rejection_reason && (
                      <div style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        borderLeft: '3px solid #f43f5e',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.775rem',
                        color: '#fb7185'
                      }}>
                        <strong>Rejection Reason:</strong> {doc.rejection_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ONLINE ASSESSMENTS (CODING & APTITUDE) */}
      {activeTab === 'assessments' && (
        <div>
          {/* Assessment Runner Modal / Active View */}
          {activeAssessment ? (
            <div className="glass-panel glow-border" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {activeAssessment.type === 'coding' ? 'Coding Test Engine' : 'Aptitude Test'}
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>{activeAssessment.title}</h2>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveAssessment(null)}>
                    Exit Test
                  </button>
                  <button className="btn btn-success btn-sm" onClick={handleSubmitAssessment}>
                    <Send size={15} /> Submit Assessment
                  </button>
                </div>
              </div>

              {/* Assessment Questions / Interactive Interface */}
              {activeAssessment.type === 'coding' ? (
                /* Coding assessment split layout */
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 20 }}>
                  {/* Problem statement */}
                  <div className="glass-panel" style={{ padding: 20, maxHeight: 600, overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Problem {activeQIndex + 1} of {assessmentQuestions.length}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 12px' }}>
                      {assessmentQuestions[activeQIndex]?.question_text?.split(':')[0] || 'Algorithm Challenge'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {assessmentQuestions[activeQIndex]?.question_text}
                    </p>

                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-accent)' }}>Sample Test Cases:</h4>
                      {(assessmentQuestions[activeQIndex]?.visible_test_cases || []).map((tc, tcIdx) => (
                        <div key={tcIdx} style={{ background: 'rgba(0, 0, 0, 0.4)', padding: 10, borderRadius: 6, marginTop: 8, fontSize: '0.775rem', fontFamily: 'var(--font-mono)' }}>
                          <div>Input: {tc.input}</div>
                          <div style={{ color: '#34d399' }}>Expected: {tc.expected}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lock size={13} />
                      <span>Hidden Edge-Case Tests: {assessmentQuestions[activeQIndex]?.hidden_test_cases_count || 1} test cases will be validated upon submission.</span>
                    </div>
                  </div>

                  {/* Code Editor Simulator */}
                  <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>JavaScript (Node 20+)</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => alert('Code syntax verified! Test cases will be verified upon final submission.')}
                      >
                        <Play size={14} color="#34d399" /> Run Code
                      </button>
                    </div>
                    <textarea
                      value={codingCode}
                      onChange={e => setCodingCode(e.target.value)}
                      style={{
                        width: '100%',
                        height: 380,
                        background: '#090d16',
                        color: '#f8fafc',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        resize: 'none',
                        lineHeight: 1.5,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Aptitude assessment MCQ view */
                <div className="glass-panel" style={{ padding: 24, maxWidth: 850 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span className="badge badge-info">Question {activeQIndex + 1} of {assessmentQuestions.length}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Category: <strong>{assessmentQuestions[activeQIndex]?.category}</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 20 }}>
                    {assessmentQuestions[activeQIndex]?.question_text}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {(assessmentQuestions[activeQIndex]?.options || []).map((opt, optIdx) => {
                      const curQId = assessmentQuestions[activeQIndex]?.id;
                      const isSelected = selectedAnswers[curQId] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [curQId]: optIdx })}
                          style={{
                            textAlign: 'left',
                            padding: '12px 16px',
                            background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                          }}
                        >
                          <span style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Navigator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={activeQIndex === 0}
                      onClick={() => setActiveQIndex(activeQIndex - 1)}
                    >
                      Previous Question
                    </button>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {assessmentQuestions.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveQIndex(i)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: activeQIndex === i ? 'var(--accent-primary)' : selectedAnswers[assessmentQuestions[i]?.id] !== undefined ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={activeQIndex === assessmentQuestions.length - 1}
                      onClick={() => setActiveQIndex(activeQIndex + 1)}
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Assessments Catalog */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {assessments.map(a => (
                <div key={a.id} className="glass-panel" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={`badge ${a.type === 'coding' ? 'badge-info' : 'badge-warning'}`}>
                          {a.type === 'coding' ? 'Coding Test' : 'Aptitude Test'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Duration: {a.duration_minutes} Mins • Total Marks: {a.total_marks}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 6px' }}>{a.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 700 }}>
                        {a.description}
                      </p>
                    </div>

                    <div>
                      {a.has_submitted ? (
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-verified" style={{ fontSize: '0.8rem' }}>
                            Score: {a.submission?.score} / {a.submission?.max_score} ({a.submission?.percentage}%)
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Submitted on {new Date(a.submission?.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => startAssessment(a)}>
                          <Play size={14} /> Start Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
