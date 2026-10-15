import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import AdminPortal from './components/AdminPortal';
import LoginModal from './components/LoginModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import {
  Brain,
  ShieldCheck,
  Code2,
  FileCheck,
  ArrowRight,
  Cpu,
  Lock,
  GraduationCap,
  FileText,
  Scale
} from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'privacy', 'terms'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            border: '3px solid rgba(37, 99, 235, 0.2)',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading EduPredict Core Services...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />

      <main style={{ flex: 1 }}>
        {currentView === 'privacy' ? (
          <PrivacyPolicy onBack={() => setCurrentView('home')} />
        ) : currentView === 'terms' ? (
          <TermsAndConditions onBack={() => setCurrentView('home')} />
        ) : user ? (
          <>
            {user.role === 'student' && <StudentPortal />}
            {user.role === 'teacher' && <TeacherPortal />}
            {user.role === 'admin' && <AdminPortal />}
          </>
        ) : (
          /* Public Hero & Showcase Landing View */
          <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
            {/* Hero Section */}
            <div className="glass-panel" style={{ padding: '48px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: 40 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-accent)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: 20
              }}>
                <GraduationCap size={15} /> Dr. Vishwanath Karad MIT World Peace University, Pune
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, maxWidth: 900, margin: '0 auto 18px', letterSpacing: '-0.03em' }}>
                Smart Student Academic &{' '}
                <span style={{ color: 'var(--text-accent)' }}>
                  Placement Prediction System
                </span>
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 760, margin: '0 auto 28px', lineHeight: 1.6 }}>
                An institutional academic intelligence and career readiness platform for MIT World Peace University. Integrates authenticated student portfolios, timed coding and aptitude examinations, multi-stage faculty document verification, and explainable machine learning models for placement readiness evaluation.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
                  Access System Portal <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary" onClick={() => setAuthModalOpen(true)}>
                  Demo Logins (Student / Teacher / Admin)
                </button>
              </div>

              {/* Security Specification Strip */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399' }}><ShieldCheck size={14} /> Role-Based Access Control (RBAC)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={14} /> bcrypt (12 salt rounds)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cpu size={14} /> 4 ML Estimators (RF, XGBoost, DT, LR)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileCheck size={14} /> Faculty Verification Gating</span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid-3" style={{ marginBottom: 40 }}>
              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Brain size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Explainable Placement ML</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Gated prediction unlocked strictly after faculty document verification. Delivers placement probability percentages, factor weights, skill assets, and actionable improvement recommendations.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Code2 size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Automated Assessments</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Algorithm coding assessments with automated visible and hidden test case evaluation, accompanied by timed quantitative and logical reasoning aptitude examinations with negative marking.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(5, 150, 105, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <FileCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Document Verification</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Faculty verification queue to inspect uploaded marksheets and resumes. Facilitates approval or rejection with documented feedback reasons and tamper-resistant audit logs.
                </p>
              </div>
            </div>

            {/* Synopsis Project Attribution Card */}
            <div className="glass-panel" style={{ padding: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Mini Project: Course Code MSC40040: First Year M.Sc Computer Science (2026-27)
              </div>
              <div>Group 13: Ansari FaizAlam M. (Leader) • Viraj Gandhi P. • Vraj Modi J. • Priyanka Jana T.</div>
              <div style={{ marginTop: 4, color: 'var(--text-accent)' }}>Faculty Mentor: Prof. Pradeep Tiwari Sir</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setCurrentView('home')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
            >
              System Home
            </button>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <button
              onClick={() => setCurrentView('privacy')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
            >
              Privacy Policy
            </button>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <button
              onClick={() => setCurrentView('terms')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
            >
              Terms & Conditions
            </button>
          </div>
          <div>
            EduPredict © 2026 MIT World Peace University, Pune • School of Computer Science & Engineering. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login & Registration Modal */}
      <LoginModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
