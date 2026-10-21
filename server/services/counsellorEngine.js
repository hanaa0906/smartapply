/**
 * SmartApply Counsellor
 * Answers student questions from their own data: profile, applications, documents,
 * course compatibility, scholarships and the global university directory.
 *
 * Works out of the box with built-in answers. If ANTHROPIC_API_KEY is set in .env,
 * replies are written by an AI model that is given the same student data.
 * Decision-support only: it never promises admission.
 */
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Course = require('../models/Course');
const Scholarship = require('../models/Scholarship');
const { calculateCourseCompatibility } = require('./compatibilityEngine');
const directory = require('./universityDirectory');

const STATUS_MEANING = {
  DRAFT: 'saved as a draft and not yet submitted. Submit it when you are ready.',
  SUBMITTED: 'received and waiting for an admissions officer to pick it up.',
  DOCUMENT_VERIFICATION: 'having its documents checked by the admissions office. No action is needed unless they ask for a correction.',
  CORRECTION_REQUIRED: 'waiting on you: the admissions office asked for a correction. Open the application to see what they need.',
  ACADEMIC_REVIEW: 'with the academic committee, who are reviewing your marks and profile.',
  INTERVIEW: 'at the interview stage. Check the application for the date and joining details.',
  WAITLISTED: 'on the waitlist. You will be told if a seat opens up.',
  APPROVED: 'approved. Congratulations! Watch for enrolment instructions.',
  REJECTED: 'not successful this time. You can still apply to other programs.',
  ENROLLED: 'complete: you are enrolled.'
};

const CORE_DOCUMENTS = ['10th_marksheet', '12th_marksheet', 'id_proof', 'passport_photo'];
const DOC_LABEL = {
  '10th_marksheet': '10th marksheet',
  '12th_marksheet': '12th marksheet',
  id_proof: 'ID proof',
  transfer_certificate: 'transfer certificate',
  community_certificate: 'community certificate',
  income_certificate: 'income certificate',
  passport_photo: 'passport photo',
  other: 'other document'
};

const COUNTRY_ALIASES = {
  usa: 'United States', 'u.s.': 'United States', america: 'United States', 'united states': 'United States',
  uk: 'United Kingdom', britain: 'United Kingdom', england: 'United Kingdom',
  uae: 'United Arab Emirates', dubai: 'United Arab Emirates',
  korea: 'Korea, Republic of', 'south korea': 'Korea, Republic of',
  russia: 'Russian Federation'
};

const DEFAULT_SUGGESTIONS = [
  'What is my application status?',
  'Which courses suit me?',
  'Which scholarships can I get?',
  'What documents am I missing?'
];

const pretty = (status) => String(status || '').replace(/_/g, ' ').toLowerCase();
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-IN')}`;

/** Everything the counsellor knows about this student. */
const buildContext = async (user) => {
  const [profile, applications, documents, courses, scholarships, meta] = await Promise.all([
    StudentProfile.findOne({ userId: user.id }),
    Application.find({ studentId: user.id })
      .populate('courseId', 'name degreeLevel applicationDeadline')
      .populate('collegeId', 'name city country isExternal')
      .sort({ createdAt: -1 }),
    Document.find({ studentId: user.id }),
    Course.find({ isActive: true, isExternal: { $ne: true } }).populate('collegeId', 'name city'),
    Scholarship.find({ isActive: true }),
    directory.getMeta().catch(() => null)
  ]);

  const matches = profile
    ? courses
      .map(course => ({ course, result: calculateCourseCompatibility(profile, course) }))
      .sort((a, b) => b.result.compatibilityScore - a.result.compatibilityScore)
    : [];

  const pct = profile?.academicInfo?.twelfth?.percentage || 0;
  const income = profile?.personalInfo?.annualFamilyIncome || 0;
  const category = profile?.personalInfo?.category || 'General';
  const gender = profile?.personalInfo?.gender;
  const stream = profile?.academicInfo?.twelfth?.stream;
  const eligibleScholarships = profile ? scholarships.filter(s => {
    const r = s.eligibilityRules || {};
    if (pct < (r.minPercentage || 0)) return false;
    if (r.maxAnnualIncome && income > r.maxAnnualIncome) return false;
    if (r.eligibleCategories?.length && !r.eligibleCategories.includes(category)) return false;
    if (r.requiredStream?.length && !r.requiredStream.includes(stream)) return false;
    if (r.genderRestriction && r.genderRestriction !== 'All' && r.genderRestriction !== gender) return false;
    return true;
  }) : [];

  return { user, profile, applications, documents, matches, eligibleScholarships, meta };
};

