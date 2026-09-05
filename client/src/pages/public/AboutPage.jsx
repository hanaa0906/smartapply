import React from 'react';
import { ShieldCheck, Heart, Users, Target, CheckCircle2, Award, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Mission & Design Ethics
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Pioneering Transparent, Intelligent College Admissions
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          SmartApply was built from the ground up to eliminate ambiguity, tedious queues, and unfair barriers in modern university entrance.
        </p>
      </div>

      {/* Original Purpose Callout */}
      <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Core Mission & Purpose</h3>
            <p className="text-xl font-extrabold text-slate-900 mt-2 italic leading-relaxed">
              “To simplify and digitize the college admission process by allowing students to apply online, track progress, and receive updates in real time.”
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Every algorithm, notification system, and verification module in SmartApply exists to strengthen this foundational mission.
            </p>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Manifesto */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">Our Human-in-the-Loop AI Commitment</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          While machine learning can assist candidates in finding their optimal degree and help institutions verify documents rapidly, admissions decisions deeply shape human lives. 
          SmartApply operates under rigorous algorithmic governance guidelines:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Decision-Support Only</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algorithms provide compatibility scores and highlight information mismatches. They NEVER autonomously reject or accept candidates.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Fairness & Parity Auditing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admissions committees have direct access to continuous parity evaluations to identify and resolve unintended systemic cohort disparities.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Transparent Explanations</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every course recommendation includes human-readable reasons outlining prerequisite matches, skills overlap, and potential gaps.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-College Architecture */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Multi-College Scalable Architecture</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          SmartApply is engineered to scale from a single institution to a nationwide consortium. Colleges can independently curate degree catalogs, set custom cutoffs, review documents with role-based access control, and model capacity policies while students enjoy a single unified portal.
        </p>
      </div>
    </div>
  );
}
