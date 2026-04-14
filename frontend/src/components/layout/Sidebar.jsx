import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Archive, User, LogOut,
  ChevronLeft, ChevronRight, Activity, Moon, Sun
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients', doctorOnly: false },
  { to: '/archived', icon: Archive, label: 'Archived', doctorOnly: true },
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ collapsed, onToggle, darkMode, onToggleDark }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarStyle = {
    width: collapsed ? 72 : 260,
    background: 'var(--bg-sidebar)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    position: 'relative',
  };

  const activeLinkStyle = {
    background: 'rgba(99,102,241,0.2)',
    color: '#818cf8',
    borderRight: '3px solid #6366f1',
  };
  const defaultLinkStyle = {
    color: 'rgba(255,255,255,0.6)',
    borderRight: '3px solid transparent',
  };

  return (
    <div style={sidebarStyle}>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1rem',
        display: 'flex', alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        minHeight: 68,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          <Activity size={20} color="white" />
        </div>
        {!collapsed && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
              MedCare
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
              Patient System
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.08)',
            border: 'none', color: 'rgba(255,255,255,0.6)',
            width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                gap: 4, marginTop: 2,
              }}>
                <span style={{
                  background: user.role === 'doctor' ? 'rgba(99,102,241,0.25)' : 'rgba(16,185,129,0.25)',
                  color: user.role === 'doctor' ? '#818cf8' : '#34d399',
                  fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                  borderRadius: 100, textTransform: 'capitalize',
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          if (item.doctorOnly && user?.role !== 'doctor') return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.75rem' : '0.7rem 1rem',
                margin: '0.125rem 0.5rem',
                borderRadius: 10,
                textDecoration: 'none',
                transition: 'all 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                ...(isActive ? {
                  background: 'rgba(99,102,241,0.2)',
                  color: '#818cf8',
                } : {
                  color: 'rgba(255,255,255,0.55)',
                }),
              })}
              title={collapsed ? item.label : ''}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: '0.875rem', fontWeight: 500, animation: 'fadeIn 0.2s ease' }}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Dark mode toggle + logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            width: '100%', padding: collapsed ? '0.65rem' : '0.65rem 0.75rem',
            background: 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '0.5rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.2s',
          }}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (
            <span style={{ fontSize: '0.8rem', fontWeight: 500, animation: 'fadeIn 0.2s ease' }}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            width: '100%', padding: collapsed ? '0.65rem' : '0.65rem 0.75rem',
            background: 'rgba(239,68,68,0.1)',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            color: '#f87171',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.2s',
          }}
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && (
            <span style={{ fontSize: '0.8rem', fontWeight: 500, animation: 'fadeIn 0.2s ease' }}>
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
