import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Sliders, 
  ShieldCheck, 
  BarChart3, 
  Award,
  Zap,
  Users,
  Search,
  Building2,
  GraduationCap
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function LandingPage() {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [demoStatus, setDemoStatus] = useState('DOCUMENT_VERIFICATION');

  const handleQuickStart = async (role) => {
    await loginAsDemo(role);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent College Admission Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Your smarter way to <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy decoration-2">apply, track</span> and navigate college admissions.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Simplifying and digitizing college admissions. Apply online, cross-validate marks against document uploads, receive instant compatibility guidance, and track status transitions in real time without refreshing.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/register'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform active:scale-95"
                >
                  Start Your Application
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleQuickStart('student')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 shadow-sm transition"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Try Student Demo
                </button>

                <button
                  onClick={() => handleQuickStart('admin')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Admin Console
                </button>
              </div>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Socket.IO Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Rule-Based Verification Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Human-in-the-Loop Ethics</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      AIT
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Apex Institute of Tech</h4>
                      <p className="text-[11px] text-slate-500 font-mono">SA-2026-88102</p>
                    </div>
                  </div>
                  <StatusBadge status={demoStatus} size="sm" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Degree</span>
                      <span className="font-bold text-slate-800">B.Tech AI & Data Science</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Candidate</span>
                      <span className="font-medium text-slate-700">Aarav Patel (PCM: 89.4%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">AI Compatibility</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                        92% Recommended
                      </span>
                    </div>
                  </div>

                  {/* Smart Assistant Notice Simulation */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">Smart Assistant Audit Active</span>
                      <span className="text-[11px] text-amber-800">
                        Zero inconsistencies detected across Class XII marksheet and board registry.
                      </span>
                    </div>
                  </div>

                  {/* Interactive Status Switcher Demo */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Live Simulation: Toggle Status
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['SUBMITTED', 'DOCUMENT_VERIFICATION', 'ACADEMIC_REVIEW', 'APPROVED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setDemoStatus(st)}
                          className={`text-[11px] py-1.5 px-2 rounded-lg font-semibold transition border ${
                            demoStatus === st
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>⚡ Instant WebSocket Sync</span>
                  <span className="text-emerald-600 font-semibold">✓ No Refresh Needed</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Step Application Lifecycle */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              End-to-End Digital Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              From Discovery to Campus Enrollment
            </h2>
            <p className="text-sm text-slate-600">
              SmartApply replaces tedious paperwork with an intelligent, transparent admission pipeline.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Digital Profile & Marks',
                desc: 'Fill personal details, 10th/12th marks, and entrance test percentiles into a verified student profile.',
                icon: GraduationCap,
                color: 'bg-indigo-50 text-indigo-600'
              },
              {
                step: '02',
                title: 'Smart Assistant Check',
                desc: 'Continuous in-flight verification flags score discrepancies or missing docs without automatic rejection.',
                icon: Sparkles,
                color: 'bg-amber-50 text-amber-600'
              },
              {
                step: '03',
                title: 'Real-Time Tracking',
                desc: 'Track every stage from Document Verification to Academic Review with live status updates via Socket.IO.',
                icon: Clock,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                step: '04',
                title: 'Decision & Enrollment',
                desc: 'Receive admissions decision, view tailored scholarships, and complete enrollment seamlessly.',
                icon: Award,
                color: 'bg-emerald-50 text-emerald-600'
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="relative p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition">
                  <span className="text-2xl font-black text-slate-300 font-mono block mb-2">{card.step}</span>
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Intelligent Modules Built for Modern Higher Ed
            </h2>
            <p className="text-sm text-slate-600">
              Surrounding the core admissions process with research-grade decision-support tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Course Compatibility */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Course Compatibility Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates explainable compatibility scores (Recommended, Possible, Not Recommended) considering academic cutoffs, subject prerequisites, technical skills, and career goals.
              </p>
              <div className="pt-2">
                <Link to="/student/recommendations" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                  Explore recommendations <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: What-If Simulator */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What-If Admission Simulator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive student sandbox allowing candidates to simulate how variations in entrance scores, percentages, or extracurriculars affect admission readiness.
              </p>
              <div className="pt-2">
                <Link to="/student/simulator" className="text-xs font-bold text-amber-600 hover:text-amber-800 inline-flex items-center gap-1">
                  Launch simulator <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Fairness Audit & Policy Sandbox */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Fairness Audit & Policy Sandbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empowers admission committees to evaluate parity across educational cohorts, simulate seat expansions, cutoff alterations, and applicant yield before finalizing policies.
              </p>
              <div className="pt-2">
                <Link to="/admin/fairness" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1">
                  View audit console <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience a smoother college admission journey?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join thousands of prospective students and forward-thinking college admissions officers already using SmartApply.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg transition"
            >
              Create Student Account
            </Link>
            <Link
              to="/courses"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-sm text-white transition"
            >
              Browse 2026 Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
