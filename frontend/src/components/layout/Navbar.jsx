import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, Bell, Sun, Moon, ChevronRight, Home } from 'lucide-react';

const routeNames = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/patients/new': 'Add Patient',
  '/archived': 'Archived Patients',
  '/profile': 'My Profile',
};

export default function Navbar({ onMenuToggle, darkMode, onToggleDark }) {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path.match(/\/patients\/[^/]+\/edit/)) return 'Edit Patient';
    if (path.match(/\/patients\/[^/]+/)) return 'Patient Details';
    return routeNames[path] || 'Dashboard';
  };

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.875rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(8px)',
    }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--bg-base)', border: '1px solid var(--border-color)',
          cursor: 'pointer', color: 'var(--text-secondary)',
        }}
        className="lg-hide"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Home size={14} />
        </Link>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {getCurrentPageName()}
        </span>
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-base)', border: '1px solid var(--border-color)',
            cursor: 'pointer', color: 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User avatar */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.8rem',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'none' }} className="show-sm">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-hide { display: none !important; } }
        @media (min-width: 640px) { .show-sm { display: block !important; } }
      `}</style>
    </header>
  );
}
