import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Calendar,
  Building,
  Award
} from 'lucide-react';

export default function StudentProfile() {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('academic');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [personal, setPersonal] = useState({
    dateOfBirth: '',
    gender: 'Male',
    city: '',
    state: '',
    annualFamilyIncome: 500000,
    category: 'General',
    guardianName: '',
    guardianPhone: ''
  });

  const [tenth, setTenth] = useState({
    board: 'CBSE',
    schoolName: '',
    passingYear: 2022,
    percentage: 88,
    rollNumber: ''
  });

  const [twelfth, setTwelfth] = useState({
    board: 'CBSE',
    schoolName: '',
    passingYear: 2024,
    percentage: 85,
    stream: 'Science (PCM)',
    rollNumber: '',
    subjects: [
      { name: 'Mathematics', marks: 90, maxMarks: 100 },
      { name: 'Physics', marks: 85, maxMarks: 100 },
      { name: 'Chemistry', marks: 84, maxMarks: 100 }
    ]
  });

  const [entrance, setEntrance] = useState({
    examName: 'JEE Main',
    score: 85,
    percentile: 92,
    year: 2024
  });

  const [skills, setSkills] = useState(['Python', 'Data Structures', 'Problem Solving']);
  const [newSkill, setNewSkill] = useState('');

  const [interests, setInterests] = useState(['Artificial Intelligence', 'Robotics']);
  const [newInterest, setNewInterest] = useState('');

  const [careerGoals, setCareerGoals] = useState(['AI Research Engineer']);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.personalInfo) {
        setPersonal({
          dateOfBirth: profile.personalInfo.dateOfBirth ? profile.personalInfo.dateOfBirth.split('T')[0] : '',
          gender: profile.personalInfo.gender || 'Male',
          city: profile.personalInfo.city || '',
          state: profile.personalInfo.state || '',
          annualFamilyIncome: profile.personalInfo.annualFamilyIncome || 500000,
          category: profile.personalInfo.category || 'General',
          guardianName: profile.personalInfo.guardianName || '',
          guardianPhone: profile.personalInfo.guardianPhone || ''
        });
      }
      if (profile.academicInfo?.tenth) {
        setTenth({ ...tenth, ...profile.academicInfo.tenth });
      }
      if (profile.academicInfo?.twelfth) {
        setTwelfth({
          ...twelfth,
          ...profile.academicInfo.twelfth,
          subjects: profile.academicInfo.twelfth.subjects?.length > 0 
            ? profile.academicInfo.twelfth.subjects 
            : twelfth.subjects
        });
      }
      if (profile.academicInfo?.entranceExams?.[0]) {
        setEntrance({ ...entrance, ...profile.academicInfo.entranceExams[0] });
      }
      if (profile.skills?.length) setSkills(profile.skills);
      if (profile.interests?.length) setInterests(profile.interests);
      if (profile.careerGoals?.length) setCareerGoals(profile.careerGoals);
    }
  }, [profile]);

  // Dynamic Subject Marks Handler
  const handleSubjectChange = (index, field, value) => {
    const updated = [...twelfth.subjects];
    updated[index][field] = field === 'marks' || field === 'maxMarks' ? Number(value) : value;
    setTwelfth({ ...twelfth, subjects: updated });
  };

  const addSubject = () => {
    setTwelfth({
      ...twelfth,
      subjects: [...twelfth.subjects, { name: '', marks: 80, maxMarks: 100 }]
    });
  };

  const removeSubject = (index) => {
    setTwelfth({
      ...twelfth,
      subjects: twelfth.subjects.filter((_, i) => i !== index)
    });
  };

  // Auto calculate average of subjects
  const calculateSubjectAverage = () => {
    let totalMarks = 0;
    let totalMax = 0;
    twelfth.subjects.forEach(s => {
      totalMarks += Number(s.marks || 0);
      totalMax += Number(s.maxMarks || 100);
    });
    if (totalMax === 0) return 0;
    return Number(((totalMarks / totalMax) * 100).toFixed(1));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        personalInfo: personal,
        academicInfo: {
          tenth,
          twelfth,
          entranceExams: [entrance]
        },
        skills,
        interests,
        careerGoals
      };

      const res = await api.put('/profile', payload);
      if (res.data.success) {
        setMessage('Profile updated successfully! AI compatibility models refreshed.');
        await refreshProfile();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage('Failed to save profile. Please check entered values.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Digital Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your verified academic portfolio used for AI course matching and in-flight application validation.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'academic', label: 'Academic & Marks', icon: GraduationCap },
          { id: 'personal', label: 'Personal & Demographic', icon: User },
          { id: 'skills', label: 'Skills, Interests & Career', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACADEMIC */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Class 12th Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Class 12th (Senior Secondary)</h3>
              <div className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                Computed Subject Average: {calculateSubjectAverage()}%
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Educational Board</label>
                <select
                  value={twelfth.board}
                  onChange={(e) => setTwelfth({ ...twelfth, board: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE / ISC">ICSE / ISC</option>
                  <option value="State Board">State Board</option>
                  <option value="IB / Cambridge">IB / Cambridge</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stream</label>
                <select
                  value={twelfth.stream}
                  onChange={(e) => setTwelfth({ ...twelfth, stream: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Science (PCM)">Science (Physics, Chem, Math)</option>
                  <option value="Science (PCB)">Science (Physics, Chem, Bio)</option>
                  <option value="Commerce">Commerce with/without Math</option>
                  <option value="Arts">Humanities / Arts</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Overall Claimed Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={twelfth.percentage}
                  onChange={(e) => setTwelfth({ ...twelfth, percentage: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                <input
                  type="text"
                  value={twelfth.rollNumber}
                  onChange={(e) => setTwelfth({ ...twelfth, rollNumber: e.target.value })}
                  placeholder="e.g. CBSE-2024-99124"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Passing Year</label>
                <input
                  type="number"
                  value={twelfth.passingYear}
                  onChange={(e) => setTwelfth({ ...twelfth, passingYear: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School / Junior College Name</label>
                <input
                  type="text"
                  value={twelfth.schoolName}
                  onChange={(e) => setTwelfth({ ...twelfth, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Subject-Wise Marks Breakdown</span>
                <button
                  type="button"
                  onClick={addSubject}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>

              <div className="space-y-2">
                {twelfth.subjects.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Subject Name (e.g. Mathematics)"
                      value={sub.name}
                      onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200"
                    />
                    <div className="flex items-center gap-1 w-32">
                      <input
                        type="number"
                        placeholder="Marks"
                        value={sub.marks}
                        onChange={(e) => handleSubjectChange(idx, 'marks', e.target.value)}
                        className="w-16 p-2 rounded-lg border border-slate-200 text-center font-bold"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={sub.maxMarks}
                        onChange={(e) => handleSubjectChange(idx, 'maxMarks', e.target.value)}
                        className="w-14 p-2 rounded-lg border border-slate-200 text-center text-slate-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubject(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class 10th Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Class 10th (Secondary)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Board</label>
                <input
                  type="text"
                  value={tenth.board}
                  onChange={(e) => setTenth({ ...tenth, board: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">10th Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tenth.percentage}
                  onChange={(e) => setTenth({ ...tenth, percentage: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Passing Year</label>
                <input
                  type="number"
                  value={tenth.passingYear}
                  onChange={(e) => setTenth({ ...tenth, passingYear: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Entrance Examination */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Entrance Examination Score</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Exam Name</label>
                <input
                  type="text"
                  value={entrance.examName}
                  onChange={(e) => setEntrance({ ...entrance, examName: e.target.value })}
                  placeholder="e.g. JEE Main, CUET, NEET"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Score / Marks</label>
                <input
                  type="number"
                  step="0.1"
                  value={entrance.score}
                  onChange={(e) => setEntrance({ ...entrance, score: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Percentile</label>
                <input
                  type="number"
                  step="0.1"
                  value={entrance.percentile}
                  onChange={(e) => setEntrance({ ...entrance, percentile: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-indigo-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={personal.dateOfBirth}
                onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender</label>
              <select
                value={personal.gender}
                onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={personal.city}
                onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                placeholder="e.g. Bengaluru"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                value={personal.state}
                onChange={(e) => setPersonal({ ...personal, state: e.target.value })}
                placeholder="e.g. Karnataka"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                value={personal.annualFamilyIncome}
                onChange={(e) => setPersonal({ ...personal, annualFamilyIncome: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category (for Scholarship Matching)</label>
              <select
                value={personal.category}
                onChange={(e) => setPersonal({ ...personal, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Guardian / Parent Name</label>
              <input
                type="text"
                value={personal.guardianName}
                onChange={(e) => setPersonal({ ...personal, guardianName: e.target.value })}
                placeholder="e.g. Ramesh Patel"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Guardian Contact Phone</label>
              <input
                type="tel"
                value={personal.guardianPhone}
                onChange={(e) => setPersonal({ ...personal, guardianPhone: e.target.value })}
                placeholder="+91 98450 11223"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS & GOALS */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm text-xs">
          {/* Skills */}
          <div>
            <label className="font-bold text-slate-700 block mb-2">Technical Skills & Competencies</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="hover:text-rose-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add skill (e.g. React, SQL, IoT)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={() => { if (newSkill) { setSkills([...skills, newSkill]); setNewSkill(''); } }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="pt-4 border-t border-slate-100">
            <label className="font-bold text-slate-700 block mb-2">Academic & Research Interests</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {interests.map((it, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {it}
                  <button type="button" onClick={() => setInterests(interests.filter((_, idx) => idx !== i))} className="hover:text-rose-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add interest (e.g. Machine Learning, Cloud)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={() => { if (newInterest) { setInterests([...interests, newInterest]); setNewInterest(''); } }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Career Goals */}
          <div className="pt-4 border-t border-slate-100">
            <label className="font-bold text-slate-700 block mb-2">Target Career Ambitions</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {careerGoals.map((cg, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                  {cg}
                  <button type="button" onClick={() => setCareerGoals(careerGoals.filter((_, idx) => idx !== i))} className="hover:text-rose-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add goal (e.g. AI Research Engineer)"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={() => { if (newGoal) { setCareerGoals([...careerGoals, newGoal]); setNewGoal(''); } }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