const findCountry = (text, meta) => {
  for (const alias of Object.keys(COUNTRY_ALIASES)) {
    if (alias === 'america' && /(north|south|latin) america/.test(text)) continue;
    if (new RegExp(`(^|[^a-z])${alias.replace(/\./g, '\\.')}([^a-z]|$)`).test(text)) return COUNTRY_ALIASES[alias];
  }
  if (!meta) return null;
  const padded = ` ${text.replace(/[^a-z\u00c0-\u024f' -]/g, ' ')} `;
  const hit = meta.countries
    .filter(c => c.name.length > 3 && padded.includes(` ${c.name.toLowerCase()} `))
    .sort((a, b) => b.name.length - a.name.length)[0];
  return hit ? hit.name : null;
};

const findRegion = (text) => directory.REGIONS.find(r => text.includes(r.toLowerCase())) || null;

/* ---------- Built-in answers ---------- */

const answerStatus = (ctx) => {
  if (!ctx.applications.length) {
    return {
      text: 'You have not submitted any applications yet. You can apply to a course here, or shortlist universities worldwide and apply to several at once.',
      links: [{ label: 'Apply for a course', to: '/student/apply' }, { label: 'Global universities', to: '/student/universities' }],
      suggestions: ['Which courses suit me?', 'How do I apply?']
    };
  }
  const lines = ctx.applications.slice(0, 6).map(a =>
    `- ${a.applicationNumber}: ${a.courseId?.name || 'Program'} at ${a.collegeId?.name || 'the university'} is ${STATUS_MEANING[a.status] || pretty(a.status)}`
  );
  const more = ctx.applications.length > 6 ? `\n...and ${ctx.applications.length - 6} more on your dashboard.` : '';
  const needsAction = ctx.applications.filter(a => a.status === 'CORRECTION_REQUIRED').length;
  return {
    text: `You have ${ctx.applications.length} application${ctx.applications.length === 1 ? '' : 's'}:\n${lines.join('\n')}${more}` +
      (needsAction ? `\n\n${needsAction} of them need${needsAction === 1 ? 's' : ''} a correction from you.` : '') +
      '\n\nStatus changes appear on your dashboard instantly, without refreshing.',
    links: [
      { label: 'Open dashboard', to: '/student/dashboard' },
      { label: `View ${ctx.applications[0].applicationNumber}`, to: `/student/application/${ctx.applications[0]._id}` }
    ],
    suggestions: ['What documents am I missing?', 'Do I have an interview?']
  };
};

const answerCourses = (ctx) => {
  if (!ctx.profile) {
    return {
      text: 'I need your academic details before I can suggest courses. Please fill in your digital profile first.',
      links: [{ label: 'Complete profile', to: '/student/profile' }]
    };
  }
  const top = ctx.matches.slice(0, 4);
  if (!top.length) return { text: 'There are no open courses to compare right now. Please check again later.' };
  const lines = top.map(m =>
    `- ${m.course.name} (${m.course.collegeId?.name || 'college'}): ${m.result.compatibilityScore}% match, ${m.result.category}` +
    (m.result.reasons?.[0] ? `. ${m.result.reasons[0]}` : '')
  );
  return {
    text: `Based on your marks, stream, skills and interests, these fit you best:\n${lines.join('\n')}\n\nThese scores are guidance only and do not guarantee admission. An admissions officer makes every final decision.`,
    links: [{ label: 'See all matches', to: '/student/recommendations' }, { label: 'Try the What-If Simulator', to: '/student/simulator' }],
    suggestions: ['How do I apply?', 'Which scholarships can I get?']
  };
};

const answerScholarships = (ctx) => {
  if (!ctx.eligibleScholarships.length) {
    return {
      text: 'I could not find a scholarship that matches every rule for your current profile. Check that your family income, category and marks are up to date, because those decide eligibility.',
      links: [{ label: 'Scholarship matcher', to: '/student/scholarships' }, { label: 'Update profile', to: '/student/profile' }]
    };
  }
  const lines = ctx.eligibleScholarships.slice(0, 5).map(s =>
    `- ${s.title} (${s.provider}): ${money(s.amountPerYear)} per year, apply by ${fmtDate(s.deadline)}`
  );
  return {
    text: `You meet the eligibility rules for ${ctx.eligibleScholarships.length} scholarship${ctx.eligibleScholarships.length === 1 ? '' : 's'}:\n${lines.join('\n')}`,
    links: [{ label: 'Open scholarship matcher', to: '/student/scholarships' }],
    suggestions: ['What documents am I missing?', 'What is my application status?']
  };
};

