import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appsPerCourse, setAppsPerCourse] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/applications')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setAppsPerCourse(statsRes.data.appsPerCourse || []);
        setStatusBreakdown(statsRes.data.statusBreakdown?.filter(s => s.count > 0) || []);
      }
      if (appsRes.data.success) {
        setRecentApplications(appsRes.data.applications.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#059669', '#ef4444', '#64748b'];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
            Admissions Committee Console
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Institutional Admissions Command
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics, verification queues, and enrollment aggregation pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/applications"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition inline-flex items-center gap-1.5"
          >
            Review Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Applications</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalApplications || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all academic streams</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Pending Verification</span>
          <p className="text-3xl font-black text-amber-600 mt-2">
            {(stats?.newSubmitted || 0) + (stats?.pendingVerification || 0)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Requiring document / OCR review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase block">Academic Review</span>
          <p className="text-3xl font-black text-blue-600 mt-2">{stats?.underAcademicReview || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Under departmental committee</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Admitted & Enrolled</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {(stats?.approved || 0) + (stats?.enrolled || 0)}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">
            {stats?.approvalRate}% Conversion Rate
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Applications per Course Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Demand by Course</h3>
              <p className="text-xs text-slate-500">Applicant volume compared to seat capacity</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appsPerCourse}>
                <XAxis dataKey="courseCode" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="applicationsCount" fill="#6366f1" radius={[6, 6, 0, 0]} name="Applications" />
                <Bar dataKey="totalSeats" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Total Seats" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pipeline Stage Distribution</h3>
            <p className="text-xs text-slate-500">Live breakdown across admission workflow</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Applications Queue</h3>
            <p className="text-xs text-slate-500">Latest submissions awaiting evaluation or decision</p>
          </div>
          <Link to="/admin/applications" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            View All ({stats?.totalApplications})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">App ID</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Course Program</th>
                <th className="p-3">12th %</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-indigo-600">{app.applicationNumber}</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{app.studentId?.name}</p>
                    <span className="text-[10px] text-slate-400">{app.studentId?.email}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">{app.courseId?.name}</td>
                  <td className="p-3 font-bold text-slate-900">{app.academicSnapshot?.twelfthPercentage}%</td>
                  <td className="p-3">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/admin/applications/${app._id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition inline-block text-[11px]"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
