import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  GraduationCap, 
  MapPin,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export default function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [possible, setPossible] = useState([]);
  const [notRecommended, setNotRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recommendations');
      if (res.data.success) {
        setRecommendations(res.data.recommended || []);
        setPossible(res.data.possible || []);
        setNotRecommended(res.data.notRecommended || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseCard = (item, type) => {
    const isRec = type === 'recommended';
    const isPoss = type === 'possible';
    const isNotRec = type === 'notRecommended';

    const badgeClasses = isRec
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : isPoss
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';

    return (
      <div
        key={item.courseId}
        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {item.course?.collegeId?.code || 'COLLEGE'}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{item.courseName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{item.course?.collegeId?.name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${badgeClasses} shrink-0`}>
              {item.compatibilityScore}% Compatibility
            </span>
          </div>

          {/* Explainable Reasons */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Why this degree matches your profile:
            </span>
            <ul className="space-y-1.5">
              {item.reasons?.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
              {item.warnings?.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Min 12th Cutoff</span>
              <span className="font-bold text-slate-800">{item.course?.eligibilityCriteria?.minTwelfthPercentage}%</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Available Seats</span>
              <span className="font-bold text-indigo-600">{item.course?.availableSeats} of {item.course?.totalSeats}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 italic">Decision support tool</span>
          <Link
            to={`/student/apply?courseId=${item.courseId}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-100 transition inline-flex items-center gap-1.5"
          >
            Apply for Course <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Course Compatibility Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, explainable course recommendations based on your marks, subjects, skills, and career goals.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            All Degrees
          </button>
          <button
            onClick={() => setActiveFilter('recommended')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'recommended' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Recommended ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveFilter('possible')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'possible' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Possible ({possible.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: RECOMMENDED */}
          {(activeFilter === 'all' || activeFilter === 'recommended') && recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900">Recommended Courses (≥75% Compatibility)</h2>
                <span className="text-xs text-slate-400 font-normal">Strong academic and career synergy</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(item => renderCourseCard(item, 'recommended'))}
              </div>
            </div>
          )}

          {/* SECTION 2: POSSIBLE */}
          {(activeFilter === 'all' || activeFilter === 'possible') && possible.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Possible Options (50% – 74% Compatibility)</h2>
                <span className="text-xs text-slate-400 font-normal">Meets fundamental prerequisites with minor condition gaps</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {possible.map(item => renderCourseCard(item, 'possible'))}
              </div>
            </div>
          )}

          {/* SECTION 3: NOT RECOMMENDED */}
          {activeFilter === 'all' && notRecommended.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <h2 className="text-lg font-bold text-slate-900">Low Compatibility (&lt;50%)</h2>
                <span className="text-xs text-slate-400 font-normal">Prerequisite or cutoff criteria not currently satisfied</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notRecommended.map(item => renderCourseCard(item, 'notRecommended'))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
