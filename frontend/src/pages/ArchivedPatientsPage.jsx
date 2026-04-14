import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, restorePatient } from '../features/patients/patientSlice';
import { RotateCcw, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ArchivedPatientsPage() {
  const dispatch = useDispatch();
  const { patients, isLoading } = useSelector((state) => state.patients);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    dispatch(fetchPatients({ showDeleted: 'true', limit: 50 }));
  }, [dispatch]);

  const handleRestore = async (id) => {
    setRestoring(id);
    const res = await dispatch(restorePatient(id));
    setRestoring(null);
    if (!res.error) toast.success('Patient restored!');
    else toast.error('Restore failed');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Archived Patients</h1>
        <p className="page-subtitle">Soft-deleted records — restore anytime</p>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28, margin: '0 auto 0.75rem' }} />
            Loading...
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <Archive size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>No archived patients</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Deleted patients will appear here</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Archived On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email || '—'}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.contactNumber}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {p.deletedAt ? format(new Date(p.deletedAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleRestore(p._id)}
                        disabled={restoring === p._id}
                        className="btn btn-success btn-sm"
                      >
                        {restoring === p._id ? (
                          <div className="spinner" style={{ width: 14, height: 14 }} />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
