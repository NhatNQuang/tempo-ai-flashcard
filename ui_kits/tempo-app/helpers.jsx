// Tempo UI kit — shared helpers (icons, subject tones, decorative backdrops)

// Lucide icon wrapper. React owns a <span> wrapper and the <i data-lucide>
// placeholder is injected as raw (non-React) HTML inside it; lucide.createIcons()
// then swaps that inner <i> for an <svg> WITHOUT touching the React-managed span.
// (Letting lucide replace a React-rendered node causes "removeChild ... not a child"
// crashes during fast re-renders, e.g. the upload flow, which unmount the whole app.)
function Icon({ name, size = 18, color, style }) {
  const placeholder = `<i data-lucide="${name}" style="width:${size}px;height:${size}px;display:inline-flex"></i>`;
  return (
    <span
      style={{ width: size, height: size, color, display: 'inline-flex', ...style }}
      dangerouslySetInnerHTML={{ __html: placeholder }}
    />
  );
}

const SUBJECT = {
  cs:      { color: 'var(--subject-cs)',      soft: 'rgba(139,92,246,0.16)' },
  math:    { color: 'var(--subject-math)',    soft: 'rgba(91,157,248,0.16)' },
  science: { color: 'var(--subject-science)', soft: 'rgba(63,209,128,0.16)' },
  lang:    { color: 'var(--subject-lang)',    soft: 'rgba(246,178,60,0.16)' },
  bio:     { color: 'var(--subject-bio)',     soft: 'rgba(45,212,191,0.16)' },
  physics: { color: 'var(--subject-physics)', soft: 'rgba(240,88,79,0.16)' },
};

// Stylized "constellation" backdrop used on study-space / group banners,
// tinted to the subject color (stand-in for the product's decorative art).
function subjectBackdrop(tone) {
  const c = (SUBJECT[tone] || SUBJECT.cs).color;
  return {
    background: `
      radial-gradient(120px 80px at 22% 30%, ${(SUBJECT[tone]||SUBJECT.cs).soft}, transparent 70%),
      radial-gradient(140px 90px at 78% 60%, ${(SUBJECT[tone]||SUBJECT.cs).soft}, transparent 70%),
      linear-gradient(160deg, var(--surface-2), var(--surface-1))`,
    position: 'relative',
    overflow: 'hidden',
  };
}

// SVG dotted network overlay for banners
function Constellation({ tone = 'cs', opacity = 0.5 }) {
  const c = (SUBJECT[tone] || SUBJECT.cs).color;
  const pts = [[20,30],[55,18],[80,40],[110,22],[140,48],[40,60],[95,68],[150,72],[125,90],[65,88]];
  const lines = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[2,6],[6,8],[5,9],[9,6]];
  return (
    <svg viewBox="0 0 170 110" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}>
      {lines.map(([a,b],i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={c} strokeWidth="0.5" opacity="0.4" />)}
      {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r={i % 3 === 0 ? 2.2 : 1.4} fill={c} opacity={i % 2 ? 0.9 : 0.6} />)}
    </svg>
  );
}

// Donut chart from [{pct,color}] segments
function Donut({ segments, size = 150, thickness = 22, centerTop, centerBottom }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.pct / 100) * c;
          const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.16, color: 'var(--text-primary)', lineHeight: 1.05 }}>{centerTop}</span>
        <span style={{ fontSize: size * 0.09, color: 'var(--text-tertiary)' }}>{centerBottom}</span>
      </div>
    </div>
  );
}

// Map flashcard set fields stored as DB enums (lowercase, e.g. 'medium',
// 'multiple_choice') back to the display vocabulary the app renders & filters on
// ('Normal', 'Multiple choice', ...). The backend collapses 'Situation' into
// 'multiple_choice' on save (no dedicated enum value), so it reads back as
// 'Multiple choice'.
const DIFFICULTY_DISPLAY = { easy: 'Easy', medium: 'Normal', hard: 'Hard', mixed: 'Mixed' };
const CONTENT_TYPE_DISPLAY = { multiple_choice: 'Multiple choice', true_false: 'Multiple choice', short_answer: 'Multiple choice', mixed: 'Mixed' };
function difficultyFromEnum(value) {
  if (!value) return 'Normal';
  return DIFFICULTY_DISPLAY[String(value).toLowerCase()] || value;
}
function contentTypeFromEnum(value) {
  if (!value) return 'Mixed';
  return CONTENT_TYPE_DISPLAY[String(value).toLowerCase()] || value;
}

// Normalize flashcards loaded from the DB (where each card's `options` is an array of
// { option_text, is_correct, order_index } rows) into the shape FlashcardStudy renders:
// `options` as plain strings + `correctOption` as a letter. Rendering the raw option
// objects as React children throws and blanks the whole study view.
function flashcardsFromDb(cards) {
  return (cards || []).map(card => {
    const opts = Array.isArray(card.options)
      ? [...card.options].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      : [];
    const optionTexts = opts.map(o => (o && typeof o === 'object') ? o.option_text : o);
    const correctIdx = opts.findIndex(o => o && o.is_correct);
    return {
      id: card.id,
      question: card.question,
      answer: card.answer || (correctIdx >= 0 ? optionTexts[correctIdx] : ''),
      explanation: card.explanation || '',
      options: optionTexts,
      correctOption: correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : (card.correctOption || ''),
      starred: !!card.starred,
    };
  });
}

Object.assign(window, { Icon, SUBJECT, subjectBackdrop, Constellation, Donut, difficultyFromEnum, contentTypeFromEnum, flashcardsFromDb });
