import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AssistantAlert from '../../components/AssistantAlert';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

export default function ApplicationWizard() {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form State
  const [academicSnapshot, setAcademicSnapshot] = useState({
    twelfthPercentage: 89.4,
    tenthPercentage: 91.2,
    entranceScore: 88.5,
    entranceExam: 'JEE Main',
    stream: 'Science (PCM)',
    subjects: [
      { name: 'Mathematics', marks: 92, maxMarks: 100 },
      { name: 'Physics', marks: 88, maxMarks: 100 },
      { name: 'Chemistry', marks: 87, maxMarks: 100 }
    ]
  });

  const [studentDocs, setStudentDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [assistantAudit, setAssistantAudit] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Courses & Documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, docsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/documents')
        ]);
        if (coursesRes.data.success) {
          setCourses(coursesRes.data.courses);
          if (initialCourseId) {
            const found = coursesRes.data.courses.find(c => c._id === initialCourseId);
            if (found) setSelectedCourse(found);
          }
        }
        if (docsRes.data.success) {
          setStudentDocs(docsRes.data.documents);
          setSelectedDocIds(docsRes.data.documents.map(d => d._id));
        }
      } catch (err) {
        console.error('Failed to load application wizard dependencies:', err);
      }
    };
    fetchData();
  }, [initialCourseId]);

  // Sync with profile
  useEffect(() => {
    if (profile?.academicInfo) {
      const twelfth = profile.academicInfo.twelfth;
      const tenth = profile.academicInfo.tenth;
      const ent = profile.academicInfo.entranceExams?.[0];
      setAcademicSnapshot({
        twelfthPercentage: twelfth?.percentage || 85,
        tenthPercentage: tenth?.percentage || 88,
        entranceScore: ent?.score || 80,
        entranceExam: ent?.examName || 'JEE Main',
        stream: twelfth?.stream || 'Science (PCM)',
        subjects: twelfth?.subjects?.length > 0 ? twelfth.subjects : academicSnapshot.subjects
      });
    }
  }, [profile]);

  const handleSelectCourse = (course) => {
    setSelectedCourseId(course._id);
    setSelectedCourse(course);
  };

  // Run Real-Time Smart Assistant Analysis
  const runAssistantCheck = async () => {
    if (!selectedCourseId) return;
    setLoadingAudit(true);
    try {
      const res = await api.post('/applications/check-assistant', {
        courseId: selectedCourseId,
        academicSnapshot,
        documentIds: selectedDocIds
      });
      if (res.data.success) {
        setAssistantAudit(res.data.audit);
      }
    } catch (err) {
      console.error('Assistant check failed:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      runAssistantCheck();
    }
  }, [step, selectedCourseId, academicSnapshot, selectedDocIds]);

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        courseId: selectedCourseId,
        academicSnapshot,
        documentIds: selectedDocIds,
        status: 'SUBMITTED'
      };

      const res = await api.post('/applications', payload);
      if (res.data.success) {
        navigate(`/student/application/${res.data.application._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">New College Application</h1>
        <p className="text-xs text-slate-500 mt-1">
          Follow the 5-step guided wizard. The Smart Application Assistant validates your data prior to final submission.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs font-bold">
        {[
          { num: 1, label: 'Course' },
          { num: 2, label: 'Academics' },
          { num: 3, label: 'Documents' },
          { num: 4, label: 'Smart Assistant' },
          { num: 5, label: 'Review & Submit' }
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 shrink-0 ${
              step === s.num ? 'text-indigo-600' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step === s.num
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : step > s.num
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELECT COURSE */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Step 1: Choose Your Program of Study</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => {
              const isSelected = selectedCourseId === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectCourse(c)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {c.collegeId?.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{c.degreeLevel}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.collegeId?.name}</p>
                    <div className="text-[11px] text-slate-600 flex justify-between pt-1">
                      <span>Cutoff: <strong>{c.eligibilityCriteria?.minTwelfthPercentage}%</strong></span>
                      <span>Tuition: <strong>₹{c.feesPerYear?.toLocaleString()}/yr</strong></span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>{isSelected ? '✓ Selected' : 'Select Program'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={!selectedCourseId}
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              Continue to Academics <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ACADEMIC SNAPSHOT */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 2: Confirm Academic Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These figures will be captured into your application snapshot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Class 12th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={academicSnapshot.twelfthPercentage}
                onChange={(e) => setAcademicSnapshot({ ...academicSnapshot, twelfthPercentage: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Class 10th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={academicSnapshot.tenthPercentage}
                onChange={(e) => setAcademicSnapshot({ ...academicSnapshot, tenthPercentage: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Entrance Test Score</label>
              <input
                type="number"
                step="0.1"
                value={academicSnapshot.entranceScore}
                onChange={(e) => setAcademicSnapshot({ ...academicSnapshot, entranceScore: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Test mismatch trigger helper button for user testing */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-indigo-900 text-[11px]">
              💡 <em>Demo Tester Tip:</em> Want to see the Smart Assistant in action? Try changing 12th percentage to <strong>91%</strong> while your uploaded marksheet states 89.4%.
            </span>
            <button
              type="button"
              onClick={() => setAcademicSnapshot({ ...academicSnapshot, twelfthPercentage: 91 })}
              className="text-[11px] font-bold px-3 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 shrink-0"
            >
              Simulate 91% Mismatch
            </button>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              Attach Documents <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT ATTACHMENTS */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 3: Attach Verified Certificates</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select documents from your locker to associate with this application.
            </p>
          </div>

          <div className="space-y-3">
            {studentDocs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No documents found in your locker. You can upload in the next step.
              </p>
            ) : (
              studentDocs.map((doc) => {
                const isChecked = selectedDocIds.includes(doc._id);
                return (
                  <div
                    key={doc._id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedDocIds(selectedDocIds.filter(id => id !== doc._id));
                      } else {
                        setSelectedDocIds([...selectedDocIds, doc._id]);
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition ${
                      isChecked ? 'bg-indigo-50/50 border-indigo-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-900">{doc.originalName}</h4>
                        <span className="text-[11px] text-slate-500 capitalize">
                          Type: {doc.documentType.replace(/_/g, ' ')} • Status: {doc.status}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              Run Smart Assistant Audit <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SMART APPLICATION ASSISTANT */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Step 4: Smart Application Assistant Check</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuously validating data integrity, OCR consistency, and document prerequisites.
            </p>
          </div>

          {loadingAudit ? (
            <div className="p-8 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
              <p className="text-xs text-slate-500">Cross-referencing marksheet OCR with application entries...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AssistantAlert audit={assistantAudit} />
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Adjust Inputs
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              Proceed to Review & Submit <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {step === 5 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 5: Final Review & Submission</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitting generates your unique Application ID and initiates document verification.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Degree Program</span>
              <span className="font-bold text-slate-900">{selectedCourse?.name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">College</span>
              <span className="font-bold text-slate-900">{selectedCourse?.collegeId?.name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">12th Grade Percentage</span>
              <span className="font-bold text-indigo-700">{academicSnapshot.twelfthPercentage}%</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Attached Documents</span>
              <span className="font-bold text-slate-900">{selectedDocIds.length} Certificates Linked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Initial Status</span>
              <span className="font-extrabold text-indigo-600">SUBMITTED (Pending Verification)</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={submitting}
              onClick={handleSubmitApplication}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-100 transition flex items-center gap-2"
            >
              {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
