import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Globe2, Building2, ArrowRight } from 'lucide-react';

/** Every application the student has, across all universities, in one place. */
export default function MyApplicationsList({ applications }) {
  if (!applications || applications.length < 2) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">All My Applications</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {applications.length} applications across every university, tracked live in one place.
          </p>
        </div>
        <Link
          to="/student/universities"
          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 whitespace-nowrap"
        >
          Add universities <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {applications.map((app) => {
          const college = app.collegeId || {};
          const place = college.isExternal
            ? [college.country, college.region].filter(Boolean).join(' • ')
            : [college.city, college.state].filter(Boolean).join(', ');
          const Icon = college.isExternal ? Globe2 : Building2;
          return (
            <Link
              key={app._id}
              to={`/student/application/${app._id}`}
              className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-2 -mx-2 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{college.name}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {app.courseId?.name}{place ? ` • ${place}` : ''}
                </p>
              </div>
              <span className="hidden sm:block text-[10px] font-mono text-slate-400 notranslate" translate="no">
                {app.applicationNumber}
              </span>
              <StatusBadge status={app.status} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
