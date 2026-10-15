import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Key, 
  Mail, 
  User, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration step flow (Synopsis Phase 1)
  const [regStep, setRegStep] = useState(1); // 1: PRN & Email, 2: OTP, 3: Set Password
  const [regName, setRegName] = useState('');
  const [regPrn, setRegPrn] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, prn: regPrn })
      });
      const data = await res.json();
      if (data.success) {
        setDemoOtpHint(data.demo_otp || '');
        setSuccessMsg(data.message);
        setRegStep(2);
      } else {
        setErrorMsg(data.message || 'OTP request failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 & 3: Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-verify-and-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          prn: regPrn,
          otp: regOtp,
          password: regPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setTab('login');
          setEmail(regEmail);
          setPassword(regPassword);
          setRegStep(1);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Registration service error.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Fill
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('EduPredict@2026');
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: 480 }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>EduPredict Portal</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Single Sign-On for Students, Faculty & Administrators
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(0, 0, 0, 0.3)', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <button
            className={`btn btn-sm ${tab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button
            className={`btn btn-sm ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Student Registration (OTP)
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: '0.825rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.825rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' ? (
          <div>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">University Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. viraj.gandhi@mitwpu.edu.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to EduPredict'}
              </button>
            </form>

            {/* Quick Demo Autofill Buttons */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 20, paddingTop: 16 }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                One-Click Demo Credentials
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => fillDemo('viraj.gandhi@mitwpu.edu.in')}
                >
                  Student (Viraj)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => fillDemo('ansari.faizalam@mitwpu.edu.in')}
                >
                  Student (FaizAlam)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => fillDemo('pradeep.tiwari@mitwpu.edu.in')}
                >
                  Mentor (Prof. Tiwari)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => fillDemo('admin@mitwpu.edu.in')}
                >
                  Head Admin
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION TAB (OTP WORKFLOW) */
          <div>
            {regStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    placeholder="Your Full Name"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Permanent Registration Number (PRN)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 1272260230"
                    value={regPrn}
                    onChange={e => setRegPrn(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">University Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. yourname@mitwpu.edu.in"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Request Email OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteRegistration}>
                {demoOtpHint && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: 10, borderRadius: 6, fontSize: '0.8rem', color: '#a5b4fc', marginBottom: 14 }}>
                    🔑 Demo Email Verification OTP: <strong>{demoOtpHint}</strong>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input
                    className="form-input"
                    placeholder="Enter OTP"
                    value={regOtp}
                    onChange={e => setRegOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Create Password (Min 8 chars)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                  {loading ? 'Activating...' : 'Verify OTP & Activate Account'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