const answerDocuments = (ctx) => {
  const have = new Set(ctx.documents.map(d => d.documentType));
  const missing = CORE_DOCUMENTS.filter(t => !have.has(t));
  const flagged = ctx.documents.filter(d => ['FLAGGED', 'CORRECTION_REQUIRED'].includes(d.status));
  const verified = ctx.documents.filter(d => d.status === 'VERIFIED').length;
  const parts = [`You have uploaded ${ctx.documents.length} document${ctx.documents.length === 1 ? '' : 's'}; ${verified} verified so far.`];
  parts.push(missing.length
    ? `Still missing: ${missing.map(t => DOC_LABEL[t]).join(', ')}.`
    : 'All four core documents (10th marksheet, 12th marksheet, ID proof, passport photo) are uploaded.');
  if (flagged.length) parts.push(`Needs your attention: ${flagged.map(d => DOC_LABEL[d.documentType] || d.documentType).join(', ')}.`);
  parts.push('Scholarships may also ask for an income or community certificate.');
  return {
    text: parts.join('\n'),
    links: [{ label: 'Open document locker', to: '/student/documents' }],
    suggestions: ['What is my application status?', 'Which scholarships can I get?']
  };
};

const answerProfile = (ctx) => {
  if (!ctx.profile) {
    return { text: 'You have not set up your digital profile yet.', links: [{ label: 'Create profile', to: '/student/profile' }] };
  }
  const a = ctx.profile.academicInfo || {};
  const exam = (a.entranceExams || [])[0];
  return {
    text: `Your profile is ${ctx.profile.completionPercentage || 0}% complete.\n- 12th: ${a.twelfth?.percentage ?? '-'}% (${a.twelfth?.stream || 'stream not set'}, ${a.twelfth?.board || 'board not set'})\n- 10th: ${a.tenth?.percentage ?? '-'}%` +
      (exam ? `\n- Entrance exam: ${exam.examName}, score ${exam.score}` : '\n- No entrance exam added yet') +
      '\n\nThe same profile is reused for every application, so keeping it accurate saves you time.',
    links: [{ label: 'Edit profile', to: '/student/profile' }],
    suggestions: ['Which courses suit me?', 'What documents am I missing?']
  };
};

const answerUniversities = async (ctx, text) => {
  const country = findCountry(text, ctx.meta);
  const region = country ? null : findRegion(text);
  if (!country && !region) {
    const total = ctx.meta ? `${ctx.meta.total.toLocaleString('en-US')} universities in ${ctx.meta.countries.length} countries` : 'universities worldwide';
    return {
      text: `The global directory lists ${total}. Tell me a country or region, for example "universities in Canada" or "universities in Europe", and I will show you some. You can shortlist up to 10 and apply to all of them in one step.`,
      links: [{ label: 'Browse global universities', to: '/student/universities' }],
      suggestions: ['Universities in Canada', 'Universities in Germany', 'Universities in Asia']
    };
  }
  const result = await directory.search({ country, region, limit: 6 });
  if (!result.total) {
    return { text: `I could not find universities for ${country || region}.`, links: [{ label: 'Browse global universities', to: '/student/universities' }] };
  }
  const lines = result.universities.map(u => `- ${u.name}${u.stateProvince ? `, ${u.stateProvince}` : ''}${country ? '' : ` (${u.country})`}`);
  return {
    text: `The directory has ${result.total.toLocaleString('en-US')} universities in ${country || region}. A few of them:\n${lines.join('\n')}\n\nOpen the directory to search them all, shortlist the ones you like, and apply together with one profile.`,
    links: [{ label: 'Browse global universities', to: '/student/universities' }],
    suggestions: ['How do I apply?', 'Which courses suit me?']
  };
};

const answerDeadlines = (ctx) => {
  const now = Date.now();
  const upcoming = ctx.matches
    .filter(m => m.course.applicationDeadline && new Date(m.course.applicationDeadline).getTime() > now)
    .sort((a, b) => new Date(a.course.applicationDeadline) - new Date(b.course.applicationDeadline))
    .slice(0, 5);
  if (!upcoming.length) return { text: 'I do not see any upcoming course deadlines right now.', links: [{ label: 'Browse courses', to: '/student/courses' }] };
  const lines = upcoming.map(m => {
    const days = Math.ceil((new Date(m.course.applicationDeadline).getTime() - now) / 86400000);
    return `- ${m.course.name}: ${fmtDate(m.course.applicationDeadline)} (${days} day${days === 1 ? '' : 's'} left)`;
  });
  return {
    text: `Upcoming application deadlines:\n${lines.join('\n')}`,
    links: [{ label: 'Apply now', to: '/student/apply' }],
    suggestions: ['Which courses suit me?', 'How do I apply?']
  };
};

