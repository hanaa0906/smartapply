import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">SmartApply</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Simplifying and digitizing college admissions with real-time tracking, AI compatibility insights, and human-in-the-loop decision-support.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              All systems operational & synchronized
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Candidate Portal</h4>
            <ul className="space-y-2">
              <li><Link to="/courses" className="hover:text-white transition">Explore Degrees</Link></li>
              <li><Link to="/student/recommendations" className="hover:text-white transition">Course Compatibility Engine</Link></li>
              <li><Link to="/student/simulator" className="hover:text-white transition">What-If Admission Simulator</Link></li>
              <li><Link to="/student/scholarships" className="hover:text-white transition">Scholarship Matching</Link></li>
              <li><Link to="/student/documents" className="hover:text-white transition">Document Verification Locker</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Institution & Admin</h4>
            <ul className="space-y-2">
              <li><Link to="/admin/dashboard" className="hover:text-white transition">Admissions Dashboard</Link></li>
              <li><Link to="/admin/applications" className="hover:text-white transition">Verification Pipeline</Link></li>
              <li><Link to="/admin/analytics" className="hover:text-white transition">Enrollment Aggregations</Link></li>
              <li><Link to="/admin/fairness" className="hover:text-white transition">Fairness & Parity Audit</Link></li>
              <li><Link to="/admin/policy-simulator" className="hover:text-white transition">Capacity Policy Sandbox</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Ethics & Transparency</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              SmartApply adheres to strict Human-in-the-Loop principles. Machine learning components act purely as decision-support; all final admissions decisions are human-administered.
            </p>
            <div className="mt-3">
              <Link to="/about" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Read Admission Manifesto
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 SmartApply Technologies Inc. Built with MERN Stack & Real-Time Engine.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400 transition">Fairness Guidelines</Link>
            <Link to="/about" className="hover:text-slate-400 transition">Contact Admissions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
