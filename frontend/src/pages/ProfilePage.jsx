import { useSelector } from 'react-redux';
import { User, Mail, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>My Profile</h1>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.75rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</h2>
            <span style={{
              display: 'inline-block', marginTop: '0.375rem',
              background: user.role === 'doctor' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
              color: user.role === 'doctor' ? '#6366f1' : '#10b981',
              padding: '0.2rem 0.75rem', borderRadius: 100,
              fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize',
            }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { label: 'Full Name', value: user.name, icon: User },
            { label: 'Email Address', value: user.email, icon: Mail },
            { label: 'Role', value: user.role, icon: Shield },
            { label: 'Member Since', value: user.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : '—', icon: null },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={label} style={{
              display: 'flex', gap: '1rem', padding: '1rem 0',
              borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none',
              alignItems: 'center',
            }}>
              {Icon && (
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(99,102,241,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={15} style={{ color: 'var(--color-primary)' }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.15rem', textTransform: 'capitalize' }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
