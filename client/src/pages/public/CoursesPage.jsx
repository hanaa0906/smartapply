import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  MapPin, 
  Clock, 
  Users, 
  IndianRupee, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [selectedDept, selectedDegree]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = '/courses?';
      if (selectedDept) url += `department=${encodeURIComponent(selectedDept)}&`;
      if (selectedDegree) url += `degreeLevel=${encodeURIComponent(selectedDegree)}&`;
      const res = await api.get(url);
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.department.toLowerCase().includes(term) ||
      c.collegeId?.name?.toLowerCase().includes(term) ||
      c.collegeId?.city?.toLowerCase().includes(term)
    );
  });

  const departments = Array.from(new Set(courses.map(c => c.department))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Degrees & Programs</h1>
          <p className="text-xs text-slate-500 mt-1">Explore certified courses, cutoffs, and seat capacities across colleges</p>
        </div>
        <Link
          to="/student/recommendations"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Check My Course Compatibility
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by degree name, subject, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Levels</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>

          {(selectedDept || selectedDegree || searchTerm) && (
            <button
              onClick={() => { setSelectedDept(''); setSelectedDegree(''); setSearchTerm(''); }}
              className="text-xs font-semibold text-rose-600 hover:underline px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No courses match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search filters or clearing the search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* College Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {c.collegeId?.code || 'INSTITUTE'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {c.collegeId?.accreditation || 'NAAC Accredited'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-medium">{c.code}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{c.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.collegeId?.name}, {c.collegeId?.city}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Min 12th Cutoff</span>
                    <span className="font-extrabold text-slate-800">{c.eligibilityCriteria?.minTwelfthPercentage}%</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Annual Tuition</span>
                    <span className="font-extrabold text-slate-800">₹{c.feesPerYear?.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Seats Available</span>
                    <span className="font-extrabold text-indigo-600">{c.availableSeats} of {c.totalSeats}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                    <span className="font-extrabold text-slate-800">{c.durationYears} Years ({c.degreeLevel})</span>
                  </div>
                </div>

                {/* Subject Prerequisites */}
                {c.eligibilityCriteria?.requiredSubjects?.length > 0 && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Subjects: </span>
                    {c.eligibilityCriteria.requiredSubjects.join(', ')}
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/student/apply?courseId=${c._id}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                >
                  Apply Online <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/student/simulator"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Simulate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
