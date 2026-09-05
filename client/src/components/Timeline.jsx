import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  FileCheck,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const STAGES = [
  { key: 'SUBMITTED', title: 'Submitted', desc: 'Application received' },
  { key: 'DOCUMENT_VERIFICATION', title: 'Document Verification', desc: 'Certificates & OCR checks' },
  { key: 'ACADEMIC_REVIEW', title: 'Academic Review', desc: 'Eligibility & department evaluation' },
  { key: 'APPROVED', title: 'Admissions Decision', desc: 'Approved / Waitlisted / Decision' },
  { key: 'ENROLLED', title: 'Enrollment', desc: 'Candidate joined' }
];

export default function Timeline({ history = [], currentStatus = 'SUBMITTED' }) {
  const getStageIndex = (status) => {
    if (status === 'DRAFT') return -1;
    if (status === 'SUBMITTED') return 0;
    if (status === 'DOCUMENT_VERIFICATION' || status === 'CORRECTION_REQUIRED') return 1;
    if (status === 'ACADEMIC_REVIEW' || status === 'INTERVIEW') return 2;
    if (status === 'APPROVED' || status === 'WAITLISTED' || status === 'REJECTED') return 3;
    if (status === 'ENROLLED') return 4;
    return 0;
  };

  const currentIdx = getStageIndex(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Application Status Progression</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live real-time status tracker via SmartApply Engine</p>
        </div>
        <StatusBadge status={currentStatus} size="md" />
      </div>

      {/* Horizontal Steps on larger screens */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 relative mb-8">
        {STAGES.map((stage, idx) => {
          const isDone = currentIdx > idx;
          const isCurrent = currentIdx === idx;
          const isPending = currentIdx < idx;

          return (
            <div key={stage.key} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 ${
                  isDone ? 'bg-indigo-600' : 'bg-slate-200'
                }`} />
              )}

              {/* Step indicator circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                isDone 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : isCurrent 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 ring-offset-1 pulse-glow' 
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span className={`text-xs font-semibold mt-2.5 ${
                isCurrent ? 'text-indigo-600' : isDone ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {stage.title}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 max-w-[120px]">
                {stage.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log Timeline */}
      <div className="mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Audit History & Remarks</h4>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No transition history recorded yet.</p>
        ) : (
          <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-0.5 before:bg-slate-200">
            {history.map((item, idx) => (
              <div key={item._id || idx} className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-2.5 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                <div className="flex-1 bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {item.previousStatus} <ArrowRight className="w-3 h-3 inline text-slate-400" /> {item.newStatus}
                      </span>
                      <StatusBadge status={item.newStatus} size="sm" />
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {item.remarks && (
                    <p className="mt-2 text-slate-700 bg-white p-2 rounded border border-slate-100">
                      <strong>Remarks:</strong> {item.remarks}
                    </p>
                  )}
                  {item.updatedBy && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Updated by: {item.updatedBy.name || 'System / Admissions Office'} ({item.updatedBy.role || 'Staff'})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
