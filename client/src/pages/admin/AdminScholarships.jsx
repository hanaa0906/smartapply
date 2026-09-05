import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { Award, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    amountPerYear: 75000,
    minPercentage: 80,
    maxAnnualIncome: 600000,
    totalSlots: 40,
    deadline: ''
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scholarships');
      if (res.data.success) {
        setScholarships(res.data.scholarships);
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scholarships', {
        title: formData.title,
        provider: formData.provider,
        amountPerYear: Number(formData.amountPerYear),
        deadline: formData.deadline || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        totalSlots: Number(formData.totalSlots),
        eligibilityRules: {
          minPercentage: Number(formData.minPercentage),
          maxAnnualIncome: Number(formData.maxAnnualIncome)
        }
      });
      setModalOpen(false);
      await fetchScholarships();
    } catch (err) {
      console.error('Failed to create scholarship:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scholarships & Financial Aid</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional waivers, merit grants, and need-based scholarships.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Scholarship
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((s) => (
            <div key={s._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500">{s.provider}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                  ₹{s.amountPerYear?.toLocaleString()}/yr
                </span>
              </div>
              <p className="text-xs text-slate-600">{s.description || 'Institutional merit and need grant.'}</p>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Min Percentage</span>
                  <span className="font-bold text-slate-800">{s.eligibilityRules?.minPercentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Income Cap</span>
                  <span className="font-bold text-slate-800">₹{s.eligibilityRules?.maxAnnualIncome?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create New Scholarship"
        >
          <form onSubmit={handleCreateScholarship} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Scholarship Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sponsoring Body / Provider</label>
              <input
                type="text"
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Award Amount (₹/yr)</label>
                <input
                  type="number"
                  required
                  value={formData.amountPerYear}
                  onChange={(e) => setFormData({ ...formData, amountPerYear: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Percentage Cutoff</label>
                <input
                  type="number"
                  required
                  value={formData.minPercentage}
                  onChange={(e) => setFormData({ ...formData, minPercentage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-indigo-700"
                />
              </div>
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
              >
                Save Scholarship
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
