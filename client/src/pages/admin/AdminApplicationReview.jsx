import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import AssistantAlert from '../../components/AssistantAlert';
import Modal from '../../components/Modal';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  Send, 
  Clock, 
  User, 
  GraduationCap, 
  Eye, 
  ShieldCheck,
  Building,
  RotateCcw
} from 'lucide-react';

export default function AdminApplicationReview() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status transition state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [interviewData, setInterviewData] = useState({
    date: '',
    mode: 'Online',
    link: '',
    notes: ''
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Document verification modal state
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [docStatusInput, setDocStatusInput] = useState('VERIFIED');
  const [docRemarksInput, setDocRemarksInput] = useState('');

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.application);
        setHistory(res.data.history || []);
        setSelectedStatus(res.data.application.status);
      }
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    setActionSuccess('');
    try {
      const payload = {
        status: selectedStatus,
        remarks: remarks || undefined,
        interviewSchedule: selectedStatus === 'INTERVIEW' ? interviewData : undefined
      };

      const res = await api.put(`/admin/applications/${id}/status`, payload);
      if (res.data.success) {
        setActionSuccess(`Application status successfully updated to ${selectedStatus} and broadcast in real time!`);
        setRemarks('');
        await fetchApplication();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenDocModal = (doc) => {
    setActiveDoc(doc);
    setDocStatusInput(doc.status || 'VERIFIED');
    setDocRemarksInput(doc.remarks || '');
    setDocModalOpen(true);
  };

  const handleSaveDocVerification = async () => {
    if (!activeDoc) return;
    try {
      const docId = activeDoc.documentId?._id || activeDoc.documentId || activeDoc._id;
      await api.put(`/documents/${docId}/verify`, {
        status: docStatusInput,
        adminRemarks: docRemarksInput
      });
      setDocModalOpen(false);
      await fetchApplication();
    } catch (err) {
      console.error('Failed to update document status:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs">
        Application not found.
      </div>
    );
  }

  const TRANSITION_OPTIONS = [
    { value: 'DOCUMENT_VERIFICATION', label: 'Move to Document Verification' },
    { value: 'CORRECTION_REQUIRED', label: 'Request Candidate Corrections' },
    { value: 'ACADEMIC_REVIEW', label: 'Move to Academic Committee Review' },
    { value: 'INTERVIEW', label: 'Schedule Admission Interview' },
    { value: 'WAITLISTED', label: 'Place on Waitlist' },
    { value: 'APPROVED', label: 'Approve Admission Offer' },
    { value: 'REJECTED', label: 'Reject Application' },
    { value: 'ENROLLED', label: 'Mark as Fully Enrolled' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link to="/admin/applications" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Application {application.applicationNumber}
            </h1>
            <StatusBadge status={application.status} size="md" />
          </div>
          <p className="text-xs text-slate-500">
            Candidate: <strong>{application.studentId?.name}</strong> ({application.studentId?.email}) • Applied for: <strong>{application.courseId?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Final Authority: Human Officer
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-scale-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Status Control Console & Candidate Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Status Transition Command Console */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Admission Decision & Status Transition</h2>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Select New Application Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {TRANSITION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Interview Fields */}
              {selectedStatus === 'INTERVIEW' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Interview Schedule Details
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Interview Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewData.date}
                      onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                      className="w-full p-2 rounded-lg border border-purple-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Meeting Link (Google Meet / Zoom)</label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xyz"
                      value={interviewData.link}
                      onChange={(e) => setInterviewData({ ...interviewData, link: e.target.value })}
                      className="w-full p-2 rounded-lg border border-purple-200 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Remarks Textarea */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Administrative Remarks / Feedback for Student
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Verified 12th PCM marksheet; candidate meets standard merit threshold."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {updatingStatus ? 'Updating Status...' : 'Apply Status Transition & Emit Event'}
              </button>
            </form>
          </div>

          {/* Smart Assistant Audit Findings */}
          {application.smartAssistantAudit && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Smart Assistant Anomaly Inspection
              </h3>
              <AssistantAlert audit={application.smartAssistantAudit} />
            </div>
          )}
        </div>

        {/* Right Column: Academic Details & Documents */}
        <div className="lg:col-span-6 space-y-6">
          {/* Academic Snapshot Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Candidate Academic Snapshot</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">12th Percentage</span>
                <span className="text-base font-extrabold text-indigo-700">{application.academicSnapshot?.twelfthPercentage}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">10th Percentage</span>
                <span className="text-base font-extrabold text-slate-800">{application.academicSnapshot?.tenthPercentage}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Entrance Score</span>
                <span className="text-base font-extrabold text-slate-800">{application.academicSnapshot?.entranceScore || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Educational Stream</span>
                <span className="text-xs font-bold text-slate-800">{application.academicSnapshot?.stream}</span>
              </div>
            </div>

            {/* Subject breakdown */}
            {application.academicSnapshot?.subjects?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">Subject Performance:</span>
                <div className="space-y-1 text-xs">
                  {application.academicSnapshot.subjects.map((s, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600">{s.name}</span>
                      <span className="font-bold text-slate-900">{s.marks} / {s.maxMarks || 100}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Document Verification Console */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Document Verification Queue</h3>
              <span className="text-xs text-slate-400 font-semibold">{application.documents?.length || 0} Files</span>
            </div>

            <div className="space-y-3">
              {application.documents?.map((doc, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 capitalize">{doc.documentType.replace(/_/g, ' ')}</p>
                      {doc.remarks && <p className="text-[10px] text-slate-500 mt-0.5">{doc.remarks}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} size="sm" />
                    <button
                      type="button"
                      onClick={() => handleOpenDocModal(doc)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-indigo-600"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Visual Timeline of Historical Decisions */}
      <Timeline history={history} currentStatus={application.status} />

      {/* Document Audit Modal */}
      {docModalOpen && activeDoc && (
        <Modal
          isOpen={docModalOpen}
          onClose={() => setDocModalOpen(false)}
          title={`Audit Document: ${activeDoc.documentType?.replace(/_/g, ' ').toUpperCase()}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Set Verification Status</label>
              <select
                value={docStatusInput}
                onChange={(e) => setDocStatusInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              >
                <option value="VERIFIED">VERIFIED (Certificate matches record)</option>
                <option value="FLAGGED">FLAGGED (Discrepancy / Mismatch detected)</option>
                <option value="CORRECTION_REQUIRED">CORRECTION REQUIRED (Ask student to re-upload)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Remarks for Certificate</label>
              <textarea
                rows={2}
                value={docRemarksInput}
                onChange={(e) => setDocRemarksInput(e.target.value)}
                placeholder="e.g. Scanned marksheet verified against CBSE registry."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDocModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocVerification}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
              >
                Save Document Status
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
