import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminFairnessAudit() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudit();
  }, []);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/fairness');
      if (res.data.success) {
        setAudit(res.data.audit);
      }
    } catch (err) {
      console.error('Failed to load fairness audit:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fairness & Parity Audit Module</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Algorithmic governance tool for evaluating selection-rate parity and identifying unexpected cohort disparities.
        </p>
      </div>

      {/* Mandatory Governance Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Algorithmic Governance & Ethics Policy
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
          <strong>Decision-Support Only:</strong> Sensitive personal characteristics (such as demographic cohorts, gender, or background) are <strong>never used as direct admission criteria</strong>. This audit module serves exclusively as an administrative check to prevent unintended institutional bias. All final decisions remain strictly human-controlled.
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Evaluated Applications</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{audit?.evaluatedCount || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Full dataset analyzed</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Overall Approval Rate</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">{audit?.overallApprovalRate || 0}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Baseline across applicant pool</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-600 uppercase block">Disparity Flags</span>
          <p className="text-3xl font-black text-indigo-600 mt-2">{audit?.flags?.length || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Sub-groups needing manual review</span>
        </div>
      </div>

      {/* Cohort Selection Rate Analysis Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Cohort Selection Rates & Disparity Metrics</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Evaluation Group</th>
                <th className="p-3">Total Applicants</th>
                <th className="p-3">Approved / Enrolled</th>
                <th className="p-3">Selection Rate (%)</th>
                <th className="p-3">Parity Ratio</th>
                <th className="p-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audit?.streamMetrics?.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{m.group}</td>
                  <td className="p-3 font-medium text-slate-700">{m.total}</td>
                  <td className="p-3 font-medium text-slate-700">{m.approved}</td>
                  <td className="p-3 font-extrabold text-indigo-600">{m.selectionRate}%</td>
                  <td className="p-3 font-mono font-bold text-slate-800">{m.disparityRatio}</td>
                  <td className="p-3">
                    {m.flagged ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Disparity Flag
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Within Parity Band
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disparity Alerts Box if any */}
      {audit?.flags?.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Fairness Advisory: Potential Disparity Identified</span>
          </div>
          <div className="space-y-2 text-xs text-rose-800">
            {audit.flags.map((flag, idx) => (
              <div key={idx} className="bg-white/80 p-3 rounded-xl border border-rose-200">
                <p className="font-bold text-slate-900">{flag.group}</p>
                <p className="text-slate-700 mt-0.5">{flag.issue}</p>
                <p className="text-indigo-600 font-semibold mt-1">Recommended Action: {flag.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
