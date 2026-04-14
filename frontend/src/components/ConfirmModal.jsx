import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 1.25rem',
            background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={24} style={{ color: danger ? '#ef4444' : '#6366f1' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
              style={{ flex: 1 }}
              id="confirm-action-btn"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
