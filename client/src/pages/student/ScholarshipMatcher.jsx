import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, CheckCircle2, AlertCircle, Clock, FileText, ArrowRight, IndianRupee } from 'lucide-react';

export default function ScholarshipMatcher() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scholarships/matched');
      if (res.data.success) {
        setScholarships(res.data.matches);
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Smart Scholarship Matching</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Automated eligibility evaluation matching your academic marks, family income, and certificates with active grants.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch) => {
            const isHighMatch = sch.matchPercentage >= 75;
            return (
              <div
                key={sch._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {sch.collegeId?.name || 'National Grant'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">{sch.title}</h3>
                      <p className="text-xs text-slate-500">{sch.provider}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border shrink-0 ${
                      isHighMatch
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {sch.matchPercentage}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{sch.description}</p>

                  {/* Financial & Deadline Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Award Amount</span>
                      <span className="text-base font-extrabold text-slate-900">₹{sch.amountPerYear?.toLocaleString()}/yr</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Application Deadline</span>
                      <span className="text-xs font-bold text-slate-800 mt-1 block">
                        {new Date(sch.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Criteria Met & Missing */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Criteria Status:</span>
                    <ul className="space-y-1">
                      {sch.reasons?.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                      {sch.gaps?.map((g, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Slots: <strong>{sch.totalSlots || 50} Available</strong>
                  </span>
                  <button
                    onClick={() => alert(`Application form for ${sch.title} downloaded. Please submit with verified certificates.`)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                  >
                    Apply for Grant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
