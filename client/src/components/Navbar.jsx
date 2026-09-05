import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Sparkles, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  FileText, 
  Search, 
  Layers, 
  Sliders, 
  Award,
  CheckCircle2
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, loginAsDemo } = useAuth();
  const { connected } = useSocket();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async (targetRole) => {
    await loginAsDemo(targetRole);
    setProfileDropdownOpen(false);
    if (targetRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const isLinkActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  SmartApply
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    Pro
                  </span>
                </span>
              </div>
            </Link>

            {/* Socket Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200" title="Socket.IO real-time engine active">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-medium">{connected ? 'Live Sync' : 'Offline'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <Link to="/" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Home
                </Link>
                <Link to="/courses" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/courses') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Courses & Colleges
                </Link>
                <Link to="/about" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/about') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  About & Ethics
                </Link>
              </>
            )}

            {/* Student Navigation */}
            {user?.role === 'student' && (
              <>
                <Link to="/student/dashboard" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/student/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Dashboard
                </Link>
                <Link to="/student/apply" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/student/apply') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Apply
                </Link>
                <Link to="/student/recommendations" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/student/recommendations') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  AI Match
                </Link>
                <Link to="/student/simulator" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/student/simulator') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  What-If Simulator
                </Link>
                <Link to="/student/scholarships" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/student/scholarships') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Scholarships
                </Link>
                <Link to="/student/documents" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/student/documents') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Locker
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/admin/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Admin Dashboard
                </Link>
                <Link to="/admin/applications" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/admin/applications') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Applications
                </Link>
                <Link to="/admin/courses" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/admin/courses') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Courses
                </Link>
                <Link to="/admin/analytics" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/admin/analytics') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Analytics
                </Link>
                <Link to="/admin/fairness" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/admin/fairness') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Fairness Audit
                </Link>
                <Link to="/admin/policy-simulator" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isLinkActive('/admin/policy-simulator') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  Policy Sandbox
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="hidden sm:flex items-center bg-indigo-50/80 border border-indigo-100 p-1 rounded-xl">
              <button
                onClick={() => handleSwitchRole('student')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                  user?.role === 'student' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Student Demo
              </button>
              <button
                onClick={() => handleSwitchRole('admin')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                  user?.role === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Admin Demo
              </button>
            </div>

            {/* Notification Bell (if logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-up">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Updates</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">No notifications yet.</div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition flex items-start gap-2.5 ${
                              !notif.isRead ? 'bg-indigo-50/40' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.isRead ? 'bg-indigo-600' : 'bg-transparent'}`} />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{notif.title}</p>
                              <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Login / Register */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-up py-1">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Role: {user.role}
                      </span>
                    </div>

                    {user.role === 'student' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Digital Profile
                      </Link>
                    )}

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-100 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {!user ? (
              <>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Home</Link>
                <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Courses</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">About & Ethics</Link>
              </>
            ) : user.role === 'student' ? (
              <>
                <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Dashboard</Link>
                <Link to="/student/apply" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Apply Online</Link>
                <Link to="/student/recommendations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">AI Compatibility</Link>
                <Link to="/student/simulator" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">What-If Simulator</Link>
                <Link to="/student/scholarships" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Scholarships</Link>
                <Link to="/student/documents" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Document Locker</Link>
                <Link to="/student/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">My Profile</Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Admin Dashboard</Link>
                <Link to="/admin/applications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Manage Applications</Link>
                <Link to="/admin/courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Course Management</Link>
                <Link to="/admin/analytics" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Analytics</Link>
                <Link to="/admin/fairness" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Fairness Audit</Link>
                <Link to="/admin/policy-simulator" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Policy Simulator</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
