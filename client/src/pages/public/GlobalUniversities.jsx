import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Globe2,
  Search,
  MapPin,
  ExternalLink,
  Plus,
  Check,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ListChecks
} from 'lucide-react';

const SHORTLIST_KEY = 'smartapply_shortlist';
const MAX_SHORTLIST = 10;
const PAGE_SIZE = 24;

const flagOf = (code) => {
  if (!code || code.length !== 2 || code === 'XK') return '🌐';
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
};

const readShortlist = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
};

export default function GlobalUniversities() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [region, setRegion] = useState('All');
  const [country, setCountry] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ universities: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [shortlist, setShortlist] = useState(readShortlist);
  const [program, setProgram] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('Undergraduate');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [outcome, setOutcome] = useState(null);

  const loadMeta = () => {
    api.get('/universities/meta')
      .then((res) => setMeta(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadMeta();
    // Keep the live counts fresh while the page is open
    const timer = setInterval(loadMeta, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get('/universities', { params: { region, country, search, page, limit: PAGE_SIZE } })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the university directory. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [region, country, search, page]);

  useEffect(() => {
    try { localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist)); } catch (e) { /* ignore */ }
  }, [shortlist]);

  const countries = useMemo(() => {
    if (!meta) return [];
    return region === 'All' ? meta.countries : meta.countries.filter((c) => c.region === region);
  }, [meta, region]);

  const shortlistKeys = useMemo(() => new Set(shortlist.map((u) => u.key)), [shortlist]);

  const toggleShortlist = (uni) => {
    setOutcome(null);
    setApplyError('');
    if (shortlistKeys.has(uni.key)) {
      setShortlist(shortlist.filter((u) => u.key !== uni.key));
    } else if (shortlist.length >= MAX_SHORTLIST) {
      setApplyError(`You can shortlist up to ${MAX_SHORTLIST} universities at a time.`);
    } else {
      setShortlist([...shortlist, {
        key: uni.key, name: uni.name, country: uni.country, alphaTwoCode: uni.alphaTwoCode
      }]);
    }
  };

  const changeRegion = (name) => {
    setRegion(name);
    setCountry('');
    setPage(1);
  };

  const handleApply = async () => {
    setApplyError('');
    setOutcome(null);
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      setApplyError('Only student accounts can submit applications.');
      return;
    }
    if (!program.trim()) {
      setApplyError('Enter the program you want to study.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/universities/apply', {
        universityKeys: shortlist.map((u) => u.key),
        program: program.trim(),
        degreeLevel
      });
      setOutcome(res.data);
      const done = new Set(res.data.results.filter((r) => r.success).map((r) => r.key));
      setShortlist(shortlist.filter((u) => !done.has(u.key)));
    } catch (err) {
      if (err.response?.data?.results) {
        setOutcome(err.response.data);
      } else {
        setApplyError(err.response?.data?.message || 'Could not submit your applications. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const regionTabs = [{ name: 'All', count: meta?.total }, ...(meta?.regions || [])];
  const sourceLabel = meta?.source === 'live'
    ? 'Live'
    : meta?.source === 'saved' ? 'Saved copy' : meta?.source === 'builtin' ? 'Offline sample' : 'Connecting';

  return (
    <div className={user ? 'space-y-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-3xl p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-wider">
              <Globe2 className="w-4 h-4" /> Global University Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Find universities worldwide, apply to many with one profile
            </h1>
            <p className="text-indigo-100 text-sm mt-2 max-w-2xl">
              Browse by region and country, shortlist up to {MAX_SHORTLIST} universities, and send every application in one step.
              All of them are tracked together on your dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/15 rounded-2xl px-4 py-2.5">
              <p className="text-xl font-black">{meta ? meta.total.toLocaleString() : '—'}</p>
              <p className="text-indigo-100">Universities</p>
            </div>
            <div className="bg-white/15 rounded-2xl px-4 py-2.5">
              <p className="text-xl font-black">{meta ? meta.countries.length : '—'}</p>
              <p className="text-indigo-100">Countries</p>
            </div>
            <div className="bg-white/15 rounded-2xl px-4 py-2.5">
              <p className="text-sm font-black flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${meta?.source === 'live' ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
                {sourceLabel}
              </p>
              <p className="text-indigo-100">
                {meta?.lastSynced ? `Synced ${new Date(meta.lastSynced).toLocaleString()}` : 'Syncing directory'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Region tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {regionTabs.map((r) => (
          <button
            key={r.name}
            onClick={() => changeRegion(r.name)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
              region === r.name
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            {r.name === 'All' ? 'All regions' : r.name}
            {r.count != null && (
              <span className={`text-[10px] ${region === r.name ? 'text-indigo-100' : 'text-slate-400'}`}>
                {r.count.toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by university, country or state"
                className="w-full ps-9 pe-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              className="sm:w-60 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter by country"
            >
              <option value="">All countries{region !== 'All' ? ` in ${region}` : ''}</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {loading ? 'Loading universities…' : `${data.total.toLocaleString()} universities found`}
            </span>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {!loading && !error && data.universities.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-sm text-slate-500">
              No universities match these filters. Try another region or a shorter search.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.universities.map((uni) => {
              const picked = shortlistKeys.has(uni.key);
              return (
                <div
                  key={uni.key}
                  className={`bg-white rounded-2xl border p-4 flex flex-col gap-3 transition ${
                    picked ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none notranslate" translate="no">{flagOf(uni.alphaTwoCode)}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{uni.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {uni.stateProvince ? `${uni.stateProvince}, ` : ''}{uni.country}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {uni.region}
                    </span>
                    <div className="flex items-center gap-2">
                      {uni.website && (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-700 flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => toggleShortlist(uni)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                          picked
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {picked ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {picked ? 'Shortlisted' : 'Shortlist'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {data.page} of {data.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(page + 1, data.pages))}
                disabled={page >= data.pages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* One-stop application panel */}
        <aside className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm lg:sticky lg:top-20 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-600" /> One-Stop Application
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              One profile, one click. Your saved academics and documents go to every university on this list.
            </p>
          </div>

          {shortlist.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 text-center text-xs text-slate-500">
              Your shortlist is empty. Press “Shortlist” on any university to add it here.
            </div>
          ) : (
            <ul className="space-y-2">
              {shortlist.map((u) => (
                <li key={u.key} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-base notranslate" translate="no">{flagOf(u.alphaTwoCode)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.country}</p>
                  </div>
                  <button
                    onClick={() => toggleShortlist(u)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    aria-label={`Remove ${u.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Program you want to study</label>
              <input
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                maxLength={80}
                placeholder="e.g. Computer Science"
                className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Level</label>
              <select
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
          </div>

          {applyError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {applyError}
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={submitting || shortlist.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {!user
              ? 'Sign in to apply'
              : submitting
                ? 'Submitting…'
                : `Apply to ${shortlist.length} ${shortlist.length === 1 ? 'university' : 'universities'}`}
          </button>

          {outcome && (
            <div className="border border-slate-200 rounded-2xl p-3 space-y-2">
              <p className="text-xs font-bold text-slate-900">{outcome.message}</p>
              <ul className="space-y-1.5">
                {outcome.results.map((r) => (
                  <li key={r.key} className="text-[11px] flex items-start gap-1.5">
                    {r.success
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      : <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                    <span className="text-slate-600">
                      <strong className="text-slate-800">{r.university || 'University'}</strong>{' — '}
                      {r.success ? (
                        <Link to={`/student/application/${r.applicationId}`} className="text-indigo-700 font-semibold hover:underline">
                          {r.applicationNumber}
                        </Link>
                      ) : r.message}
                    </span>
                  </li>
                ))}
              </ul>
              {outcome.submitted > 0 && (
                <Link to="/student/dashboard" className="block text-center text-xs font-bold text-indigo-700 hover:underline pt-1">
                  Track all applications on your dashboard
                </Link>
              )}
            </div>
          )}

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Applications are recorded and tracked inside SmartApply. Each university's own admissions office makes the final decision.
          </p>
        </aside>
      </div>
    </div>
  );
}
