import React from 'react';
import { ShieldCheck, Lock, Eye, Database, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 16 }}
        >
          <ArrowLeft size={16} /> Back to Portal
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Student & Institutional Data Privacy Policy</h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              EduPredict Academic Platform • Last Updated: October 2026 • MIT World Peace University
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px 28px', lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} color="var(--accent-primary)" /> 1. Scope & Institutional Governance
          </h2>
          <p>
            This Privacy Policy governs the collection, processing, storage, and retention of academic records, performance assessments, and credential documentation within the Smart Student Academic & Placement Prediction System (EduPredict) at the School of Computer Science & Engineering, Dr. Vishwanath Karad MIT World Peace University, Pune.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} color="var(--accent-primary)" /> 2. Information We Collect
          </h2>
          <p style={{ marginBottom: 10 }}>EduPredict collects only data essential for academic evaluation and career readiness modeling:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Institutional Identity Data:</strong> Permanent Registration Number (PRN), official student email, full name, batch, and enrolled degree program.</li>
            <li><strong>Academic Performance Indicators:</strong> Cumulative Grade Point Average (CGPA), semester grade percentages, active backlogs, completed internships, and training certifications.</li>
            <li><strong>Assessment Telemetry:</strong> Source code submissions, unit test execution logs, test case passage ratios, aptitude test scores, and assessment completion timestamps.</li>
            <li><strong>Verification Records:</strong> Uploaded marksheets, degree certificates, and resumes submitted for faculty audit.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={18} color="var(--accent-primary)" /> 3. Data Protection & Security Controls
          </h2>
          <p style={{ marginBottom: 10 }}>All records within EduPredict are safeguarded under strict technical controls:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Authentication Encryption:</strong> All credentials utilize bcrypt password hashing with 12 salt rounds. Plaintext passwords are never recorded or stored.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Student records are accessible solely to the respective authenticated student, assigned faculty mentors, and verified department administrators.</li>
            <li><strong>Sanitized Transport:</strong> All HTTP payloads are sanitized against cross-site scripting (XSS), parameter tampering, and injection vectors.</li>
            <li><strong>Zero Commercial Telemetry:</strong> EduPredict does not deploy third-party advertising trackers, marketing pixels, or commercial data brokerage scripts.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--accent-primary)" /> 4. Machine Learning Model Usage & Transparency
          </h2>
          <p>
            Academic variables and verified test scores processed by our machine learning pipelines (Random Forest, XGBoost, Decision Tree, Logistic Regression) are used exclusively for computing placement readiness estimates and generating localized skill-enhancement recommendations. Model features are explainable and visible to students without black-box score alterations.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} color="var(--accent-primary)" /> 5. Student Rights & Record Rectification
          </h2>
          <p>
            Students possess the right to inspect their recorded academic profile, verify uploaded documents, and request correction of discrepancies via their assigned faculty mentor or department administrator. Inquiries regarding institutional data management may be directed to the Department of Computer Science and Applications.
          </p>
        </section>
      </div>
    </div>
  );
}
