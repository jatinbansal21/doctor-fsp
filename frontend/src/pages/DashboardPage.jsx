import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, TrendingUp, Calendar,
  ArrowUpRight, UserPlus, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsAPI } from '../api/services';
import { format } from 'date-fns';

const GENDER_COLORS = ['#6366f1', '#f472b6', '#10b981'];

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await analyticsAPI.getStats();
        setStats(data.data);
      } catch (_) {}
      finally { setLoading(false); }
    };
    if (user?.role === 'doctor') fetchStats();
    else setLoading(false);
  }, [user]);

  const statCards = stats ? [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'primary',
      iconColor: '#6366f1',
      iconBg: 'rgba(99,102,241,0.12)',
    },
    {
      label: 'New This Week',
      value: stats.newThisWeek,
      icon: TrendingUp,
      color: 'success',
      iconColor: '#10b981',
      iconBg: 'rgba(16,185,129,0.12)',
    },
    {
      label: 'New This Month',
      value: stats.newThisMonth,
      icon: Calendar,
      color: 'warning',
      iconColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.12)',
    },
    {
      label: 'Active Records',
      value: stats.totalPatients,
      icon: UserCheck,
      color: 'info',
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.12)',
    },
  ] : [];

  const trendData = stats?.admitTrend?.map((d) => ({
    date: d._id,
    patients: d.count,
  })) || [];

  const genderData = stats?.genderStats?.map((g) => ({
    name: g._id,
    value: g.count,
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        {user?.role === 'doctor' && (
          <Link to="/patients/new" className="btn btn-primary" id="dashboard-add-patient-btn">
            <UserPlus size={16} />
            Add Patient
          </Link>
        )}
      </div>

      {user?.role !== 'doctor' ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 20, padding: '3rem', textAlign: 'center',
        }}>
          <Activity size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Welcome, {user?.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            View and manage your patient profile
          </p>
          <Link to="/patients" className="btn btn-primary">
            View My Profile
          </Link>
        </div>
      ) : loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {[1,2,3,4].map((i) => (
            <div key={i} style={{
              height: 120, background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', borderRadius: 16,
              animation: 'pulse 1.5s ease infinite',
            }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className={`stat-card ${card.color}`}
                style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: card.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <card.icon size={20} style={{ color: card.iconColor }} />
                  </div>
                  <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {card.value.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.375rem', fontWeight: 500 }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1.25rem' }}>
            {/* Trend chart */}
            {trendData.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  Patient Registrations (Last 7 days)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="patients" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorPatients)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gender pie */}
            {genderData.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  Gender Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} strokeWidth={0}>
                      {genderData.map((_, i) => (
                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/patients/new" className="btn btn-primary btn-sm">
                <UserPlus size={14} /> Add Patient
              </Link>
              <Link to="/patients" className="btn btn-ghost btn-sm">
                <Users size={14} /> All Patients
              </Link>
              <Link to="/archived" className="btn btn-ghost btn-sm">
                View Archived
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
