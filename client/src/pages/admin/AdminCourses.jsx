import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { GraduationCap, Plus, Edit2, CheckCircle2, Users, IndianRupee } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    degreeLevel: 'Undergraduate',
    durationYears: 4,
    totalSeats: 60,
    availableSeats: 60,
    feesPerYear: 150000,
    minTwelfthPercentage: 70,
    collegeId: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
        // Extract distinct colleges
        const uniqueColleges = [];
        const seen = new Set();
        res.data.courses.forEach(c => {
          if (c.collegeId && !seen.has(c.collegeId._id)) {
            seen.add(c.collegeId._id);
            uniqueColleges.push(c.collegeId);
          }
        });
        setColleges(uniqueColleges);
        if (uniqueColleges.length > 0) {
          setFormData(prev => ({ ...prev, collegeId: uniqueColleges[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        department: formData.department,
        degreeLevel: formData.degreeLevel,
        durationYears: Number(formData.durationYears),
        totalSeats: Number(formData.totalSeats),
        availableSeats: Number(formData.availableSeats),
        feesPerYear: Number(formData.feesPerYear),
        collegeId: formData.collegeId,
        eligibilityCriteria: {
          minTwelfthPercentage: Number(formData.minTwelfthPercentage)
        }
      };

      await api.post('/courses', payload);
      setModalOpen(false);
      await fetchCourses();
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Degree & Course Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure program offerings, seat capacities, minimum cutoff thresholds, and annual fees.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Degree Program
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Degree Name</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Total Seats</th>
                  <th className="p-4">Available</th>
                  <th className="p-4">Cutoff %</th>
                  <th className="p-4">Tuition (₹/yr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-indigo-600">{c.code}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.department}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{c.collegeId?.name}</td>
                    <td className="p-4 font-bold text-slate-800">{c.totalSeats}</td>
                    <td className="p-4 font-extrabold text-indigo-600">{c.availableSeats}</td>
                    <td className="p-4 font-extrabold text-slate-900">{c.eligibilityCriteria?.minTwelfthPercentage}%</td>
                    <td className="p-4 font-semibold text-slate-800">₹{c.feesPerYear?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add New Academic Degree"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Degree Name</label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech in Cyber Security"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="AIT-SEC-104"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 uppercase"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="School of Computing"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Seats</label>
                <input
                  type="number"
                  required
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value, availableSeats: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Cutoff %</label>
                <input
                  type="number"
                  required
                  value={formData.minTwelfthPercentage}
                  onChange={(e) => setFormData({ ...formData, minTwelfthPercentage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-indigo-700"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tuition (₹/yr)</label>
                <input
                  type="number"
                  required
                  value={formData.feesPerYear}
                  onChange={(e) => setFormData({ ...formData, feesPerYear: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
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
                Create Program
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
