import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../api/services';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await uploadAPI.uploadExcel(formData);
      setResult(data.data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileSpreadsheet size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Import Excel</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload .xlsx, .xls or .csv file</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Dropzone */}
          {!result && (
            <>
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  borderRadius: 12, padding: '2.5rem', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: isDragActive ? 'rgba(99,102,241,0.05)' : 'var(--bg-base)',
                }}
              >
                <input {...getInputProps()} id="excel-file-input" />
                <Upload size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.875rem', display: 'block' }} />
                {file ? (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {isDragActive ? 'Drop the file here' : 'Drag & drop or click to select'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Supports .xlsx, .xls, .csv — Max 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Column guide */}
              <div style={{
                background: 'var(--bg-base)', borderRadius: 10, padding: '0.875rem',
                border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)',
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                  Required columns:
                </p>
                <p>• <strong>Name</strong> (required), <strong>Contact Number</strong> (required)</p>
                <p style={{ marginTop: '0.25rem' }}>• Optional: Email, Age, Gender, Blood Group, Address, Admit Date, Allergies, Medical History, etc.</p>
                <p style={{ marginTop: '0.25rem', color: 'var(--color-warning)' }}>⚠ Rows missing Name or Contact will be skipped.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="btn btn-success"
                  style={{ flex: 2 }}
                  id="upload-start-btn"
                >
                  {uploading ? <><div className="spinner" /> Uploading...</> : <><Upload size={15} /> Upload & Import</>}
                </button>
              </div>
            </>
          )}

          {/* Result */}
          {result && (
            <div style={{ animation: 'fadeInUp 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '0.875rem' }} />
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Import Complete!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Here's a summary of the import</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Imported', value: result.success, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                  { label: 'Skipped', value: result.skipped, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { label: 'Failed', value: result.failed, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ background: bg, borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>

              {result.errors?.length > 0 && (
                <div style={{
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10, padding: '0.875rem', maxHeight: 150, overflowY: 'auto',
                }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <AlertCircle size={13} /> Skipped rows:
                  </p>
                  {result.errors.slice(0, 10).map((e, i) => (
                    <p key={i} style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                      Row {e.row}: {e.reason}
                    </p>
                  ))}
                </div>
              )}

              <button onClick={onSuccess} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
