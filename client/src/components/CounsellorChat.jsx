import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MessageCircle, X, Send, Sparkles, Trash2, ArrowRight } from 'lucide-react';

const WELCOME = {
  _id: 'welcome',
  role: 'assistant',
  content:
    'Hello! I am your SmartApply counsellor. Ask me about your application status, courses that suit you, scholarships, missing documents, or universities in any country.',
  links: []
};

const FALLBACK_SUGGESTIONS = [
  'What is my application status?',
  'Which courses suit me?',
  'Which scholarships can I get?',
  'What documents am I missing?'
];

/** Floating counsellor chatbot for students. Conversation is saved to the student's account. */
export default function CounsellorChat() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [suggestions, setSuggestions] = useState(FALLBACK_SUGGESTIONS);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load the saved conversation the first time the panel opens
  useEffect(() => {
    if (!open || loaded) return;
    api.get('/chat/history')
      .then((res) => {
        setAiEnabled(Boolean(res.data.aiEnabled));
        if (res.data.messages.length) {
          setMessages([WELCOME, ...res.data.messages]);
          const last = res.data.messages[res.data.messages.length - 1];
          if (last.role === 'assistant' && last.suggestions?.length) setSuggestions(last.suggestions);
        } else if (res.data.suggestions?.length) {
          setSuggestions(res.data.suggestions);
        }
      })
      .catch(() => setError('Could not load your earlier conversation.'))
      .finally(() => setLoaded(true));
  }, [open, loaded]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async (text) => {
    const message = String(text ?? input).trim();
    if (!message || sending) return;
    setError('');
    setInput('');
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { _id: tempId, role: 'user', content: message }]);
    try {
      const res = await api.post('/chat/message', { message });
      setMessages((prev) => [...prev.filter((m) => m._id !== tempId), res.data.userMessage, res.data.reply]);
      if (res.data.reply.suggestions?.length) setSuggestions(res.data.reply.suggestions);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInput(message);
      setError(err.response?.data?.message || 'Could not reach the counsellor. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    setError('');
    try {
      await api.delete('/chat/history');
      setMessages([WELCOME]);
      setSuggestions(FALLBACK_SUGGESTIONS);
    } catch (err) {
      setError('Could not clear the conversation.');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 end-5 z-40 flex items-center gap-2 ps-4 pe-5 py-3 rounded-full bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
          aria-label="Open counsellor chat"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Ask Counsellor</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 inset-x-3 bottom-3 top-20 sm:inset-auto sm:bottom-5 sm:end-5 sm:w-[390px] sm:h-[580px] sm:max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="SmartApply counsellor chat"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-tight">SmartApply Counsellor</p>
                <p className="text-[11px] text-indigo-100 truncate">
                  {aiEnabled ? 'AI answers from your own profile' : 'Answers from your own profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clear}
                className="p-2 rounded-lg hover:bg-white/15 transition"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/15 transition"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/70">
            {messages.map((m) => (
              <div key={m._id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-ee-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-es-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  {m.role === 'assistant' && m.links?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {m.links.map((l) => (
                        <Link
                          key={`${m._id}-${l.to}`}
                          to={l.to}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          {l.label} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-es-md px-4 py-3 flex items-center gap-1" aria-label="Counsellor is typing">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white px-3 pt-2.5 pb-3 space-y-2">
            {!sending && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] font-semibold whitespace-nowrap px-2.5 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-[11px] text-rose-600 px-1">{error}</p>}

            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={600}
                placeholder="Ask about your applications…"
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 px-1">
              Guidance only. Admissions officers make every final decision.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