const answerInterview = (ctx) => {
  const withInterview = ctx.applications.filter(a => a.status === 'INTERVIEW' || a.interviewSchedule?.date);
  if (!withInterview.length) {
    return { text: 'No interview has been scheduled for you yet. If an admissions officer schedules one, you will get a live notification and it will appear on the application page.', suggestions: ['What is my application status?'] };
  }
  const lines = withInterview.map(a => {
    const s = a.interviewSchedule || {};
    return `- ${a.courseId?.name || a.applicationNumber}: ${s.date ? fmtDate(s.date) : 'date to be confirmed'}${s.mode ? `, ${s.mode}` : ''}`;
  });
  return {
    text: `Your interviews:\n${lines.join('\n')}\n\nTip: be ready to talk about why you chose the program and what you have built or studied on your own.`,
    links: [{ label: 'Open application', to: `/student/application/${withInterview[0]._id}` }]
  };
};

const answerHowToApply = () => ({
  text: 'Applying takes four steps:\n1. Complete your digital profile (marks, stream, entrance exam).\n2. Upload your documents to the document locker.\n3. Pick a course under "Apply for Course", or shortlist universities worldwide and apply to all of them at once.\n4. Track every application live on your dashboard.\n\nThe Smart Assistant checks your form for mismatches before you submit, but it never rejects an application on its own.',
  links: [
    { label: 'Apply for a course', to: '/student/apply' },
    { label: 'Global universities', to: '/student/universities' },
    { label: 'Document locker', to: '/student/documents' }
  ],
  suggestions: ['Which courses suit me?', 'What documents am I missing?']
});

const answerChances = (ctx) => ({
  text: 'I cannot promise an outcome, because every decision is made by a human admissions officer. What I can do is show how well you fit each course, and the What-If Simulator lets you see how a higher 12th percentage or entrance score would change your readiness.' +
    (ctx.matches[0] ? `\n\nYour strongest fit right now is ${ctx.matches[0].course.name} at ${ctx.matches[0].result.compatibilityScore}%.` : ''),
  links: [{ label: 'Open What-If Simulator', to: '/student/simulator' }, { label: 'See course matches', to: '/student/recommendations' }],
  suggestions: ['Which courses suit me?', 'Which scholarships can I get?']
});

const answerGreeting = (ctx) => ({
  text: `Hello ${String(ctx.user.name || '').split(' ')[0] || 'there'}! I am your SmartApply counsellor. I can check your application status, suggest courses, find scholarships you qualify for, list missing documents, and look up universities in any country. What would you like to know?`,
  suggestions: DEFAULT_SUGGESTIONS
});

const answerFallback = () => ({
  text: 'I am not sure I understood that. I can help with:\n- your application status and next steps\n- courses that suit your profile\n- scholarships you qualify for\n- missing or flagged documents\n- universities in a country or region\n- deadlines, interviews and how to apply',
  suggestions: DEFAULT_SUGGESTIONS
});

const rulesReply = async (ctx, message) => {
  const text = String(message || '').toLowerCase();
  const has = (re) => re.test(text);

  if (has(/universit|abroad|overseas|global|countr|college in|study in/) || findCountry(text, ctx.meta) || findRegion(text)) {
    return answerUniversities(ctx, text);
  }
  if (has(/scholarship|financial aid|fee waiver|funding|stipend/)) return answerScholarships(ctx);
  if (has(/document|marksheet|certificate|upload|missing|locker|verif/)) return answerDocuments(ctx);
  if (has(/interview/)) return answerInterview(ctx);
  if (has(/deadline|last date|due date|closing/)) return answerDeadlines(ctx);
  if (has(/status|track|progress|my application|update on|where is|stage/)) return answerStatus(ctx);
  if (has(/chance|get in|get into|will i|probabil|odds|simulat|what if|what-if/)) return answerChances(ctx);
  if (has(/how (do|can|to).*(apply|start)|apply|process|steps/)) return answerHowToApply();
  if (has(/course|recommend|suit|match|program|degree|branch|which.*(study|choose)|best for me/)) return answerCourses(ctx);
  if (has(/profile|my marks|percentage|my details|score/)) return answerProfile(ctx);
  if (has(/^(hi|hello|hey|hii+|namaste|salaam|salam|good (morning|afternoon|evening))\b|who are you|what can you do|help/)) return answerGreeting(ctx);
  if (has(/thank|thanks|shukriya|dhanyavad/)) return { text: 'You are welcome! Ask me anything else about your applications.', suggestions: DEFAULT_SUGGESTIONS };
  return answerFallback();
};

