/**
 * Global University Directory
 * Pulls the open, community-maintained world university list (10,000+ institutions,
 * 200 countries), groups it by region, and keeps it fresh in the background.
 * Falls back to the last saved copy (or a small built-in list) when offline.
 */
const fs = require('fs');
const path = require('path');

const SOURCE_URL = process.env.UNIVERSITY_SOURCE_URL ||
  'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json';
const REFRESH_MS = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_FILE = path.join(__dirname, '../data/universities-cache.json');

const REGION_CODES = {
  'Africa': 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ KE LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SL SN SO SS SZ TD TG TN TZ UG ZA ZM ZW',
  'Asia': 'AF AM AZ BD BN BT CN GE HK ID IN JP KG KH KP KR KZ LA LK MM MN MO MV MY NP PH PK SG TH TJ TM TW UZ VN',
  'Middle East': 'AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE',
  'Europe': 'AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GR HR HU IE IS IT LI LT LU LV MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA XK',
  'North America': 'AG BB BM BS BZ CA CR CU DM DO GD GL GP GT HN HT JM KN KY LC MS MX NI PA PR SV TC TT US VC VG',
  'South America': 'AR BO BR CL CO EC GF GY PE PY SR UY VE',
  'Oceania': 'AU FJ GU NC NU NZ PF PG WS'
};
const REGIONS = Object.keys(REGION_CODES);
const CODE_TO_REGION = {};
REGIONS.forEach(r => REGION_CODES[r].split(' ').forEach(c => { CODE_TO_REGION[c] = r; }));

const FALLBACK = [
  ['Massachusetts Institute of Technology', 'United States', 'US', 'Massachusetts', 'https://web.mit.edu/'],
  ['Stanford University', 'United States', 'US', 'California', 'https://www.stanford.edu/'],
  ['Harvard University', 'United States', 'US', 'Massachusetts', 'https://www.harvard.edu/'],
  ['University of Toronto', 'Canada', 'CA', 'Ontario', 'https://www.utoronto.ca/'],
  ['University of Oxford', 'United Kingdom', 'GB', null, 'https://www.ox.ac.uk/'],
  ['University of Cambridge', 'United Kingdom', 'GB', null, 'https://www.cam.ac.uk/'],
  ['ETH Zurich', 'Switzerland', 'CH', null, 'https://www.ethz.ch/'],
  ['Technical University of Munich', 'Germany', 'DE', null, 'https://www.tum.de/'],
  ['Sorbonne University', 'France', 'FR', null, 'https://www.sorbonne-universite.fr/'],
  ['Indian Institute of Technology Bombay', 'India', 'IN', 'Maharashtra', 'https://www.iitb.ac.in/'],
  ['Indian Institute of Technology Delhi', 'India', 'IN', 'Delhi', 'https://home.iitd.ac.in/'],
  ['University of Delhi', 'India', 'IN', 'Delhi', 'https://www.du.ac.in/'],
  ['National University of Singapore', 'Singapore', 'SG', null, 'https://www.nus.edu.sg/'],
  ['University of Tokyo', 'Japan', 'JP', null, 'https://www.u-tokyo.ac.jp/'],
  ['Tsinghua University', 'China', 'CN', null, 'https://www.tsinghua.edu.cn/'],
  ['Seoul National University', 'Korea, Republic of', 'KR', null, 'https://www.snu.ac.kr/'],
  ['King Saud University', 'Saudi Arabia', 'SA', null, 'https://www.ksu.edu.sa/'],
  ['United Arab Emirates University', 'United Arab Emirates', 'AE', null, 'https://www.uaeu.ac.ae/'],
  ['University of Cape Town', 'South Africa', 'ZA', null, 'https://www.uct.ac.za/'],
  ['Cairo University', 'Egypt', 'EG', null, 'https://cu.edu.eg/'],
  ['University of Nairobi', 'Kenya', 'KE', null, 'https://www.uonbi.ac.ke/'],
  ['University of São Paulo', 'Brazil', 'BR', null, 'https://www.usp.br/'],
  ['University of Buenos Aires', 'Argentina', 'AR', null, 'https://www.uba.ar/'],
  ['University of Melbourne', 'Australia', 'AU', 'Victoria', 'https://www.unimelb.edu.au/'],
  ['University of Auckland', 'New Zealand', 'NZ', null, 'https://www.auckland.ac.nz/']
].map(([name, country, alpha_two_code, state, web]) => ({
  name, country, alpha_two_code, 'state-province': state, web_pages: [web], domains: []
}));

