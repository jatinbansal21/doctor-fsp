import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Search, Filter, Download, Upload,
  LayoutGrid, LayoutList, ChevronLeft, ChevronRight,
  Edit2, Trash2, Eye, RotateCcw, X
} from 'lucide-react';
import { fetchPatients, deletePatient } from '../features/patients/patientSlice';
import { uploadAPI } from '../api/services';
import UploadModal from '../components/UploadModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function GenderBadge({ gender }) {
  const map = { Male: 'info', Female: 'purple', Other: 'gray' };
  return <span className={`badge badge-${map[gender] || 'gray'}`}>{gender || '—'}</span>;
}

export default function PatientsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, pagination, isLoading } = useSelector((state) => state.patients);
  const { user } = useSelector((state) => state.auth);

  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ gender: '', ageMin: '', ageMax: '', admitFrom: '', admitTo: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    dispatch(fetchPatients({
      search: debouncedSearch,
      page,
      limit: 10,
      ...filters,
    }));
  }, [dispatch, debouncedSearch, page, filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    const res = await dispatch(deletePatient(deleteId));
    if (!res.error) toast.success('Patient archived successfully');
    else toast.error('Failed to archive patient');
    setDeleteId(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await uploadAPI.exportExcel({ search: debouncedSearch, ...filters });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients_${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch (_) { toast.error('Export failed'); }
    setExporting(false);
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ gender: '', ageMin: '', ageMax: '', admitFrom: '', admitTo: '' });
    setPage(1);
  };

  const activeFilters = Object.values(filters).filter(Boolean).length + (debouncedSearch ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{pagination.total} total records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          {user?.role === 'doctor' && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setUploadOpen(true)}
                id="import-excel-btn"
              >
                <Upload size={14} /> Import Excel
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleExport}
                disabled={exporting}
                id="export-excel-btn"
              >
                <Download size={14} /> {exporting ? 'Exporting...' : 'Export'}
              </button>
              <Link to="/patients/new" className="btn btn-primary btn-sm" id="add-patient-btn">
                <UserPlus size={14} /> Add Patient
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
            <Search size={15} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.375rem', paddingRight: search ? '2.375rem' : undefined }}
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              id="patient-search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', padding: 2,
              }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
            id="filter-toggle-btn"
          >
            <Filter size={14} />
            Filters
            {activeFilters > 0 && (
              <span style={{
                background: 'var(--color-danger)', color: 'white',
                borderRadius: '50%', width: 18, height: 18,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>{activeFilters}</span>
            )}
          </button>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-base)', padding: '0.2rem', borderRadius: 8 }}>
            <button
              onClick={() => setView('table')}
              className={`btn btn-icon btn-sm ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ border: 'none' }}
              title="Table view"
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setView('card')}
              className={`btn btn-icon btn-sm ${view === 'card' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ border: 'none' }}
              title="Card view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
            gap: '0.75rem', marginTop: '0.875rem',
            paddingTop: '0.875rem', borderTop: '1px solid var(--border-color)',
            animation: 'fadeInUp 0.2s ease',
          }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                value={filters.gender}
                onChange={(e) => { setFilters({ ...filters, gender: e.target.value }); setPage(1); }}
              >
                <option value="">All</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Age Min</label>
              <input type="number" className="form-input" placeholder="0"
                value={filters.ageMin} onChange={(e) => { setFilters({ ...filters, ageMin: e.target.value }); setPage(1); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Age Max</label>
              <input type="number" className="form-input" placeholder="120"
                value={filters.ageMax} onChange={(e) => { setFilters({ ...filters, ageMax: e.target.value }); setPage(1); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Admit From</label>
              <input type="date" className="form-input"
                value={filters.admitFrom} onChange={(e) => { setFilters({ ...filters, admitFrom: e.target.value }); setPage(1); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Admit To</label>
              <input type="date" className="form-input"
                value={filters.admitTo} onChange={(e) => { setFilters({ ...filters, admitTo: e.target.value }); setPage(1); }} />
            </div>
          </div>
        )}
      </div>

      {/* Patient list */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto 0.875rem' }} />
            Loading patients...
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <Search size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.375rem' }}>No patients found</p>
            <p style={{ fontSize: '0.8rem' }}>
              {activeFilters > 0 ? 'Try adjusting your filters' : 'Add your first patient to get started'}
            </p>
          </div>
        ) : view === 'table' ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Admit Date</th>
                  <th>Doctor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => (
                  <tr key={p._id} style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `hsl(${p.name.charCodeAt(0) * 7 % 360},60%,55%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                        }}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.contactNumber}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.age || '—'}</td>
                    <td><GenderBadge gender={p.gender} /></td>
                    <td>
                      {p.bloodGroup ? (
                        <span className="badge badge-info">{p.bloodGroup}</span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {p.admitDate ? format(new Date(p.admitDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {p.doctorAssigned?.name || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => navigate(`/patients/${p._id}`)}
                          className="btn btn-icon btn-ghost btn-sm"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/patients/${p._id}/edit`)}
                          className="btn btn-icon btn-ghost btn-sm"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        {user?.role === 'doctor' && (
                          <button
                            onClick={() => setDeleteId(p._id)}
                            className="btn btn-icon btn-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444' }}
                            title="Archive"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Card view
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem', padding: '1.25rem' }}>
            {patients.map((p, i) => (
              <div
                key={p._id}
                className="glass-card"
                style={{ padding: '1.25rem', cursor: 'pointer', animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}
                onClick={() => navigate(`/patients/${p._id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `hsl(${p.name.charCodeAt(0) * 7 % 360},60%,55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.1rem',
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.contactNumber}</div>
                  </div>
                  <GenderBadge gender={p.gender} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {p.age && <span className="badge badge-gray">Age {p.age}</span>}
                  {p.bloodGroup && <span className="badge badge-info">{p.bloodGroup}</span>}
                  {p.admitDate && (
                    <span className="badge badge-warning">
                      {format(new Date(p.admitDate), 'dd MMM yy')}
                    </span>
                  )}
                </div>
                {user?.role === 'doctor' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/patients/${p._id}/edit`)} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteId(p._id)} className="btn btn-sm"
                      style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}>
                      <Trash2 size={12} /> Archive
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total}
            </span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost btn-sm"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let p;
                if (pagination.pages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= pagination.pages - 2) p = pagination.pages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ width: 34, padding: 0 }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn btn-ghost btn-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload modal */}
      {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} onSuccess={() => { setUploadOpen(false); load(); }} />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <ConfirmModal
          title="Archive Patient"
          message="This patient will be archived (soft deleted) and can be restored later."
          confirmLabel="Archive"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
