import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import AdminPortal from './components/AdminPortal';
import LoginModal from './components/LoginModal';
import {
  Brain,
  ShieldCheck,
  Code2,
  FileCheck,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Lock,
  Sparkles
} from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Initializing EduPredict Security Core...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />

      <main style={{ flex: 1 }}>
        {user ? (
          <>
            {user.role === 'student' && <StudentPortal />}
            {user.role === 'teacher' && <TeacherPortal />}
            {user.role === 'admin' && <AdminPortal />}
          </>
        ) : (
          /* Public Hero & Showcase Landing View */
          <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>
            {/* Hero Section */}
            <div className="glass-panel" style={{ padding: '48px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: 20 }}>
                <Sparkles size={14} /> Dr. Vishwanath Karad MIT World Peace University • Pune
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, maxWidth: 900, margin: '0 auto 18px', letterSpacing: '-0.03em' }}>
                Smart Student Academic &{' '}
                <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Placement Prediction System
                </span>
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 740, margin: '0 auto 28px', lineHeight: 1.6 }}>
                A centralized, verification-gated EdTech intelligence platform. Unifies student portfolios, coding & aptitude assessments, teacher document verification, and machine learning placement probability estimation.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
                  Access System Portal <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary" onClick={() => setAuthModalOpen(true)}>
                  Demo Logins (Student / Teacher / Admin)
                </button>
              </div>

              {/* Security Pill Strip */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399' }}><ShieldCheck size={14} /> Role-Based Access Control (RBAC)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={14} /> bcrypt (12 salt rounds)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Cpu size={14} /> 4 ML Models (RF, XGBoost, DT, LR)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FileCheck size={14} /> Faculty Verification Gating</span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid-3" style={{ marginBottom: 40 }}>
              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Brain size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Explainable Placement ML</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Gated prediction unlocked only after faculty document verification. Yields placement probability percentage, SHAP-style factor weights, strong areas, and actionable improvement recommendations.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Code2 size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Interactive Assessments</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Two coding assessments with code editor and automated visible & hidden test cases, plus one aptitude test featuring timed quantitative and logical reasoning MCQs with negative marking.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <FileCheck size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Document Verification</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Dedicated faculty queue to inspect uploaded marksheets and resumes. Allows approval or rejection with detailed feedback reasons.
                </p>
              </div>
            </div>

            {/* Synopsis Project Attribution Card */}
            <div className="glass-panel" style={{ padding: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Mini Project: Course Code MSC40040 • First Year M.Sc Computer Science (2026-27)
              </div>
              <div>Group 13: Ansari FaizAlam M. (Leader) • Viraj Gandhi P. • Vraj Modi J. • Priyanka Jana T.</div>
              <div style={{ marginTop: 4, color: 'var(--accent-primary)' }}>Faculty Mentor: Prof. Pradeep Tiwari Sir</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(10, 13, 20, 0.95)'
      }}>
        EduPredict © 2026 MIT World Peace University, Pune • School of Computer Science & Engineering. All rights reserved.
      </footer>

      {/* Login & Registration Modal */}
      <LoginModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
