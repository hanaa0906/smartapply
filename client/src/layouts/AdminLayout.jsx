import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastContainer from '../components/ToastContainer';
import { 
  BarChart3, 
  FileCheck2, 
  GraduationCap, 
  Scale, 
  TrendingUp, 
  Award, 
  ShieldCheck 
} from 'lucide-react';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const adminNav = [
    { name: 'Overview', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Applications Queue', path: '/admin/applications', icon: FileCheck2 },
    { name: 'Manage Courses', path: '/admin/courses', icon: GraduationCap },
    { name: 'Scholarships', path: '/admin/scholarships', icon: Award },
    { name: 'Analytics & Funnel', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Fairness Audit', path: '/admin/fairness', icon: Scale },
    { name: 'Policy Simulator', path: '/admin/policy-simulator', icon: ShieldCheck }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70">
      <Navbar />

      {/* Admin Sub-header Navigation */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 overflow-x-auto gap-4">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-indigo-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Admissions Console [Apex Tech & Consortium]
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