const state = {
  list: [],
  byKey: new Map(),
  meta: { total: 0, regions: [], countries: [] },
  source: 'none',       // live | saved | builtin
  lastSynced: null,
  loading: null,
  timer: null
};

const makeKey = (name, code) => `${String(name).trim()}|${String(code || '')}`.toLowerCase();

const normalize = (raw) => {
  const seen = new Set();
  const list = [];
  for (const u of raw) {
    if (!u || !u.name || !u.country) continue;
    const code = String(u.alpha_two_code || '').toUpperCase();
    const key = makeKey(u.name, code);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({
      key,
      name: String(u.name).trim(),
      country: String(u.country).trim(),
      alphaTwoCode: code,
      region: CODE_TO_REGION[code] || 'Other',
      stateProvince: u['state-province'] || '',
      website: (u.web_pages && u.web_pages[0]) || '',
      domain: (u.domains && u.domains[0]) || ''
    });
  }
  list.sort((a, b) => a.name.localeCompare(b.name, 'en', { ignorePunctuation: true, sensitivity: 'base' }));
  return list;
};

const install = (raw, source, syncedAt) => {
  const list = normalize(raw);
  if (!list.length) throw new Error('University list was empty');
  const regionCounts = {};
  const countryMap = {};
  for (const u of list) {
    regionCounts[u.region] = (regionCounts[u.region] || 0) + 1;
    if (!countryMap[u.country]) countryMap[u.country] = { name: u.country, alphaTwoCode: u.alphaTwoCode, region: u.region, count: 0 };
    countryMap[u.country].count++;
  }
  state.list = list;
  state.byKey = new Map(list.map(u => [u.key, u]));
  state.meta = {
    total: list.length,
    regions: Object.keys(regionCounts).sort().map(name => ({ name, count: regionCounts[name] })),
    countries: Object.values(countryMap).sort((a, b) => a.name.localeCompare(b.name))
  };
  state.source = source;
  state.lastSynced = syncedAt || new Date().toISOString();
};

const fetchLive = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(SOURCE_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`Directory source responded ${res.status}`);
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error('Unexpected directory format');
    install(raw, 'live');
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify({ syncedAt: state.lastSynced, universities: raw }));
    } catch (e) { /* saving a local copy is best-effort */ }
    return true;
  } finally {
    clearTimeout(timeout);
  }
};

const refresh = async () => {
  try {
    await fetchLive();
    console.log(`🌍 Global university directory synced: ${state.meta.total} universities in ${state.meta.countries.length} countries`);
  } catch (err) {
    if (!state.list.length) {
      try {
        const saved = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        install(saved.universities, 'saved', saved.syncedAt);
      } catch (e) {
        install(FALLBACK, 'builtin');
      }
    }
    console.warn(`⚠️  University directory live sync failed (${err.message}). Serving ${state.source} copy.`);
  }
};

const ensureLoaded = async () => {
  if (state.list.length && state.source === 'live') return;
  if (!state.loading) {
    state.loading = refresh().finally(() => { state.loading = null; });
  }
  if (!state.list.length) await state.loading;
};

const startAutoRefresh = () => {
  if (state.timer) return;
  ensureLoaded();
  state.timer = setInterval(refresh, REFRESH_MS);
  if (state.timer.unref) state.timer.unref();
};

const search = async ({ region, country, q, page = 1, limit = 24 }) => {
  await ensureLoaded();
  const term = (q || '').trim().toLowerCase();
  let results = state.list;
  if (region && region !== 'All') results = results.filter(u => u.region === region);
  if (country) results = results.filter(u => u.country === country);
  if (term) {
    results = results.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.country.toLowerCase().includes(term) ||
      u.stateProvince.toLowerCase().includes(term)
    );
  }
  const size = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 60);
  const pages = Math.max(Math.ceil(results.length / size), 1);
  const current = Math.min(Math.max(parseInt(page, 10) || 1, 1), pages);
  return {
    total: results.length,
    page: current,
    pages,
    universities: results.slice((current - 1) * size, current * size)
  };
};

const getMeta = async () => {
  await ensureLoaded();
  return { ...state.meta, source: state.source, lastSynced: state.lastSynced };
};

const findByKey = async (key) => {
  await ensureLoaded();
  return state.byKey.get(String(key || '').toLowerCase()) || null;
};

module.exports = { search, getMeta, findByKey, startAutoRefresh, REGIONS };
