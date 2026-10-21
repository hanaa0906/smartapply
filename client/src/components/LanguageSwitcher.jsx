import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Languages, Search, Check } from 'lucide-react';

// [code, native name, English name] — codes follow Google Translate
const LANGUAGES = [
  ['en', 'English', 'English'], ['hi', 'हिन्दी', 'Hindi'], ['ur', 'اردو', 'Urdu'], ['bn', 'বাংলা', 'Bengali'],
  ['ta', 'தமிழ்', 'Tamil'], ['te', 'తెలుగు', 'Telugu'], ['mr', 'मराठी', 'Marathi'], ['gu', 'ગુજરાતી', 'Gujarati'],
  ['kn', 'ಕನ್ನಡ', 'Kannada'], ['ml', 'മലയാളം', 'Malayalam'], ['pa', 'ਪੰਜਾਬੀ', 'Punjabi'], ['or', 'ଓଡ଼ିଆ', 'Odia'],
  ['as', 'অসমীয়া', 'Assamese'], ['ne', 'नेपाली', 'Nepali'], ['si', 'සිංහල', 'Sinhala'], ['sd', 'سنڌي', 'Sindhi'],
  ['sa', 'संस्कृतम्', 'Sanskrit'], ['gom', 'कोंकणी', 'Konkani'], ['mai', 'मैथिली', 'Maithili'], ['bho', 'भोजपुरी', 'Bhojpuri'],
  ['doi', 'डोगरी', 'Dogri'], ['mni-Mtei', 'Meiteilon', 'Manipuri'], ['lus', 'Mizo ṭawng', 'Mizo'],
  ['ar', 'العربية', 'Arabic'], ['fa', 'فارسی', 'Persian'], ['ps', 'پښتو', 'Pashto'], ['iw', 'עברית', 'Hebrew'],
  ['tr', 'Türkçe', 'Turkish'], ['ku', 'Kurdî', 'Kurdish (Kurmanji)'], ['ckb', 'کوردیی ناوەندی', 'Kurdish (Sorani)'],
  ['zh-CN', '简体中文', 'Chinese (Simplified)'], ['zh-TW', '繁體中文', 'Chinese (Traditional)'], ['ja', '日本語', 'Japanese'],
  ['ko', '한국어', 'Korean'], ['vi', 'Tiếng Việt', 'Vietnamese'], ['th', 'ไทย', 'Thai'], ['id', 'Bahasa Indonesia', 'Indonesian'],
  ['ms', 'Bahasa Melayu', 'Malay'], ['tl', 'Filipino', 'Filipino'], ['my', 'မြန်မာ', 'Burmese'], ['km', 'ខ្មែរ', 'Khmer'],
  ['lo', 'ລາວ', 'Lao'], ['mn', 'Монгол', 'Mongolian'], ['jw', 'Basa Jawa', 'Javanese'], ['su', 'Basa Sunda', 'Sundanese'],
  ['ceb', 'Cebuano', 'Cebuano'], ['ilo', 'Ilokano', 'Ilocano'], ['hmn', 'Hmoob', 'Hmong'], ['ug', 'ئۇيغۇرچە', 'Uyghur'],
  ['es', 'Español', 'Spanish'], ['fr', 'Français', 'French'], ['de', 'Deutsch', 'German'], ['pt', 'Português', 'Portuguese'],
  ['it', 'Italiano', 'Italian'], ['nl', 'Nederlands', 'Dutch'], ['ru', 'Русский', 'Russian'], ['uk', 'Українська', 'Ukrainian'],
  ['pl', 'Polski', 'Polish'], ['ro', 'Română', 'Romanian'], ['el', 'Ελληνικά', 'Greek'], ['cs', 'Čeština', 'Czech'],
  ['sk', 'Slovenčina', 'Slovak'], ['hu', 'Magyar', 'Hungarian'], ['sv', 'Svenska', 'Swedish'], ['no', 'Norsk', 'Norwegian'],
  ['da', 'Dansk', 'Danish'], ['fi', 'Suomi', 'Finnish'], ['is', 'Íslenska', 'Icelandic'], ['et', 'Eesti', 'Estonian'],
  ['lv', 'Latviešu', 'Latvian'], ['lt', 'Lietuvių', 'Lithuanian'], ['bg', 'Български', 'Bulgarian'], ['sr', 'Српски', 'Serbian'],
  ['hr', 'Hrvatski', 'Croatian'], ['bs', 'Bosanski', 'Bosnian'], ['sl', 'Slovenščina', 'Slovenian'], ['mk', 'Македонски', 'Macedonian'],
  ['sq', 'Shqip', 'Albanian'], ['be', 'Беларуская', 'Belarusian'], ['ca', 'Català', 'Catalan'], ['gl', 'Galego', 'Galician'],
  ['eu', 'Euskara', 'Basque'], ['ga', 'Gaeilge', 'Irish'], ['gd', 'Gàidhlig', 'Scots Gaelic'], ['cy', 'Cymraeg', 'Welsh'],
  ['mt', 'Malti', 'Maltese'], ['lb', 'Lëtzebuergesch', 'Luxembourgish'], ['fy', 'Frysk', 'Frisian'], ['co', 'Corsu', 'Corsican'],
  ['la', 'Latina', 'Latin'], ['eo', 'Esperanto', 'Esperanto'], ['yi', 'ייִדיש', 'Yiddish'],
  ['hy', 'Հայերեն', 'Armenian'], ['ka', 'ქართული', 'Georgian'], ['az', 'Azərbaycan', 'Azerbaijani'], ['kk', 'Қазақ', 'Kazakh'],
  ['ky', 'Кыргызча', 'Kyrgyz'], ['uz', 'Oʻzbek', 'Uzbek'], ['tg', 'Тоҷикӣ', 'Tajik'], ['tk', 'Türkmen', 'Turkmen'], ['tt', 'Татар', 'Tatar'],
  ['sw', 'Kiswahili', 'Swahili'], ['am', 'አማርኛ', 'Amharic'], ['ti', 'ትግርኛ', 'Tigrinya'], ['om', 'Afaan Oromoo', 'Oromo'],
  ['so', 'Soomaali', 'Somali'], ['ha', 'Hausa', 'Hausa'], ['yo', 'Yorùbá', 'Yoruba'], ['ig', 'Igbo', 'Igbo'],
  ['zu', 'isiZulu', 'Zulu'], ['xh', 'isiXhosa', 'Xhosa'], ['af', 'Afrikaans', 'Afrikaans'], ['st', 'Sesotho', 'Sesotho'],
  ['nso', 'Sepedi', 'Sepedi'], ['ts', 'Xitsonga', 'Tsonga'], ['sn', 'chiShona', 'Shona'], ['ny', 'Chichewa', 'Chichewa'],
  ['rw', 'Kinyarwanda', 'Kinyarwanda'], ['lg', 'Luganda', 'Luganda'], ['ln', 'Lingála', 'Lingala'], ['mg', 'Malagasy', 'Malagasy'],
  ['ak', 'Twi', 'Twi'], ['ee', 'Eʋegbe', 'Ewe'], ['bm', 'Bamanankan', 'Bambara'], ['kri', 'Krio', 'Krio'],
  ['ht', 'Kreyòl ayisyen', 'Haitian Creole'], ['qu', 'Runasimi', 'Quechua'], ['gn', 'Avañeʼẽ', 'Guarani'], ['ay', 'Aymar aru', 'Aymara'],
  ['haw', 'ʻŌlelo Hawaiʻi', 'Hawaiian'], ['mi', 'Māori', 'Maori'], ['sm', 'Gagana Sāmoa', 'Samoan'], ['dv', 'ދިވެހި', 'Dhivehi']
];

