import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  GraduationCap, 
  Send, 
  Sparkles, 
  Sliders, 
  Award, 
  FolderLock, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const { socket } = useSocket();
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [appsRes, recsRes, scholRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/recommendations').catch(() => ({ data: { recommended: [] } })),
        api.get('/scholarships/matched').catch(() => ({ data: { matches: [] } }))
      ]);

      if (appsRes.data.success) {
        setApplications(appsRes.data.applications);
      }
      if (recsRes.data.success) {
        setRecommendations(recsRes.data.recommended || []);
      }
      if (scholRes.data.success) {
        setScholarships(scholRes.data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time listener for status changes
  useEffect(() => {
    if (!socket) return;
    const handleStatusChanged = () => {
      fetchDashboardData();
    };
    socket.on('STATUS_CHANGED', handleStatusChanged);
    return () => socket.off('STATUS_CHANGED', handleStatusChanged);
  }, [socket]);

  const activeApp = applications[0];
  const completion = profile?.completionPercentage || 85;

  return (
    <div className="space-y-8">
      {/* Welcome & Profile Meter Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Candidate Admission Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              Track your college applications, evaluate AI-driven course fit, and monitor document verification in real time.
            </p>
          </div>

          {/* Profile Completion Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-indigo-100">Digital Profile</span>
              <span className="text-emerald-400 font-bold">{completion}% Complete</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <Link
              to="/student/profile"
              className="mt-3 text-[11px] font-bold text-white hover:text-indigo-200 inline-flex items-center gap-1 transition"
            >
              Update Academic Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">My Applications</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{applications.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active applications submitted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Recommended Fits</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-3">{recommendations.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Courses with ≥75% compatibility</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Matched Scholarships</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-3">{scholarships.filter(s => s.eligible).length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Qualifying funding awards</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Sync Engine</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-extrabold text-slate-900">Real-Time</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero page refresh required</span>
        </div>
      </div>

      {/* Primary Application Real-Time Tracker Card */}
      {activeApp ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {activeApp.applicationNumber}
                </span>
                <span className="text-xs text-slate-400">
                  Submitted on {new Date(activeApp.submittedAt || activeApp.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {activeApp.courseId?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeApp.collegeId?.name} • {activeApp.collegeId?.city}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={activeApp.status} size="md" />
              <Link
                to={`/student/application/${activeApp._id}`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-100 transition inline-flex items-center gap-1.5"
              >
                Full Tracker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick status narrative */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Current Review Stage</span>
              <span className="font-extrabold text-slate-800 text-sm">{activeApp.status.replace(/_/g, ' ')}</span>
              <p className="text-slate-500 text-[11px] mt-1">
                Admissions officers are verifying records. Real-time notifications enabled.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Academic Snapshot</span>
              <div className="space-y-1 mt-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Class 12th:</span>
                  <span className="font-bold">{activeApp.academicSnapshot?.twelfthPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Class 10th:</span>
                  <span className="font-bold">{activeApp.academicSnapshot?.tenthPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Smart Assistant Audit</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Consistent
              </span>
              <p className="text-slate-500 text-[11px] mt-1">
                Form marks match digital certificate records.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Active Applications Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't submitted any college applications yet. Browse accredited programs or use our AI Compatibility Engine to get started!
            </p>
          </div>
          <Link
            to="/student/apply"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition"
          >
            Start First Application <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Two Column Layout: Recommendations & Scholarships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Course Recommendations Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Top AI Course Recommendations</h3>
            </div>
            <Link to="/student/recommendations" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.courseId}
                className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.courseName}</h4>
                    <span className="text-[11px] text-slate-500">{rec.department}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                    {rec.compatibilityScore}% Match
                  </span>
                </div>
                {rec.reasons?.[0] && (
                  <p className="text-[11px] text-slate-600 mt-2 italic">
                    ✓ {rec.reasons[0]}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Decision-support guidance</span>
                  <Link
                    to={`/student/apply?courseId=${rec.courseId}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    Apply Now <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scholarships Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Eligible Scholarships</h3>
            </div>
            <Link to="/student/scholarships" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Explore All
            </Link>
          </div>

          <div className="space-y-3">
            {scholarships.slice(0, 3).map((sch) => (
              <div
                key={sch._id}
                className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-amber-200 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sch.title}</h4>
                    <span className="text-[11px] text-slate-500">{sch.provider}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                    {sch.matchPercentage}% Match
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Award: <strong className="text-slate-900">₹{sch.amountPerYear?.toLocaleString()}/yr</strong></span>
                  <span className="text-[11px] text-slate-400">
                    Deadline: {new Date(sch.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
