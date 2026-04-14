import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="lg:block">
        <Sidebar
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 49, backdropFilter: 'blur(2px)',
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div style={{
        position: 'fixed', left: mobileMenuOpen ? 0 : -280,
        top: 0, bottom: 0, zIndex: 50,
        transition: 'left 0.25s ease',
        display: 'block',
      }} className="lg:hidden">
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
        />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: 0,
        transition: 'margin-left 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
        className="lg:ml-[var(--sidebar-width)]"
      >
        <Navbar
          onMenuToggle={() => setMobileMenuOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((v) => !v)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
        />
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        :root { --sidebar-width: ${sidebarOpen ? '260px' : '72px'}; }
        @media (min-width: 1024px) {
          .lg\\:block { display: block !important; }
          .lg\\:hidden { display: none !important; }
          .lg\\:ml-\\[var\\(--sidebar-width\\)\\] { margin-left: var(--sidebar-width) !important; }
        }
      `}</style>
    </div>
  );
}
