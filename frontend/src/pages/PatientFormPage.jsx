import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPatient, updatePatient, fetchPatient } from '../features/patients/patientSlice';
import { ChevronLeft, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_FIELDS = {
  'Basic Information': [
    { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Patient full name' },
    { key: 'contactNumber', label: 'Contact Number', type: 'tel', required: true, placeholder: '+91 9876543210' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'patient@email.com' },
    { key: 'age', label: 'Age', type: 'number', placeholder: '25' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['', 'Male', 'Female', 'Other'] },
    { key: 'bloodGroup', label: 'Blood Group', type: 'select', options: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full address...' },
    { key: 'admitDate', label: 'Admit Date', type: 'date' },
  ],
  'Emergency Contact': [
    { key: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text', placeholder: 'Contact person name' },
    { key: 'emergencyContact', label: 'Emergency Contact Number', type: 'tel', placeholder: '+91 9876543210' },
  ],
  'Medical Information': [
    { key: 'allergies', label: 'Allergies', type: 'textarea', placeholder: 'List any known allergies...' },
    { key: 'currentMedications', label: 'Current Medications', type: 'textarea', placeholder: 'Current medications...' },
    { key: 'medicalHistory', label: 'Medical History', type: 'textarea', placeholder: 'Past medical history...' },
    { key: 'socialHistory', label: 'Social History', type: 'textarea', placeholder: 'Social background...' },
  ],
  'Administrative (Doctor Only)': [
    { key: 'payorType', label: 'Payor Type', type: 'text', placeholder: 'Insurance / Self / etc.', doctorOnly: true },
    { key: 'reference', label: 'Reference', type: 'text', placeholder: 'Referred by...', doctorOnly: true },
    { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Additional remarks...', doctorOnly: true },
    { key: 'review', label: 'Review', type: 'textarea', placeholder: 'Review notes...', doctorOnly: true },
    { key: 'fathersEducationProof', label: "Father's Education Proof", type: 'text', placeholder: 'Document reference...', doctorOnly: true },
  ],
};

export default function PatientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { selectedPatient, isLoading } = useSelector((state) => state.patients);

  const [form, setForm] = useState({
    name: '', contactNumber: '', email: '', age: '', gender: '',
    bloodGroup: '', address: '', admitDate: '',
    emergencyContact: '', emergencyContactName: '',
    allergies: '', currentMedications: '', medicalHistory: '', socialHistory: '',
    payorType: '', reference: '', remarks: '', review: '', fathersEducationProof: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) dispatch(fetchPatient(id));
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && selectedPatient) {
      const d = selectedPatient;
      setForm({
        name: d.name || '', contactNumber: d.contactNumber || '', email: d.email || '',
        age: d.age || '', gender: d.gender || '', bloodGroup: d.bloodGroup || '',
        address: d.address || '',
        admitDate: d.admitDate ? d.admitDate.slice(0, 10) : '',
        emergencyContact: d.emergencyContact || '', emergencyContactName: d.emergencyContactName || '',
        allergies: d.allergies || '', currentMedications: d.currentMedications || '',
        medicalHistory: d.medicalHistory || '', socialHistory: d.socialHistory || '',
        payorType: d.payorType || '', reference: d.reference || '',
        remarks: d.remarks || '', review: d.review || '',
        fathersEducationProof: d.fathersEducationProof || '',
      });
    }
  }, [isEdit, selectedPatient]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.contactNumber.trim()) errs.contactNumber = 'Contact number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors'); return; }
    setSaving(true);
    const payload = { ...form };
    if (payload.age) payload.age = Number(payload.age);
    if (!payload.age) delete payload.age;
    Object.keys(payload).forEach((k) => { if (payload[k] === '') delete payload[k]; });

    let res;
    if (isEdit) {
      res = await dispatch(updatePatient({ id, data: payload }));
    } else {
      res = await dispatch(createPatient(payload));
    }

    setSaving(false);
    if (!res.error) {
      toast.success(isEdit ? 'Patient updated!' : 'Patient created!');
      navigate(isEdit ? `/patients/${id}` : '/patients');
    } else {
      toast.error(res.payload || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.35rem' }}>
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </h1>
          <p className="page-subtitle">
            {isEdit ? 'Update patient information' : 'Fill in the details to register a new patient'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {Object.entries(SECTION_FIELDS).map(([section, fields]) => {
          const visibleFields = fields.filter((f) => !f.doctorOnly || user?.role === 'doctor');
          if (visibleFields.length === 0) return null;

          return (
            <div key={section} className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <User size={13} /> {section}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
                {visibleFields.map((field) => (
                  <div
                    key={field.key}
                    className="form-group"
                    style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}
                  >
                    <label className="form-label" htmlFor={`field-${field.key}`}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--color-danger)', marginLeft: 4 }}>*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        id={`field-${field.key}`}
                        className={`form-input ${errors[field.key] ? 'error' : ''}`}
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      >
                        {field.options.map((o) => (
                          <option key={o} value={o}>{o || `Select ${field.label}`}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={`field-${field.key}`}
                        className={`form-input ${errors[field.key] ? 'error' : ''}`}
                        style={{ resize: 'vertical', minHeight: 80 }}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        id={`field-${field.key}`}
                        type={field.type}
                        className={`form-input ${errors[field.key] ? 'error' : ''}`}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      />
                    )}
                    {errors[field.key] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{errors[field.key]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingBottom: '1.5rem' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving || isLoading} className="btn btn-primary" id="patient-form-submit">
            {saving ? (
              <><div className="spinner" /> Saving...</>
            ) : (
              <><Save size={15} /> {isEdit ? 'Update Patient' : 'Create Patient'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
