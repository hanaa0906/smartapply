import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Save,
  RotateCcw
} from 'lucide-react';

export default function AdmissionSimulator() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Slider Inputs
  const [entranceScore, setEntranceScore] = useState(85);
  const [twelfthPercentage, setTwelfthPercentage] = useState(88);
  const [extracurricularScore, setExtracurricularScore] = useState(7);

  // Simulation Results
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCoursesAndHistory();
  }, []);

  const fetchCoursesAndHistory = async () => {
    try {
      const [coursesRes, historyRes] = await Promise.all([
        api.get('/courses'),
        api.get('/simulator/history').catch(() => ({ data: { history: [] } }))
      ]);

      if (coursesRes.data.success && coursesRes.data.courses.length > 0) {
        setCourses(coursesRes.data.courses);
        setSelectedCourseId(coursesRes.data.courses[0]._id);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load simulator data:', err);
    }
  };

  // Sync initial inputs from student profile
  useEffect(() => {
    if (profile?.academicInfo) {
      if (profile.academicInfo.twelfth?.percentage) {
        setTwelfthPercentage(profile.academicInfo.twelfth.percentage);
      }
      if (profile.academicInfo.entranceExams?.[0]?.score) {
        setEntranceScore(profile.academicInfo.entranceExams[0].score);
      }
    }
  }, [profile]);

  // Run simulation calculation
  const handleSimulate = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const res = await api.post('/simulator', {
        courseId: selectedCourseId,
        entranceScore,
        twelfthPercentage,
        extracurricularScore
      });
      if (res.data.success) {
        setSimulationResult(res.data.simulation);
        // Refresh history
        const hRes = await api.get('/simulator/history');
        if (hRes.data.success) setHistory(hRes.data.history);
      }
    } catch (err) {
      console.error('Simulation calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      handleSimulate();
    }
  }, [selectedCourseId, entranceScore, twelfthPercentage, extracurricularScore]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">What-If Admission Simulator</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Simulate how hypothetical variations in marks, entrance exams, and profile depth affect admission readiness.
        </p>
      </div>

      {/* Prominent Required Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 font-semibold shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          SIMULATION — NOT A GUARANTEE OF ADMISSION. Results represent counterfactual probabilistic models for self-assessment and guidance only.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Sliders */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Adjust Hypothetical Parameters</h2>

          {/* Target Course Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Course to Evaluate</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.collegeId?.code} • Min {c.eligibilityCriteria?.minTwelfthPercentage}%)
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: 12th Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Simulated 12th Percentage</span>
              <span className="text-base font-extrabold text-indigo-600">{twelfthPercentage}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={twelfthPercentage}
              onChange={(e) => setTwelfthPercentage(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 2: Entrance Exam Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Simulated Entrance Score / Percentile</span>
              <span className="text-base font-extrabold text-indigo-600">{entranceScore}</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="1"
              value={entranceScore}
              onChange={(e) => setEntranceScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>30 (Baseline)</span>
              <span>65 (Average)</span>
              <span>100 (Top Percentile)</span>
            </div>
          </div>

          {/* Slider 3: Extracurricular & Achievements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Extracurricular Depth & Certifications</span>
              <span className="text-base font-extrabold text-indigo-600">{extracurricularScore} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={extracurricularScore}
              onChange={(e) => setExtracurricularScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Foundational (1)</span>
              <span>Balanced (5)</span>
              <span>National Honors (10)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                setTwelfthPercentage(profile?.academicInfo?.twelfth?.percentage || 85);
                setEntranceScore(profile?.academicInfo?.entranceExams?.[0]?.score || 80);
                setExtracurricularScore(7);
              }}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Actual Profile
            </button>
          </div>
        </div>

        {/* Right Column: Simulated Readiness Gauge & Factor Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          {simulationResult && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulated Outcome</span>
                  <h3 className="text-base font-bold text-slate-900">{simulationResult.courseName}</h3>
                </div>
                {simulationResult.comparison?.delta !== undefined && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    simulationResult.comparison.delta >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {simulationResult.comparison.delta >= 0 ? `+${simulationResult.comparison.delta}%` : `${simulationResult.comparison.delta}%`} vs Current
                  </span>
                )}
              </div>

              {/* Large Score Meter */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Simulated Readiness Score
                </span>
                <span className="text-5xl font-black text-indigo-600 tracking-tight">
                  {simulationResult.simulatedReadinessScore}%
                </span>
                <span className="text-xs text-indigo-800 font-medium max-w-xs">
                  {simulationResult.simulatedReadinessScore >= 80
                    ? 'Strong candidate profile for admission round'
                    : simulationResult.simulatedReadinessScore >= 60
                    ? 'Competitive standing with potential waitlist placement'
                    : 'Below standard historical cutoff threshold'}
                </span>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Factor Weight Breakdown
                </span>
                {simulationResult.factors?.map((f, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800">{f.name} ({f.weight}% weight)</span>
                      <span className="font-bold text-indigo-600">+{f.contribution} pts</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Simulation History */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Saved Simulation Scenarios</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Target Course</th>
                  <th className="p-3">Hypothetical 12th %</th>
                  <th className="p-3">Hypothetical Entrance</th>
                  <th className="p-3">Simulated Readiness</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{h.courseId?.name || 'Program'}</td>
                    <td className="p-3 font-bold text-indigo-600">{h.hypotheticalValues?.twelfthPercentage}%</td>
                    <td className="p-3 font-bold text-slate-800">{h.hypotheticalValues?.entranceScore}</td>
                    <td className="p-3 font-extrabold text-emerald-700">{h.simulatedReadinessScore}%</td>
                    <td className="p-3 text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
