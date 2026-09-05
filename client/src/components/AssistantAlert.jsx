import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function AssistantAlert({ audit, onDismiss }) {
  if (!audit) return null;

  const { mismatches = [], missingFields = [], flags = [], overallCheckStatus } = audit;
  const hasIssues = mismatches.length > 0 || missingFields.length > 0 || flags.length > 0;

  if (!hasIssues && overallCheckStatus === 'CLEAN') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-emerald-900">Smart Assistant: All Checks Passed</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Your academic entries, computed subject averages, and uploaded documents are fully consistent.
          </p>
        </div>
      </div>
    );
  }

  const isCritical = mismatches.some(m => m.severity === 'CRITICAL');

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all ${
      isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        {isCritical ? (
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-bold ${isCritical ? 'text-rose-900' : 'text-amber-900'}`}>
              Smart Application Assistant Notice
            </h4>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase ${
              isCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
            }`}>
              {overallCheckStatus || 'Attention Needed'}
            </span>
          </div>

          <p className={`text-xs mt-1 leading-relaxed ${isCritical ? 'text-rose-700' : 'text-amber-800'}`}>
            The assistant continuously cross-references your application fields with document data. 
            SmartApply will NOT auto-reject your application; however, please review the points below:
          </p>

          {/* Mismatches */}
          {mismatches.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Discrepancies Detected:
              </span>
              {mismatches.map((m, idx) => (
                <div key={idx} className="bg-white/80 border border-amber-200/60 rounded-lg p-2.5 text-xs text-slate-800">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900 capitalize">{m.field.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      m.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {m.severity}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-slate-600">
                    <span>Entered: <strong>{String(m.claimed)}</strong></span>
                    <span>Detected: <strong>{String(m.detected)}</strong></span>
                  </div>
                  <p className="mt-1 text-slate-700 italic">{m.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Missing Documents */}
          {missingFields.length > 0 && (
            <div className="mt-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-800">Missing Mandatory Attachments:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                {missingFields.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility Warnings */}
          {flags.length > 0 && (
            <div className="mt-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-800">Advisory Flags:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                {flags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