const RTL = new Set(['ar', 'ur', 'fa', 'ps', 'iw', 'sd', 'yi', 'ug', 'dv', 'ckb']);
const STORAGE_KEY = 'smartapply_language';

const readSaved = () => {
  try { return localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) { return 'en'; }
};

const setTranslateCookie = (code) => {
  const host = window.location.hostname;
  const targets = ['', `;domain=${host}`, `;domain=.${host}`];
  targets.forEach((d) => {
    document.cookie = code === 'en'
      ? `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${d}`
      : `googtrans=/en/${code};path=/${d}`;
  });
};

const loadTranslator = () => {
  if (window.__smartapplyTranslatorLoading) return;
  window.__smartapplyTranslatorLoading = true;
  window.googleTranslateElementInit = () => {
    try {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
      );
    } catch (e) { /* translator unavailable — the app stays in English */ }
  };
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
};

/** Applies the saved language as early as possible (called from main.jsx). */
export const initLanguage = () => {
  const code = readSaved();
  document.documentElement.dir = RTL.has(code) ? 'rtl' : 'ltr';
  setTranslateCookie(code);
  if (code !== 'en') loadTranslator();
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [current] = useState(readSaved);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(([code, native, english]) =>
      native.toLowerCase().includes(q) || english.toLowerCase().includes(q) || code.toLowerCase() === q
    );
  }, [query]);

  const choose = (code) => {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
    setTranslateCookie(code);
    window.location.reload();
  };

  const active = LANGUAGES.find(([code]) => code === current) || LANGUAGES[0];

  return (
    <div className="relative notranslate" translate="no" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
        aria-label="Change language"
        title="Change language"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[84px] truncate">{active[1]}</span>
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search language"
                className="w-full ps-8 pe-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-slate-400">No language found.</p>
            )}
            {filtered.map(([code, native, english]) => (
              <button
                key={code}
                onClick={() => choose(code)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-xs hover:bg-slate-50 transition ${
                  code === current ? 'text-indigo-700 bg-indigo-50/60 font-bold' : 'text-slate-700'
                }`}
              >
                <span className="flex flex-col items-start">
                  <span className="font-semibold">{native}</span>
                  <span className="text-[10px] text-slate-400">{english}</span>
                </span>
                {code === current && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-400">
            {LANGUAGES.length} languages · automatic translation
          </div>
        </div>
      )}
    </div>
  );
}