/* ---------- Optional AI-written answers ---------- */

const contextSummary = (ctx) => {
  const a = ctx.profile?.academicInfo || {};
  return JSON.stringify({
    student: {
      name: ctx.user.name,
      profileCompletion: ctx.profile?.completionPercentage,
      twelfth: a.twelfth ? { percentage: a.twelfth.percentage, stream: a.twelfth.stream, board: a.twelfth.board } : null,
      tenthPercentage: a.tenth?.percentage,
      entranceExams: (a.entranceExams || []).map(e => ({ exam: e.examName, score: e.score, percentile: e.percentile })),
      skills: ctx.profile?.skills,
      interests: ctx.profile?.interests,
      careerGoals: ctx.profile?.careerGoals
    },
    applications: ctx.applications.map(x => ({
      number: x.applicationNumber, program: x.courseId?.name, university: x.collegeId?.name,
      country: x.collegeId?.country, status: x.status, meaning: STATUS_MEANING[x.status],
      interview: x.interviewSchedule?.date || null, adminRemarks: x.adminRemarks || null
    })),
    documents: ctx.documents.map(d => ({ type: d.documentType, status: d.status })),
    missingCoreDocuments: CORE_DOCUMENTS.filter(t => !ctx.documents.some(d => d.documentType === t)),
    courseMatches: ctx.matches.slice(0, 6).map(m => ({
      course: m.course.name, college: m.course.collegeId?.name, score: m.result.compatibilityScore,
      category: m.result.category, deadline: m.course.applicationDeadline, feesPerYear: m.course.feesPerYear
    })),
    eligibleScholarships: ctx.eligibleScholarships.slice(0, 6).map(s => ({
      title: s.title, provider: s.provider, amountPerYear: s.amountPerYear, deadline: s.deadline
    })),
    globalDirectory: ctx.meta ? { universities: ctx.meta.total, countries: ctx.meta.countries.length, regions: ctx.meta.regions } : null
  });
};

const aiReply = async (ctx, message, history) => {
  const system = [
    'You are the SmartApply Counsellor, a friendly admissions guide inside a college admission platform.',
    'Answer using ONLY the student data below and general, well-known admissions knowledge. If something is not in the data, say you do not have it.',
    'Never promise or predict admission; a human admissions officer makes every final decision. Compatibility scores are guidance only.',
    'Reply in the language the student writes in. Be brief: at most 120 words, plain text, short lines starting with "- " for lists. No markdown headings or bold.',
    'App pages you can point to by name: Dashboard, Apply for Course, Global Universities, AI Recommendations, What-If Simulator, Scholarships, Document Locker, Digital Profile.',
    `Student data (JSON): ${contextSummary(ctx)}`
  ].join('\n');

  const messages = history
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content }))
    .concat([{ role: 'user', content: message }]);
  while (messages.length && messages[0].role !== 'user') messages.shift();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.COUNSELLOR_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system,
        messages
      })
    });
    if (!res.ok) throw new Error(`AI service responded ${res.status}`);
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!text) throw new Error('Empty AI reply');
    return text;
  } finally {
    clearTimeout(timeout);
  }
};

const isAiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

/** Main entry: returns { text, links, suggestions, source }. */
const generateReply = async (user, message, history = []) => {
  const ctx = await buildContext(user);
  const base = await rulesReply(ctx, message);
  const reply = {
    text: base.text,
    links: base.links || [],
    suggestions: base.suggestions || DEFAULT_SUGGESTIONS,
    source: 'rules'
  };
  if (isAiEnabled()) {
    try {
      reply.text = await aiReply(ctx, message, history);
      reply.source = 'ai';
    } catch (err) {
      console.warn(`Counsellor AI unavailable (${err.message}); using built-in answer.`);
    }
  }
  return reply;
};

module.exports = { generateReply, isAiEnabled, DEFAULT_SUGGESTIONS };
