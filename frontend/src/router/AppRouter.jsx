import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DoctorLayout from '../layouts/DoctorLayout';
import DashboardPage from '../pages/DashboardPage';
import PatientsPage from '../pages/PatientsPage';
import PatientFormPage from '../pages/PatientFormPage';
import PatientDetailPage from '../pages/PatientDetailPage';
import ProfilePage from '../pages/ProfilePage';
import ArchivedPatientsPage from '../pages/ArchivedPatientsPage';

function ProtectedRoute({ children, role }) {
  const { user, accessToken } = useSelector((state) => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role && user && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth);
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter({ initialized }) {
  const { accessToken } = useSelector((state) => state.auth);

  if (accessToken && !initialized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: '1rem',
        background: 'var(--bg-base)'
      }}>
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading your session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><DoctorLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/new" element={<ProtectedRoute role="doctor"><PatientFormPage /></ProtectedRoute>} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="patients/:id/edit" element={<PatientFormPage />} />
          <Route path="archived" element={<ProtectedRoute role="doctor"><ArchivedPatientsPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
