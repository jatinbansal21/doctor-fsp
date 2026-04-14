import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatient } from '../features/patients/patientSlice';
import { patientAPI } from '../api/services';
import {
  ChevronLeft, Edit2, Phone, Mail, Calendar, User,
  Activity, Clock, Shield, Heart, AlertCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';

function InfoRow({ label, value, icon: Icon }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'rgba(99,102,241,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {Icon && <Icon size={14} style={{ color: 'var(--color-primary)' }} />}
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.15rem' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, iconColor = 'var(--color-primary)' }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{
        fontSize: '0.8rem', fontWeight: 700, color: iconColor,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        {Icon && <Icon size={13} />} {title}
      </h3>
      {children}
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedPatient, isLoading } = useSelector((state) => state.patients);
  const { user } = useSelector((state) => state.auth);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    dispatch(fetchPatient(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (activeTab === 'history' && user?.role === 'doctor') {
      setHistoryLoading(true);
      patientAPI.getHistory(id)
        .then((r) => setHistory(r.data.data))
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, id, user]);

  if (isLoading || !selectedPatient) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const p = selectedPatient;

  const changeTypeColor = {
    CREATE: '#10b981', UPDATE: '#6366f1', DELETE: '#ef4444',
    RESTORE: '#f59e0b', IMPORT: '#3b82f6',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon">
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: `hsl(${p.name.charCodeAt(0) * 7 % 360},60%,55%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '1.35rem',
            }}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {p.gender && <span className="badge badge-info">{p.gender}</span>}
                {p.bloodGroup && <span className="badge badge-purple">{p.bloodGroup}</span>}
                {p.age && <span className="badge badge-gray">Age {p.age}</span>}
              </div>
            </div>
          </div>
        </div>
        <Link to={`/patients/${id}/edit`} className="btn btn-primary btn-sm">
          <Edit2 size={14} /> Edit Patient
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '0.3rem' }}>
        {[
          { key: 'info', label: 'Information' },
          { key: 'medical', label: 'Medical' },
          ...(user?.role === 'doctor' ? [{ key: 'admin', label: 'Administrative' }, { key: 'history', label: 'History' }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
              ...(activeTab === tab.key ? {
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              } : {
                background: 'transparent',
                color: 'var(--text-secondary)',
              }),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
          <Section title="Contact" icon={Phone}>
            <InfoRow label="Phone" value={p.contactNumber} icon={Phone} />
            <InfoRow label="Email" value={p.email} icon={Mail} />
            <InfoRow label="Address" value={p.address} icon={User} />
            <InfoRow label="Admit Date" value={p.admitDate ? format(new Date(p.admitDate), 'dd MMMM yyyy') : null} icon={Calendar} />
          </Section>
          <Section title="Emergency Contact" icon={AlertCircle} iconColor="#f59e0b">
            <InfoRow label="Name" value={p.emergencyContactName} icon={User} />
            <InfoRow label="Contact" value={p.emergencyContact} icon={Phone} />
          </Section>
          <Section title="Identifiers" icon={Shield} iconColor="#3b82f6">
            <InfoRow label="Patient ID" value={p._id} />
            <InfoRow label="Doctor Assigned" value={p.doctorAssigned?.name} icon={User} />
            <InfoRow label="Created" value={format(new Date(p.createdAt), 'dd MMM yyyy, HH:mm')} icon={Clock} />
            <InfoRow label="Last Updated" value={format(new Date(p.updatedAt), 'dd MMM yyyy, HH:mm')} icon={Clock} />
          </Section>
        </div>
      )}

      {activeTab === 'medical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
          <Section title="Medical Details" icon={Heart} iconColor="#ef4444">
            <InfoRow label="Blood Group" value={p.bloodGroup} />
            <InfoRow label="Allergies" value={p.allergies} />
            <InfoRow label="Current Medications" value={p.currentMedications} />
            <InfoRow label="Medical History" value={p.medicalHistory} />
            <InfoRow label="Social History" value={p.socialHistory} />
          </Section>
        </div>
      )}

      {activeTab === 'admin' && user?.role === 'doctor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
          <Section title="Administrative" icon={FileText} iconColor="#6366f1">
            <InfoRow label="Payor Type" value={p.payorType} />
            <InfoRow label="Reference" value={p.reference} />
            <InfoRow label="Remarks" value={p.remarks} />
            <InfoRow label="Review" value={p.review} />
            <InfoRow label="Father's Education Proof" value={p.fathersEducationProof} />
          </Section>
        </div>
      )}

      {activeTab === 'history' && user?.role === 'doctor' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Change History
            </h3>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div className="spinner spinner-dark" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>No history available.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((log) => (
                  <div key={log._id} style={{
                    padding: '1rem',
                    background: 'var(--bg-base)', borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  }}>
                    <div style={{
                      padding: '0.25rem 0.6rem', borderRadius: 100,
                      background: `${changeTypeColor[log.changeType]}20`,
                      color: changeTypeColor[log.changeType],
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {log.changeType}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        By <strong>{log.changedBy?.name || 'Unknown'}</strong>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>({log.changedBy?.role})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss')}
                      </div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                          {Object.entries(log.changes).slice(0, 5).map(([field, val]) => (
                            <div key={field} style={{ color: 'var(--text-secondary)' }}>
                              <strong>{field}:</strong>{' '}
                              <span style={{ textDecoration: 'line-through', color: 'var(--color-danger)' }}>
                                {String(val.before ?? '—')}
                              </span>
                              {' → '}
                              <span style={{ color: '#10b981' }}>{String(val.after ?? '—')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
