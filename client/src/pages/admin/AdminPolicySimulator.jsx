import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ShieldCheck, 
  Sliders, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function AdminPolicySimulator() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [simulatedSeats, setSimulatedSeats] = useState(100);
  const [simulatedCutoff, setSimulatedCutoff] = useState(70);
  const [deadlineExtensionDays, setDeadlineExtensionDays] = useState(14);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data.success && res.data.courses.length > 0) {
        setCourses(res.data.courses);
        setSelectedCourseId(res.data.courses[0]._id);
        setSimulatedSeats(res.data.courses[0].totalSeats + 30);
        setSimulatedCutoff(res.data.courses[0].eligibilityCriteria?.minTwelfthPercentage - 5);
      }
    } catch (err) {
      console.error('Failed to load courses for policy simulation:', err);
    }
  };

  const handleSimulate = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const res = await api.post('/admin/policy-simulate', {
        courseId: selectedCourseId,
        simulatedSeats,
        simulatedCutoff,
        deadlineExtensionDays
      });
      if (res.data.success) {
        setResult(res.data.result);
      }
    } catch (err) {
      console.error('Policy simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      handleSimulate();
    }
  }, [selectedCourseId, simulatedSeats, simulatedCutoff, deadlineExtensionDays]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admission Policy Simulator</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Model committee interventions: seat expansions, cutoff modifications, and application deadline extensions before committing policy.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 font-semibold shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          ESTIMATED SIMULATION: Policy modeling relies on applicant distribution functions and does not replace statutory admissions council approvals.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Simulate Policy Levers</h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Degree Program</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.totalSeats} seats • {c.eligibilityCriteria?.minTwelfthPercentage}% cutoff)
                </option>
              ))}
            </select>
          </div>

          {/* Seat Adjustment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Simulated Seat Capacity</span>
              <span className="font-extrabold text-indigo-600 text-sm">{simulatedSeats} Seats</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={simulatedSeats}
              onChange={(e) => setSimulatedSeats(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>30</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>

          {/* Cutoff Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Simulated 12th Cutoff</span>
              <span className="font-extrabold text-indigo-600 text-sm">{simulatedCutoff}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={simulatedCutoff}
              onChange={(e) => setSimulatedCutoff(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50%</span>
              <span>75%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Deadline Extension Days */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Application Window Extension</span>
              <span className="font-extrabold text-indigo-600 text-sm">+{deadlineExtensionDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="7"
              value={deadlineExtensionDays}
              onChange={(e) => setDeadlineExtensionDays(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 Days</span>
              <span>14 Days</span>
              <span>30 Days</span>
            </div>
          </div>
        </div>

        {/* Projected Impact Column */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Projected Intake Dynamics</h3>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {result.courseName}
                </span>
              </div>

              {/* KPI Projections */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Projected Applicants</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">{result.simulated.projectedApplicants}</span>
                  <span className="text-[10px] text-slate-500">Baseline: {result.baseline.currentApplications}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admit Volume</span>
                  <span className="text-xl font-extrabold text-emerald-600 mt-1 block">{result.simulated.projectedAdmits}</span>
                  <span className="text-[10px] text-slate-500">Max Cap: {result.simulated.totalSeats}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Waitlist Length</span>
                  <span className="text-xl font-extrabold text-amber-600 mt-1 block">{result.simulated.projectedWaitlist}</span>
                  <span className="text-[10px] text-slate-500">Qualified Pool Spillover</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Capacity Fill</span>
                  <span className="text-xl font-extrabold text-indigo-600 mt-1 block">{result.simulated.capacityUtilization}%</span>
                  <span className="text-[10px] text-slate-500">{result.simulated.competitionIndex}x Demand</span>
                </div>
              </div>

              {/* Policy Insights */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Automated Scenario Synthesis
                </span>
                {result.insights?.map((ins, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
