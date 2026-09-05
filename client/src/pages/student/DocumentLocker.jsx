import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2,
  FileCheck2,
  Eye
} from 'lucide-react';

export default function DocumentLocker() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('12th_marksheet');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', selectedType);

    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMessage('Document uploaded and verified by OCR engine successfully!');
        setFile(null);
        await fetchDocuments();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <FolderLock className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Document Locker</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Upload and store digital certificates. SmartApply simulates automated OCR data extraction for admissions checks.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Upload New Certificate</h2>
        
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs">
          <div className="sm:col-span-4">
            <label className="font-bold text-slate-700 block mb-1">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
            >
              <option value="12th_marksheet">12th Grade Marksheet</option>
              <option value="10th_marksheet">10th Grade Marksheet</option>
              <option value="id_proof">Government ID (Aadhaar / Passport)</option>
              <option value="income_certificate">Family Income Certificate</option>
              <option value="community_certificate">Community / Category Certificate</option>
              <option value="transfer_certificate">Transfer Certificate (TC)</option>
              <option value="passport_photo">Passport Photograph</option>
              <option value="other">Other Supporting Document</option>
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="font-bold text-slate-700 block mb-1">Select File (PDF, PNG, JPG &lt; 5MB)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 rounded-xl border border-slate-200 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-sm shadow-indigo-100 transition flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Analyzing...' : 'Upload & Verify'}
            </button>
          </div>
        </form>
      </div>

      {/* Locker Items */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Stored Certificates in Locker</h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            No documents uploaded yet. Use the uploader above to add your marksheets.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{doc.originalName}</h4>
                      <span className="text-[10px] text-slate-400 capitalize block">
                        {doc.documentType.replace(/_/g, ' ')} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>

                {/* Simulated OCR Data if extracted */}
                {doc.extractedData && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-150 text-[11px] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted OCR Metadata</span>
                    {doc.extractedData.percentage && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Marksheet %:</span>
                        <strong className="text-indigo-700">{doc.extractedData.percentage}%</strong>
                      </div>
                    )}
                    {doc.extractedData.rollNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Roll No:</span>
                        <span className="font-mono font-semibold">{doc.extractedData.rollNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {doc.adminRemarks && (
                  <p className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <strong>Admin Note:</strong> {doc.adminRemarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
