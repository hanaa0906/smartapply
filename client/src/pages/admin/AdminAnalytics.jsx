import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { TrendingUp, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminAnalytics() {
  const [funnel, setFunnel] = useState([]);
  const [streamDistribution, setStreamDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setFunnel(res.data.funnel || []);
        setStreamDistribution(res.data.streamDistribution || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admissions Funnel & Stream Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          MongoDB aggregation pipelines analyzing conversion yield and applicant educational backgrounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Funnel Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Admissions Conversion Funnel</h3>
            <p className="text-xs text-slate-500">Applicant progression from submission to campus enrollment</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Educational Stream Share</h3>
            <p className="text-xs text-slate-500">Applicant high school background mix</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="stream"
                >
                  {streamDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
