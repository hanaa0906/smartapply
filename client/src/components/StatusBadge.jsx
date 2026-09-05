import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Calendar, 
  XCircle, 
  GraduationCap 
} from 'lucide-react';

const statusConfig = {
  DRAFT: { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText },
  SUBMITTED: { label: 'Submitted', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Clock },
  DOCUMENT_VERIFICATION: { label: 'Document Verification', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Search },
  CORRECTION_REQUIRED: { label: 'Correction Required', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  ACADEMIC_REVIEW: { label: 'Academic Review', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Search },
  INTERVIEW: { label: 'Interview Scheduled', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Calendar },
  WAITLISTED: { label: 'Waitlisted', bg: 'bg-violet-50 text-violet-700 border-violet-200', icon: Clock },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', bg: 'bg-slate-100 text-slate-600 border-slate-300', icon: XCircle },
  ENROLLED: { label: 'Enrolled', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: GraduationCap },

  // Document specific statuses
  UPLOADED: { label: 'Uploaded', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText },
  PROCESSING: { label: 'Processing', bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Clock },
  VERIFIED: { label: 'Verified', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  FLAGGED: { label: 'Flagged', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle }
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = statusConfig[status] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
