import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import Timeline from '../../components/Timeline';
import StatusBadge from '../../components/StatusBadge';
import AssistantAlert from '../../components/AssistantAlert';
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  MapPin,
  Building,
  AlertTriangle
} from 'lucide-react';

export default function ApplicationDetails() {
  const { id } = useParams();
  const { socket, joinApplication } = useSocket();
  const [application, setApplication] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusAnimation, setStatusAnimation] = useState(false);

  const fetchApplicationDetails = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.application);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  // Real-Time Socket.IO Listener for this Application
  useEffect(() => {
    if (!socket || !id) return;

    joinApplication(id);

    const handleStatusChanged = (data) => {
      // If this event corresponds to current application
      if (data.applicationId === id) {
        setStatusAnimation(true);
        fetchApplicationDetails();
        setTimeout(() => setStatusAnimation(false), 2500);
      }
    };

    socket.on('STATUS_CHANGED', handleStatusChanged);

    return () => {
      socket.off('STATUS_CHANGED', handleStatusChanged);
    };
  }, [socket, id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <h3 className="text-base font-bold text-slate-900">Application not found</h3>
        <Link to="/student/dashboard" className="mt-3 inline-block text-xs font-bold text-indigo-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link to="/student/dashboard" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Application {application.applicationNumber}
            </h1>
            <div className={statusAnimation ? 'scale-110 transition-transform duration-300' : ''}>
              <StatusBadge status={application.status} size="md" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {application.courseId?.name} • {application.collegeId?.name}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live WebSocket Listening</span>
        </div>
      </div>

      {/* Main Interactive Timeline */}
      <Timeline history={history} currentStatus={application.status} />

      {/* Interview Callout if scheduled */}
      {application.interviewSchedule?.date && (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-purple-700" />
            <span>Admissions Interview Scheduled</span>
          </div>
          <p className="text-xs text-purple-800">
            Date & Time: <strong>{new Date(application.interviewSchedule.date).toLocaleString()}</strong> ({application.interviewSchedule.mode})
          </p>
          {application.interviewSchedule.link && (
            <p className="text-xs text-purple-700">
              Meeting URL: <a href={application.interviewSchedule.link} target="_blank" rel="noreferrer" className="underline font-mono">{application.interviewSchedule.link}</a>
            </p>
          )}
          {application.interviewSchedule.notes && (
            <p className="text-xs text-purple-700 italic">Notes: {application.interviewSchedule.notes}</p>
          )}
        </div>
      )}

      {/* Two Columns: Academic Snapshot & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Academic Snapshot Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Academic Record Snapshot</h3>
          
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
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stream</span>
              <span className="text-xs font-bold text-slate-800">{application.academicSnapshot?.stream}</span>
            </div>
          </div>

          {/* Subject breakdown */}
          {application.academicSnapshot?.subjects?.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-2">Subject Breakdown:</span>
              <div className="space-y-1.5 text-xs">
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

        {/* Attached Documents Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Submitted Certificates</h3>
            <span className="text-xs font-bold text-slate-500">{application.documents?.length || 0} Files</span>
          </div>

          <div className="space-y-3">
            {application.documents?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No documents attached.</p>
            ) : (
              application.documents.map((doc, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 capitalize">{doc.documentType.replace(/_/g, ' ')}</p>
                      {doc.remarks && <p className="text-[10px] text-slate-500 mt-0.5">{doc.remarks}</p>}
                    </div>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>
              ))
            )}
          </div>

          {/* Smart Assistant Audit Section */}
          {application.smartAssistantAudit && (
            <div className="pt-4 border-t border-slate-100">
              <AssistantAlert audit={application.smartAssistantAudit} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
