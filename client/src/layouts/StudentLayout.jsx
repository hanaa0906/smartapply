import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastContainer from '../components/ToastContainer';
import { 
  LayoutDashboard, 
  Send, 
  Sparkles, 
  Sliders, 
  Award, 
  FolderLock, 
  UserCircle 
} from 'lucide-react';

export default function StudentLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Apply for Course', path: '/student/apply', icon: Send },
    { name: 'AI Recommendations', path: '/student/recommendations', icon: Sparkles },
    { name: 'What-If Simulator', path: '/student/simulator', icon: Sliders },
    { name: 'Scholarships', path: '/student/scholarships', icon: Award },
    { name: 'Document Locker', path: '/student/documents', icon: FolderLock },
    { name: 'Digital Profile', path: '/student/profile', icon: UserCircle }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70">
      <Navbar />

      {/* Student Sub-header Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
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
