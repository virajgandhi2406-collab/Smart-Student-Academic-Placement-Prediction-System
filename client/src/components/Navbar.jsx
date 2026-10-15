import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  UserCheck, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function Navbar({ onOpenAuthModal }) {
  const { user, token, logout, quickSwitchRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetch('/api/common/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setNotifications(data.notifications || []);
        })
        .catch(() => {});
    }
  }, [token, user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    for (const n of notifications.filter(x => !x.is_read)) {
      await fetch(`/api/common/notifications/${n.id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <header className="navbar-container" style={{
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand & University Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                EduPredict
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>v2.6 ML</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              MIT World Peace University • School of Computer Science & Engineering
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {/* Quick Role Switcher Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  title="Switch between project team members and mentor"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Users size={15} />
                  <span>Switch Role Demo</span>
                </button>

                {showRoleSwitcher && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: 280,
                    padding: 12,
                    zIndex: 200,
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Test As Role (One-Click)
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }}
                      onClick={() => { quickSwitchRole('viraj.gandhi@mitwpu.edu.in'); setShowRoleSwitcher(false); }}
                    >
                      <UserCheck size={14} color="#34d399" />
                      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 600 }}>Viraj Gandhi (Student)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>M.Sc CS • PRN 1272260230</div>
                      </div>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }}
                      onClick={() => { quickSwitchRole('ansari.faizalam@mitwpu.edu.in'); setShowRoleSwitcher(false); }}
                    >
                      <UserCheck size={14} color="#34d399" />
                      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 600 }}>Ansari FaizAlam (Leader)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>M.Sc CS • PRN 1272260053</div>
                      </div>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }}
                      onClick={() => { quickSwitchRole('pradeep.tiwari@mitwpu.edu.in'); setShowRoleSwitcher(false); }}
                    >
                      <BookOpen size={14} color="#60a5fa" />
                      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 600 }}>Prof. Pradeep Tiwari Sir</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Faculty Mentor • Approver</div>
                      </div>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => { quickSwitchRole('admin@mitwpu.edu.in'); setShowRoleSwitcher(false); }}
                    >
                      <ShieldCheck size={14} color="#f43f5e" />
                      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 600 }}>Dean / Head Administrator</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Institutional Root & Audits</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNotifs(!showNotifs)}
                  style={{ position: 'relative', padding: '8px 10px' }}
                  aria-label="View notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: 'var(--accent-rose)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: 320,
                    maxHeight: 380,
                    overflowY: 'auto',
                    padding: 16,
                    zIndex: 200,
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                        No new notifications
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: n.is_read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(37, 99, 235, 0.12)',
                            borderLeft: `3px solid ${n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : '#2563eb'}`,
                            fontSize: '0.8rem'
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current User Tag */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#f43f5e' : user.role === 'teacher' ? '#3b82f6' : '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'teacher' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                      {user.role}
                    </span>
                    {user.prn && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.prn}</span>}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuthModal}>
              <UserCheck size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
