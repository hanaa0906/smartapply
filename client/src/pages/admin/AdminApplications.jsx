import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { Search, Filter, ArrowRight, FileCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter, courseFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/admin/applications?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (courseFilter) url += `courseId=${courseFilter}&`;
      
      const [appsRes, coursesRes] = await Promise.all([
        api.get(url),
        api.get('/courses')
      ]);

      if (appsRes.data.success) {
        setApplications(appsRes.data.applications);
      }
      if (coursesRes.data.success) {
        setCourses(coursesRes.data.courses);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.applicationNumber.toLowerCase().includes(term) ||
      app.studentId?.name?.toLowerCase().includes(term) ||
      app.studentId?.email?.toLowerCase().includes(term) ||
      app.courseId?.name?.toLowerCase().includes(term)
    );
  });

  const STATUSES = [
    'ALL',
    'SUBMITTED',
    'DOCUMENT_VERIFICATION',
    'CORRECTION_REQUIRED',
    'ACADEMIC_REVIEW',
    'WAITLISTED',
    'APPROVED',
    'ENROLLED',
    'REJECTED'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applications Master Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter, verify certificates, and transition candidate status across all degrees.
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 self-start sm:self-auto">
          {filteredApps.length} Candidates Found
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, candidate name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Degree Programs</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
              statusFilter === st
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No applications match the current search and filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Application ID</th>
                  <th className="p-4">Candidate Profile</th>
                  <th className="p-4">Applied Degree</th>
                  <th className="p-4">12th Marks</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Review Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-extrabold text-indigo-600">
                      {app.applicationNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{app.studentId?.name}</p>
                      <span className="text-[11px] text-slate-400">{app.studentId?.email}</span>
                      {app.studentId?.phone && (
                        <span className="text-[10px] text-slate-400 block">{app.studentId?.phone}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{app.courseId?.name}</p>
                      <span className="text-[10px] text-slate-400">{app.courseId?.department}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        {app.academicSnapshot?.twelfthPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">{app.academicSnapshot?.stream}</span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/applications/${app._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-1.5"
                      >
                        Evaluate <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
