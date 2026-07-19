// Tempo UI kit - Learn (home / dashboard)
// Fully integrated native React implementation mapping Learn_tab features

// NOTE: This whole file is wrapped in an IIFE so its top-level declarations
// (DECKS_KEY, NOTES_KEY, Icon, helpers, sub-components) stay local and do not
// collide with the same-named globals declared by helpers.jsx / LibraryScreen.jsx,
// which load earlier. A duplicate top-level `const` across these scripts throws
// "Identifier already declared", which would abort this script and leave
// window.LearnScreen undefined (black screen on the Learn tab). Only `LearnScreen`
// is exported, via window at the end.
(function () {

// Safe UUID/ID generator helper
const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);

// LocalStorage store for flashcard decks and notes
const DECKS_KEY = "tempo:decks";
const NOTES_KEY = "tempo:notes";
const STUDY_STATS_KEY = "tempo:studyStats";

function readStore(key) {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function writeStore(key, val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

function getDecks() { return readStore(DECKS_KEY); }
function getNotes() { return readStore(NOTES_KEY); }
function addDeck(d) { writeStore(DECKS_KEY, [...readStore(DECKS_KEY), d]); }
function addNote(n) { writeStore(NOTES_KEY, [...readStore(NOTES_KEY), n]); }
function getDeck(id) { return readStore(DECKS_KEY).find(d => d.id === id); }
function getNote(id) { return readStore(NOTES_KEY).find(n => n.id === id); }
function markDeckUsed(id, timestamp = Date.now()) {
  writeStore(DECKS_KEY, readStore(DECKS_KEY).map(deck => (
    deck.id === id ? { ...deck, lastUsedAt: timestamp } : deck
  )));
}
function markNoteUsed(id, timestamp = Date.now()) {
  writeStore(NOTES_KEY, readStore(NOTES_KEY).map(note => (
    note.id === id ? { ...note, lastUsedAt: timestamp } : note
  )));
}

function readStudyStats() {
  if (typeof window === "undefined") return { studiedToday: 0, streak: 0, lastStudyDate: null };
  try {
    return JSON.parse(localStorage.getItem(STUDY_STATS_KEY) || '{"studiedToday":0,"streak":0,"lastStudyDate":null}');
  } catch {
    return { studiedToday: 0, streak: 0, lastStudyDate: null };
  }
}

function writeStudyStats(val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDY_STATS_KEY, JSON.stringify(val));
}

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isPreviousDay(prev, next) {
  if (!prev || !next) return false;
  const prevDate = new Date(`${prev}T00:00:00`);
  const nextDate = new Date(`${next}T00:00:00`);
  return Math.round((nextDate - prevDate) / 86400000) === 1;
}

function recordStudyCard() {
  const today = getDateKey();
  const current = readStudyStats();
  const next = { ...current };

  if (current.lastStudyDate !== today) {
    next.streak = isPreviousDay(current.lastStudyDate, today) ? (current.streak || 0) + 1 : 1;
    next.studiedToday = 0;
    next.lastStudyDate = today;
  }

  next.studiedToday = (next.studiedToday || 0) + 1;
  writeStudyStats(next);
}

function formatRelativeTime(timestamp) {
  const t = window.t;
  if (!timestamp) return t('just_now');
  const diff = Date.now() - Number(timestamp);
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}${t('m_ago')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('h_ago')}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}${t('d_ago')}`;
  return new Date(timestamp).toLocaleDateString();
}

function parseErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  return payload.error || payload.message || fallback;
}

async function getAuthHeaders() {
  const headers = {};
  if (window.supabaseClient) {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve Supabase session:', e);
    }
  }
  return headers;
}

async function requestGeneratedMaterial(endpoint, fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value != null) formData.append(key, value);
  });

  const authHeaders = await getAuthHeaders();
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      ...authHeaders
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (payload && payload.code === 'PLAN_LIMIT') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tempo:paywall', { detail: payload }));
      }
      const err = new Error(payload.error || 'Đã đạt giới hạn gói Free.');
      err.code = 'PLAN_LIMIT';
      throw err;
    }
    throw new Error(parseErrorMessage(payload, 'Tempo AI could not process this document.'));
  }
  return payload;
}

function updateCard(deckId, cardId, patch) {
  writeStore(DECKS_KEY, readStore(DECKS_KEY).map(d => d.id === deckId
    ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, ...patch } : c) }
    : d));
}

const Icon = window.Icon;

// Inline CSS injection for card flipping
if (typeof document !== 'undefined' && !document.getElementById('tempo-learn-card-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-learn-card-css';
  s.textContent = `
    .card-perspective {
      perspective: 1000px;
      width: min(100%, 760px);
      max-width: 760px;
      height: 520px;
      min-height: 520px;
      margin: 0 auto;
    }
    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      transform-style: preserve-3d;
      transform: rotateY(0deg);
    }
    .card-inner.flipped {
      transform: rotateY(180deg);
    }
    .card-front, .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: var(--radius-lg);
      padding: 22px 22px 18px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .card-front {
      background: var(--surface-2);
      color: var(--text-primary);
      transform: rotateY(0deg);
    }
    .card-back {
      background: var(--grad-cta);
      color: var(--text-on-violet);
      transform: rotateY(180deg);
    }
    .flashcard-option {
      width: 100%;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, color 180ms ease;
      text-align: left;
    }
    .flashcard-option:hover {
      transform: translateY(-2px);
      border-color: var(--border-strong);
      background: rgba(255,255,255,0.07);
      box-shadow: 0 10px 24px rgba(7, 10, 19, 0.22);
    }
    .flashcard-option.is-correct {
      border-color: rgba(63,209,128,0.75);
      background: rgba(63,209,128,0.14);
      color: var(--text-primary);
      box-shadow: 0 0 0 1px rgba(63,209,128,0.22), 0 16px 30px rgba(15, 104, 61, 0.18);
    }
    .flashcard-option.is-incorrect {
      border-color: rgba(240,88,79,0.75);
      background: rgba(240,88,79,0.14);
      color: var(--text-primary);
      box-shadow: 0 0 0 1px rgba(240,88,79,0.18), 0 16px 30px rgba(114, 29, 25, 0.18);
    }
    .flashcard-option[disabled] {
      cursor: default;
    }
    .flashcard-option-label {
      width: 28px;
      min-width: 28px;
      height: 28px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: var(--text-primary);
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .flashcard-option-text {
      flex: 1;
      min-width: 0;
      font-size: 14px;
      line-height: 1.45;
    }
    .flashcard-scroll {
      overflow: auto;
      padding-right: 4px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .flashcard-scroll::-webkit-scrollbar {
      width: 8px;
    }
    .flashcard-scroll::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.14);
      border-radius: 999px;
    }
    .study-card-shell {
      width: min(100%, 760px);
      max-width: 760px;
      transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease;
    }
    .study-card-shell.swipe-left {
      transform: translateX(-140px) rotate(-12deg);
      opacity: 0;
    }
    .study-card-shell.swipe-right {
      transform: translateX(140px) rotate(12deg);
      opacity: 0;
    }
    .study-card-shell.swipe-back {
      transform: translateX(140px) rotate(8deg);
      opacity: 0;
    }
  `;
  document.head.appendChild(s);
}

// Shown while a deck/note opened by id is still being fetched from the server.
function MaterialLoading() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
      <Icon name="loader-2" size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--violet-400)' }} />
    </div>
  );
}

// Main LearnScreen controller
function LearnScreen({ routeRequest, onNavigateScreen }) {
  const [subview, setSubview] = React.useState({ view: 'upload', id: null });
  const [entrySource, setEntrySource] = React.useState('learn');
  const [decks, setDecks] = React.useState([]);
  const [notes, setNotes] = React.useState([]);
  const [resourcesReady, setResourcesReady] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [aiContext, setAiContext] = React.useState(null);
  const [langToken, setLangToken] = React.useState(0);

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const t = window.t;

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  React.useEffect(() => {
    // Only the material currently being opened needs its full cards/blocks, so fetch
    // just that one resource instead of every resource's details. The old approach
    // (list + a detail request per resource, with the server querying options per
    // card) took ~10s and dropped the whole list to empty if any request stalled.
    if ((subview.view !== 'study' && subview.view !== 'notes') || !subview.id) {
      setResourcesReady(true);
      return;
    }

    let cancelled = false;
    setResourcesReady(false);

    async function loadMaterial() {
      // Local-store fast path for decks/notes generated in this browser.
      const local = subview.view === 'study' ? getDeck(subview.id) : getNote(subview.id);
      if (local) {
        if (subview.view === 'study') setDecks([local]); else setNotes([local]);
        return;
      }
      if (!window.supabaseClient) return;
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`/api/v1/library/resources/${subview.id}`, { headers: authHeaders });
        const json = await res.json();
        const details = json?.data?.details;
        if (cancelled || !json?.success || !details) return;

        if (subview.view === 'study' && details.set) {
          setDecks([{
            id: subview.id,
            name: json.data.title,
            count: details.set.card_count || 0,
            difficulty: window.difficultyFromEnum(details.set.difficulty),
            contentType: window.contentTypeFromEnum(details.set.content_type),
            source: json.data.title,
            createdAt: new Date(json.data.created_at).getTime(),
            cards: window.flashcardsFromDb(details.cards)
          }]);
          // Server-loaded (e.g. imported "with documents") decks aren't in localStorage,
          // so handleNavigate's getDeck() returns nothing and aiContext stays empty.
          // Set it here from the resourceId so chat can RAG against the linked document.
          setAiContext({ materialType: 'flashcards', materialName: json.data.title, sourceName: json.data.title, documentContext: '', itemId: subview.id });
        } else if (subview.view === 'notes' && details.note) {
          const cues = (details.blocks || []).filter(b => b.block_type === 'cue').map(b => b.content);
          const notesList = (details.blocks || []).filter(b => b.block_type === 'main_note').map(b => b.content);
          setNotes([{
            id: subview.id,
            name: json.data.title,
            summary: details.note.summary || '',
            cues,
            notes: notesList,
            source: json.data.title,
            createdAt: new Date(json.data.created_at).getTime()
          }]);
          setAiContext({ materialType: 'notes', materialName: json.data.title, sourceName: json.data.title, documentContext: '', itemId: subview.id });
        }
      } catch (e) {
        console.error('Failed to load material:', e);
      }
    }

    loadMaterial().finally(() => { if (!cancelled) setResourcesReady(true); });
    return () => { cancelled = true; };
  }, [subview]);

  React.useEffect(() => {
    if (!routeRequest?.view || !routeRequest?.id) return;
    setEntrySource(routeRequest.origin || 'learn');
    handleNavigate(routeRequest.view, routeRequest.id);
  }, [routeRequest?.token]);

  function handleNavigate(viewName, id = null) {
    if (viewName === 'upload') {
      setEntrySource('learn');
    }
    if (viewName === 'study' && id) {
      markDeckUsed(id);
    } else if (viewName === 'notes' && id) {
      markNoteUsed(id);
    }

    setSubview({ view: viewName, id });
    if (viewName === 'study') {
      const d = getDeck(id);
      if (d) setAiContext({ materialType: 'flashcards', materialName: d.name, sourceName: d.source, documentContext: d.documentContext || '', itemId: d.id });
    } else if (viewName === 'notes') {
      const n = getNote(id);
      if (n) setAiContext({ materialType: 'notes', materialName: n.name, sourceName: n.source, documentContext: n.documentContext || '', itemId: n.id });
    } else {
      setAiContext(null);
      setAiOpen(false);
    }
  }

  function handleExitMaterial() {
    if (entrySource === 'library' && onNavigateScreen) {
      onNavigateScreen('library');
      return;
    }
    handleNavigate('upload');
  }

  // Render View Routing.
  // Resolve from the resources loaded from the server (which include shared/public
  // items that never touch localStorage) before falling back to the local store.
  // Otherwise opening a shared deck/note finds nothing and drops back to Upload.
  if (subview.view === 'study' && subview.id) {
    const deck = decks.find(d => d.id === subview.id) || getDeck(subview.id);
    if (deck) {
      return (
        <div style={{ height: '100%', position: 'relative' }}>
          <FlashcardStudy deck={deck} onBack={handleExitMaterial} />
          {!aiOpen && <TempoTrigger onClick={() => setAiOpen(true)} />}
          <TempoAssistant context={aiContext} open={aiOpen} onClose={() => setAiOpen(false)} variant="panel" />
        </div>
      );
    }
    if (!resourcesReady) return <MaterialLoading />;
  }

  if (subview.view === 'notes' && subview.id) {
    const note = notes.find(n => n.id === subview.id) || getNote(subview.id);
    if (note) {
      return (
        <div style={{ height: '100%', position: 'relative' }}>
          <NotesView note={note} onBack={handleExitMaterial} />
          {!aiOpen && <TempoTrigger onClick={() => setAiOpen(true)} />}
          <TempoAssistant context={aiContext} open={aiOpen} onClose={() => setAiOpen(false)} variant="panel" />
        </div>
      );
    }
    if (!resourcesReady) return <MaterialLoading />;
  }

  return (
    <div style={{ padding: '24px 28px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) 340px', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <UploadFlow onSessionReady={(view, id) => handleNavigate(view, id)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <TodaysGoal />
        <RecentActivity />
      </div>
    </div>
  );
}

// Sub-component: UploadFlow
function UploadFlow({ onSessionReady }) {
  const { Card, Button, Input } = window.TempoDesignSystem_e112f2;
  const [stage, setStage] = React.useState('upload');
  const [readingMessage, setReadingMessage] = React.useState('Analyzing your document...');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  const [file, setFile] = React.useState(null);
  const [mode, setMode] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const [fcName, setFcName] = React.useState('');
  const [fcCount, setFcCount] = React.useState(20);
  const [fcCustom, setFcCustom] = React.useState('');
  const [fcDiff, setFcDiff] = React.useState('Normal');
  const [fcType, setFcType] = React.useState('Mixed');

  const [noteName, setNoteName] = React.useState('');
  const [noteDetail, setNoteDetail] = React.useState('normal');

  function handleFilePicked(nextFile) {
    if (!nextFile) return;
    setError('');
    setFile(nextFile);
    const rawName = nextFile.name.replace(/\.[^.]+$/, '');
    setFcName(rawName);
    setNoteName(rawName);
    setMode(null);
    setStage('select');
  }

  function handleFileSelect(e) {
    handleFilePicked(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFilePicked(e.dataTransfer.files?.[0]);
  }

  async function triggerGenerateDecks() {
    if (!file) return setError('Please upload a document first');
    if (!fcName.trim()) return toast({ body: 'Hãy đặt tên cho bộ thẻ.', type: 'error' });
    const count = fcCount === -1 ? Math.max(1, parseInt(fcCustom, 10) || 10) : fcCount;

    try {
      setSubmitting(true);
      setError('');
      setReadingMessage('Tempo AI is reading your document and generating flashcards...');
      setStage('reading');
      const payload = await requestGeneratedMaterial('/api/generate/flashcards', {
        file,
        deckName: fcName,
        count: String(count),
        difficulty: fcDiff,
        contentType: fcType,
      });
      addDeck(payload.deck);
      setStage('ready');
      setTimeout(() => {
        onSessionReady('study', payload.deck.id);
        reset();
      }, 800);
    } catch (err) {
      setError(err.message || 'Tempo AI could not generate flashcards.');
      setStage('select');
    } finally {
      setSubmitting(false);
    }
  }

  async function triggerGenerateNotes() {
    if (!file) return setError('Please upload a document first');
    if (!noteName.trim()) return toast({ body: 'Hãy đặt tên cho ghi chú.', type: 'error' });

    try {
      setSubmitting(true);
      setError('');
      setReadingMessage('Tempo AI is reading your document and generating Cornell notes...');
      setStage('reading');
      const payload = await requestGeneratedMaterial('/api/generate/notes', {
        file,
        noteName,
        detail: noteDetail,
      });
      addNote(payload.note);
      setStage('ready');
      setTimeout(() => {
        onSessionReady('notes', payload.note.id);
        reset();
      }, 800);
    } catch (err) {
      setError(err.message || 'Tempo AI could not generate notes.');
      setStage('select');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStage('upload');
    setFile(null);
    setMode(null);
    setFcName('');
    setFcCount(20);
    setFcCustom('');
    setFcDiff('Normal');
    setFcType('Mixed');
    setNoteName('');
    setNoteDetail('normal');
    setReadingMessage('Analyzing your document...');
    setError('');
    setSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <Card padding="md">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px' }}>
        {['Upload', 'Processing', 'Configure', 'Ready'].map((stepName, idx) => {
          const currentStageIdx = ['upload', 'reading', 'select', 'ready'].indexOf(stage);
          const active = idx <= currentStageIdx;
          const stepNames = {
            en: ['Upload', 'Processing', 'Configure', 'Ready'],
            vi: ['Tải lên', 'Xử lý', 'Cấu hình', 'Sẵn sàng']
          };
          const translatedStepName = stepNames[window.currentLanguage || 'en'][idx];
          return (
            <React.Fragment key={stepName}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: active ? 'var(--grad-cta)' : 'var(--surface-3)',
                  color: active ? '#fff' : 'var(--text-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>{idx + 1}</div>
                <span style={{ fontSize: 11.5, color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 600 }}>{translatedStepName}</span>
              </div>
              {idx < 3 && <div style={{ flex: 1, height: 2, background: idx < currentStageIdx ? 'var(--violet-500)' : 'var(--surface-3)' }} />}
            </React.Fragment>
          );
        })}
      </div>

      {stage === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: '2px dashed var(--border-violet)', borderRadius: 'var(--radius-lg)', background: 'rgba(139,92,246,0.03)',
            minHeight: 380, padding: '72px 28px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            transition: 'var(--t-colors)'
          }}
          className="upload-dropzone"
        >
          <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--grad-cta)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-violet-sm)' }}>
            <Icon name="upload" size={30} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>{t('drop_docs_here')}</h4>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 460, lineHeight: 1.5 }}>{t('drop_docs_desc')}</p>
          <Button variant="primary" style={{ marginTop: 10, minWidth: 160, height: 42 }}>{t('choose_file')}</Button>
          <input type="file" ref={fileInputRef} hidden accept=".pdf,.docx,.pptx,.txt,.md" onChange={handleFileSelect} />
        </div>
      )}

      {stage === 'reading' && (
        <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Icon name="loader-2" size={36} style={{ animation: 'spin 2s linear infinite', color: 'var(--violet-400)' }} />
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>{t('processing_doc')}</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {readingMessage.includes('generating flashcards') ? t('reading_flashcards') :
             readingMessage.includes('generating Cornell notes') || readingMessage.includes('generating notes') ? t('reading_notes') :
             t('analyzing_doc')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{file?.name || 'document'}</p>
        </div>
      )}

      {stage === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Icon name="file-text" size={16} style={{ color: 'var(--violet-400)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file?.name || 'Document.pdf'}</span>
            <button onClick={reset} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}><Icon name="x" size={14} /></button>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(240,88,79,0.35)', background: 'rgba(240,88,79,0.08)', color: 'var(--danger-text)', fontSize: 12.5 }}>
              {error}
            </div>
          )}

          {!mode ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div onClick={() => setMode('flashcards')} style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                padding: 24, cursor: 'pointer', transition: 'var(--t-all)'
              }} className="item-card">
                <Icon name="book-open" size={32} style={{ color: 'var(--violet-400)', marginBottom: 16 }} />
                <h4 style={{ fontSize: 16, fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', margin: '0 0 6px' }}>{t('flashcards')}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {window.currentLanguage === 'vi' ? 'Chủ động gợi nhớ, lướt thẻ ghi nhớ, các bộ học tập.' : 'Active recall, swiping cards, study sets.'}
                </p>
              </div>
              <div onClick={() => setMode('notes')} style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                padding: 24, cursor: 'pointer', transition: 'var(--t-all)'
              }} className="item-card">
                <Icon name="notebook-pen" size={32} style={{ color: 'var(--violet-400)', marginBottom: 16 }} />
                <h4 style={{ fontSize: 16, fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', margin: '0 0 6px' }}>{t('notes')}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {window.currentLanguage === 'vi' ? 'Tóm tắt theo phương pháp Cornell, bố cục từ khóa và gợi ý.' : 'Cornell-style summary, keys & cues layout.'}
                </p>
              </div>
            </div>
          ) : mode === 'flashcards' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="book-open" size={15} style={{ color: 'var(--violet-400)' }} /> {t('configure_flashcards')}
                </span>
                <button onClick={() => setMode(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--violet-400)', fontSize: 12, fontWeight: 600 }}>{t('change_method')}</button>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('deck_name')}</label>
                <Input value={fcName} onChange={e => setFcName(e.target.value)} placeholder="e.g. Linear Algebra Ch. 3" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('num_cards')}</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[10, 20, 30].map(n => (
                    <button key={n} onClick={() => setFcCount(n)} style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'var(--t-colors)',
                      border: fcCount === n ? '1px solid var(--violet-500)' : '1px solid var(--border)',
                      background: fcCount === n ? 'rgba(139,92,246,0.12)' : 'var(--surface-2)',
                      color: fcCount === n ? 'var(--violet-300)' : 'var(--text-primary)'
                    }}>{n}</button>
                  ))}
                  <button onClick={() => setFcCount(-1)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'var(--t-colors)',
                    border: fcCount === -1 ? '1px solid var(--violet-500)' : '1px solid var(--border)',
                    background: fcCount === -1 ? 'rgba(139,92,246,0.12)' : 'var(--surface-2)',
                    color: fcCount === -1 ? 'var(--violet-300)' : 'var(--text-primary)'
                  }}>{t('custom')}</button>
                  {fcCount === -1 && (
                    <input type="number" min={1} max={100} value={fcCustom} onChange={e => setFcCustom(e.target.value)} placeholder="Qty" style={{
                      width: 70, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 13, color: '#fff', outline: 'none'
                    }} />
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('difficulty')}</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Easy', 'Normal', 'Hard'].map(d => (
                    <button key={d} onClick={() => setFcDiff(d)} style={{
                      flex: 1, padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'var(--t-colors)',
                      border: fcDiff === d ? '1px solid var(--violet-500)' : '1px solid var(--border)',
                      background: fcDiff === d ? 'rgba(139,92,246,0.12)' : 'var(--surface-2)',
                      color: fcDiff === d ? 'var(--violet-300)' : 'var(--text-primary)'
                    }}>{t(d.toLowerCase()) || d}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{t('content_type')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Multiple choice', desc: window.currentLanguage === 'vi' ? 'Chọn câu trả lời đúng' : 'Pick the right answer' },
                    { label: 'Situation', desc: window.currentLanguage === 'vi' ? 'Trắc nghiệm dựa trên tình huống' : 'Scenario-based MCQs' },
                    { label: 'Mixed', desc: window.currentLanguage === 'vi' ? 'Kết hợp cả hai dạng' : 'Both styles combined' },
                  ].map(option => {
                    const selected = fcType === option.label;
                    return (
                      <button key={option.label} onClick={() => setFcType(option.label)} style={{
                        padding: '12px 12px 10px',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'var(--t-colors)',
                        border: selected ? '1px solid var(--violet-500)' : '1px solid var(--border)',
                        background: selected ? 'rgba(139,92,246,0.12)' : 'var(--surface-2)',
                      }}>
                        <div style={{ color: selected ? 'var(--violet-300)' : 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{t(option.label.toLowerCase().replace(' ', '_')) || option.label}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: 11.5, marginTop: 4, lineHeight: 1.35 }}>{option.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button variant="primary" onClick={triggerGenerateDecks} disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
                {submitting ? t('generating_fc') : t('generate_fc')}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="notebook-pen" size={15} style={{ color: 'var(--violet-400)' }} /> {t('configure_notes')}
                </span>
                <button onClick={() => setMode(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--violet-400)', fontSize: 12, fontWeight: 600 }}>{t('change_method')}</button>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('note_name')}</label>
                <Input value={noteName} onChange={e => setNoteName(e.target.value)} placeholder="e.g. Calculus Chapter 1" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('detail_level')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {['less', 'normal', 'detail'].map(d => (
                    <button key={d} onClick={() => setNoteDetail(d)} style={{
                      padding: '8px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'var(--t-colors)', textTransform: 'capitalize',
                      border: noteDetail === d ? '1px solid var(--violet-500)' : '1px solid var(--border)',
                      background: noteDetail === d ? 'rgba(139,92,246,0.12)' : 'var(--surface-2)',
                      color: noteDetail === d ? 'var(--violet-300)' : 'var(--text-primary)'
                    }}>{d === 'detail' && window.currentLanguage === 'vi' ? 'chi tiết' : t(d)}</button>
                  ))}
                </div>
              </div>

              <Button variant="primary" onClick={triggerGenerateNotes} disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
                {submitting ? t('generating_notes') : t('generate_notes')}
              </Button>
            </div>
          )}
        </div>
      )}

      {stage === 'ready' && (
        <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={24} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>{t('study_room_ready')}</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{t('opening_session')}</p>
        </div>
      )}
    </Card>
  );
}
function FlashcardStudy({ deck: initialDeck, onBack }) {
  const { Button } = window.TempoDesignSystem_e112f2;
  const [deck, setDeck] = React.useState(initialDeck);
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  const [stats, setStats] = React.useState({ known: 0, unknown: 0 });
  const [editing, setEditing] = React.useState(null);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [answerState, setAnswerState] = React.useState(null);
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [swipeDirection, setSwipeDirection] = React.useState(null);
  // When ON (default): swipe-left marks the card as "not known" and advances (current behaviour).
  // When OFF: swipe-left goes back to the previous card instead, without recording progress.
  const [trackingOn, setTrackingOn] = React.useState(true);

  const card = deck.cards[idx];
  const progress = (idx / deck.cards.length) * 100;
  const done = idx >= deck.cards.length;

  function resetCardState() {
    setFlipped(false);
    setSelectedOption(null);
    setAnswerState(null);
    setIsEvaluating(false);
    setSwipeDirection(null);
  }

  function getCorrectOptionText(targetCard) {
    if (!targetCard?.correctOption || !Array.isArray(targetCard.options)) return targetCard?.answer || '';
    const correctIndex = targetCard.correctOption.charCodeAt(0) - 65;
    const optionText = targetCard.options[correctIndex] || '';
    return optionText ? `${targetCard.correctOption}. ${optionText}` : (targetCard.answer || '');
  }

  function goToNextCard() {
    resetCardState();
    setIdx(i => i + 1);
  }

  function goToPrevCard() {
    resetCardState();
    setIdx(i => Math.max(0, i - 1));
  }

  function handleSwipe(dir) {
    if (!card || editing || isEvaluating || swipeDirection) return;
    // Tracking OFF: swipe-left becomes "go back to previous card" (no progress recorded).
    if (dir === 'left' && !trackingOn) {
      if (idx === 0) return; // already at the first card, nothing to go back to
      setSwipeDirection('back');
      window.setTimeout(() => {
        goToPrevCard();
      }, 320);
      return;
    }
    setSwipeDirection(dir);
    setStats(s => dir === 'right' ? { ...s, known: s.known + 1 } : { ...s, unknown: s.unknown + 1 });
    recordStudyCard();
    window.setTimeout(() => {
      goToNextCard();
    }, 320);
  }

  function handleOptionSelect(optionIndex) {
    if (!card || flipped || editing || isEvaluating) return;
    const optionLetter = String.fromCharCode(65 + optionIndex);
    const isCorrect = optionLetter === card.correctOption;

    setSelectedOption(optionLetter);
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    setIsEvaluating(true);

    window.setTimeout(() => {
      setFlipped(true);
      setIsEvaluating(false);
    }, 420);
  }

  React.useEffect(() => {
    function isTypingTarget(target) {
      if (!target || typeof target.closest !== 'function') return false;
      if (target.isContentEditable) return true;
      if (target.closest('input, textarea, [contenteditable="true"]')) return true;
      if (target.closest('aside')) return true;
      return false;
    }

    function onKeyDown(e) {
      if (editing) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setFlipped(prev => !prev);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editing, flipped, card, isEvaluating, swipeDirection, trackingOn, idx]);

  function reset() {
    setIdx(0);
    resetCardState();
    setStats({ known: 0, unknown: 0 });
  }

  function toggleStar(e) {
    e.stopPropagation();
    if (!card) return;
    const next = !card.starred;
    setDeck(d => ({ ...d, cards: d.cards.map(c => c.id === card.id ? { ...c, starred: next } : c) }));
    updateCard(deck.id, card.id, { starred: next });
  }

  function startEdit(e) {
    e.stopPropagation();
    if (!card) return;
    setEditing({
      q: card.question,
      a: getCorrectOptionText(card),
      optionsText: Array.isArray(card.options) ? card.options.join('\n') : '',
      correctOption: card.correctOption || '',
    });
  }

  function saveEdit() {
    if (!card || !editing) return;
    const nextOptions = editing.optionsText
      ? editing.optionsText.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
      : [];
    const patch = {
      question: editing.q,
      answer: editing.a,
      options: nextOptions,
      correctOption: editing.correctOption,
    };
    setDeck(d => ({ ...d, cards: d.cards.map(c => c.id === card.id ? { ...c, ...patch } : c) }));
    updateCard(deck.id, card.id, patch);
    setEditing(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-base)' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-1)'
      }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 500
        }}>
          <Icon name="arrow-left" size={15} /> Back to Learn
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-semibold)', fontSize: 14.5, margin: 0 }}>{deck.name}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 11.5, margin: '2px 0 0' }}>{done ? deck.cards.length : idx + 1} / {deck.cards.length}</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>{stats.known}</span> · <span style={{ color: 'var(--danger-text)', fontWeight: 'bold' }}>{stats.unknown}</span>
        </div>
      </header>

      <div style={{ height: 4, background: 'var(--surface-3)', width: '100%' }}>
        <div style={{ height: '100%', background: 'var(--grad-cta)', transition: 'width 0.3s ease', width: `${done ? 100 : progress}%` }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        {done ? (
          <div style={{ textAlign: 'center', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--grad-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-violet-sm)', color: '#fff' }}>
              <Icon name="check" size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>Session Complete!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
              You mastered <span style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>{stats.known}</span> cards and struggled with <span style={{ color: 'var(--danger-text)', fontWeight: 'bold' }}>{stats.unknown}</span>.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Button variant="primary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="rotate-cw" size={14} /> Study Again</Button>
              <Button variant="secondary" onClick={onBack}>Back to Learn</Button>
            </div>
          </div>
        ) : card && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            <div className={`study-card-shell ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}>
              <div className="card-perspective">
              <div
                className={`card-inner ${flipped ? 'flipped' : ''}`}
                onClick={(e) => {
                  if (editing || isEvaluating) return;
                  if (!flipped && e.target.closest('button')) return;
                  setFlipped(prev => !prev);
                }}
              >
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', gap: 6 }}>
                  <button onClick={toggleStar} style={{
                    width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(18,21,30,0.6)', cursor: 'pointer', color: card.starred ? 'var(--warning-text)' : 'var(--text-tertiary)', transition: 'var(--t-colors)'
                  }}>
                    <Icon name="star" size={14} style={{ fill: card.starred ? 'var(--warning-text)' : 'none' }} />
                  </button>
                  <button onClick={startEdit} style={{
                    width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(18,21,30,0.6)', cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'var(--t-colors)'
                  }}>
                    <Icon name="pencil" size={13} />
                  </button>
                </div>

                <div className="card-front">
                  {editing ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, height: '100%', justifyContent: 'space-between' }} onClick={e => e.stopPropagation()}>
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question</span>
                        <textarea value={editing.q} onChange={e => setEditing({ ...editing, q: e.target.value })} style={{
                          width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', fontSize: 14, padding: 8, outline: 'none', resize: 'none', height: 88, marginTop: 4
                        }} />
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Options (one per line)</span>
                        <textarea value={editing.optionsText} onChange={e => setEditing({ ...editing, optionsText: e.target.value })} style={{
                          width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', fontSize: 14, padding: 8, outline: 'none', resize: 'none', height: 88, marginTop: 4
                        }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correct option</span>
                          <input value={editing.correctOption} onChange={e => setEditing({ ...editing, correctOption: e.target.value.toUpperCase().slice(0, 1) })} style={{
                            width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', fontSize: 14, padding: 8, outline: 'none', marginTop: 4
                          }} />
                        </div>
                        <div>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answer label</span>
                          <input value={editing.a} onChange={e => setEditing({ ...editing, a: e.target.value })} style={{
                            width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', fontSize: 14, padding: 8, outline: 'none', marginTop: 4
                          }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                        <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={saveEdit}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', gap: 18 }}>
                      <div style={{ textAlign: 'center', paddingTop: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 14 }}>Question</span>
                        <div className="flashcard-scroll" style={{ maxHeight: 124, padding: '0 28px' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 20, color: 'var(--text-primary)', margin: 0, lineHeight: 1.38 }}>
                            {card.question}
                          </p>
                        </div>
                      </div>
                      <div className="flashcard-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 8px 0 2px' }}>
                        {Array.isArray(card.options) && card.options.length > 0 && card.options.map((option, optionIndex) => {
                          const optionLetter = String.fromCharCode(65 + optionIndex);
                          const optionState = selectedOption === optionLetter ? answerState : '';
                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              disabled={isEvaluating || flipped}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOptionSelect(optionIndex);
                              }}
                              className={`flashcard-option ${optionState ? `is-${optionState}` : ''}`}
                            >
                              <span className="flashcard-option-label">{optionLetter}.</span>
                              <span className="flashcard-option-text">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', textAlign: 'center' }}>
                        Choose the best answer to reveal the back of the card
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="card-back"
                  style={{
                    background: answerState === 'correct'
                      ? 'linear-gradient(180deg, #0F5132 0%, #0C3B25 100%)'
                      : answerState === 'incorrect'
                        ? 'linear-gradient(180deg, #7A2621 0%, #511814 100%)'
                        : undefined
                  }}
                >
                  <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>Answer</span>
                    <div style={{ margin: '0 auto', maxWidth: 520, width: '100%', padding: '0 20px' }}>
                      <div style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        textAlign: 'left'
                      }}>
                        <span style={{
                          width: 32,
                          minWidth: 32,
                          height: 32,
                          borderRadius: 10,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 800,
                          color: 'var(--text-on-violet)',
                          background: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.16)'
                        }}>
                          {card.correctOption}.
                        </span>
                        <span style={{ fontSize: 17, lineHeight: 1.5, color: 'var(--text-on-violet)', fontWeight: 600 }}>
                          {getCorrectOptionText(card).replace(/^[A-D]\.\s*/, '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {!editing && (
              <div style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={() => setTrackingOn(v => !v)}
                  role="switch"
                  aria-checked={trackingOn}
                  title={window.t('learning_tracking')}
                  style={{
                    position: 'absolute', right: 'calc(50% + 100px)', top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999,
                    background: 'var(--surface-1)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--t-all)'
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {window.t('learning_tracking')}
                  </span>
                  <span style={{
                    position: 'relative', width: 36, height: 20, borderRadius: 999, flexShrink: 0,
                    background: trackingOn ? 'var(--success)' : 'var(--border)', transition: 'var(--t-all)'
                  }}>
                    <span style={{
                      position: 'absolute', top: 2, left: trackingOn ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.25)', transition: 'left 180ms ease'
                    }} />
                  </span>
                </button>
                <button onClick={() => handleSwipe('left')} style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-1)', border: '2px solid rgba(240,88,79,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--t-all)'
                }} className="btn-swipe-left">
                  <Icon name="arrow-left" size={22} style={{ color: 'var(--danger-text)' }} />
                </button>
                <button onClick={() => setFlipped(prev => !prev)} style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-1)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--t-all)'
                }}>
                  <Icon name="rotate-cw" size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button onClick={() => handleSwipe('right')} style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-1)', border: '2px solid rgba(63,209,128,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--t-all)'
                }} className="btn-swipe-right">
                  <Icon name="arrow-right" size={22} style={{ color: 'var(--success-text)' }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function NotesView({ note, onBack }) {
  const { Button } = window.TempoDesignSystem_e112f2;
  const t = window.t;

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-base)' }}>
      {/* Sub Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContext: 'space-between', justifyContent: 'space-between',
        padding: '14px 28px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-1)'
      }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 500
        }}>
          <Icon name="arrow-left" size={15} /> {window.currentLanguage === 'vi' ? 'Quay lại Học tập' : 'Back to Learn'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-semibold)', fontSize: 14.5, margin: 0 }}>{note.name}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 11.5, margin: '2px 0 0' }}>{note.source} · {window.currentLanguage === 'vi' ? 'Định dạng Cornell' : 'Cornell format'}</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="printer" size={14} /> {window.currentLanguage === 'vi' ? 'In' : 'Print'}</Button>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        <div style={{
          maxWidth: 960, margin: '0 auto', background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)'
        }}>
          {/* Header section */}
          <div style={{ background: 'var(--grad-cta)', padding: '24px 32px', color: 'var(--text-on-violet)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 24, margin: 0 }}>{note.name}</h1>
            <p style={{ fontSize: 13, opacity: 0.9, margin: '6px 0 0' }}>{window.currentLanguage === 'vi' ? 'Tóm tắt theo phương pháp Cornell · Tạo bởi Tempo AI' : 'Cornell Method summary · Generated by Tempo AI'}</p>
          </div>

          {/* Two column note body */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 400 }}>
            {/* Left: Cues column */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)', padding: 24 }}>
              <span style={{ font: 'var(--text-eyebrow)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-tertiary)', display: 'block', marginBottom: 20 }}>{window.currentLanguage === 'vi' ? 'Từ khóa & Gợi ý' : 'Cues & Key Terms'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {note.cues.map((c, i) => (
                  <div key={i} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13.5, lineHeight: 1.4 }}>{c}</div>
                ))}
              </div>
            </div>

            {/* Right: Notes column */}
            <div style={{ padding: 24 }}>
              <span style={{ font: 'var(--text-eyebrow)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-tertiary)', display: 'block', marginBottom: 20 }}>{window.currentLanguage === 'vi' ? 'Giải thích & Ghi chép chính' : 'Explanations & Lecture Notes'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {note.notes.map((n, i) => (
                  <div key={i} style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.5 }}>{n}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 28, background: 'rgba(0,0,0,0.1)' }}>
            <span style={{ font: 'var(--text-eyebrow)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-tertiary)', display: 'block', marginBottom: 10 }}>{window.currentLanguage === 'vi' ? 'Tóm tắt' : 'Summary'}</span>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{note.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: TodaysGoal
function TodaysGoal() {
  const { Card } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const [stats, setStats] = React.useState(() => readStudyStats());

  React.useEffect(() => {
    setStats(readStudyStats());
  }, []);

  const streak = stats.streak || 0;
  const studied = stats.studiedToday || 0;
  const target = 20;
  const pct = Math.min(100, (studied / target) * 100);
  const r = 38, size = 100, thick = 8;
  const c = 2 * Math.PI * r;

  return (
    <Card padding="md">
      <h3 style={{ font: 'var(--text-h3)', fontSize: 16, color: 'var(--text-primary)', margin: '0 0 12px' }}>{t('todays_goal')}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: size, height: size, flex: `0 0 ${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thick} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--violet-400)" strokeWidth={thick} strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="flame" size={28} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: -20, textAlign: 'center', color: 'var(--warning-text)', fontWeight: 700, fontSize: 11.5 }}>
            {window.currentLanguage === 'vi' ? `${streak} ngày liên tục` : `${streak}-day streak`}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12.5 }}>{t('cards_reviewed')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>{studied}</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 16, fontWeight: 600 }}>/ {target}</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 12, marginLeft: 2 }}>{t('cards_count')}</span>
          </div>
          <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden', marginTop: 14 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--grad-cta)' }} />
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 11.5, marginTop: 6 }}>
            {window.currentLanguage === 'vi' ? `${Math.round(pct)}% mục tiêu ngày` : `${Math.round(pct)}% of daily goal`}
          </div>
        </div>
      </div>
    </Card>
  );
}
function RecentActivity() {
  const { Card } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const [recent, setRecent] = React.useState([]);
  const [langToken, setLangToken] = React.useState(0);

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(tok => tok + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const tones = {
    green: { bg: 'rgba(63,209,128,0.12)', fg: 'var(--success-text)' },
    violet: { bg: 'rgba(139,92,246,0.12)', fg: 'var(--violet-300)' },
    blue: { bg: 'rgba(91,157,248,0.12)', fg: 'var(--info-text)' },
    amber: { bg: 'rgba(246,178,60,0.12)', fg: 'var(--warning-text)' }
  };

  React.useEffect(() => {
    const deckEvents = getDecks().map(deck => ({
      id: deck.id,
      createdAt: deck.createdAt,
      icon: 'layers',
      tone: 'violet',
      label: window.currentLanguage === 'vi' ? 'Đã tạo bộ thẻ ghi nhớ' : 'Created flashcards',
      body: deck.name,
      when: formatRelativeTime(deck.createdAt),
    }));
    const noteEvents = getNotes().map(note => ({
      id: note.id,
      createdAt: note.createdAt,
      icon: 'notebook-pen',
      tone: 'blue',
      label: window.currentLanguage === 'vi' ? 'Đã tạo Cornell note' : 'Created notes',
      body: note.name,
      when: formatRelativeTime(note.createdAt),
    }));
    setRecent([...deckEvents, ...noteEvents].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5));
  }, [langToken]);

  return (
    <Card padding="md">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon name="history" size={16} style={{ color: 'var(--text-secondary)' }} />
        <h3 style={{ font: 'var(--text-h3)', fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>{t('recent_activity')}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {recent.length === 0 && <div style={{ color: 'var(--text-tertiary)', fontSize: 12.5 }}>{window.currentLanguage === 'vi' ? 'Chưa có hoạt động nào. Hãy tạo bộ thẻ hoặc ghi chú đầu tiên để hiển thị ở đây.' : 'No activity yet. Generate your first deck or note to see it here.'}</div>}
        {recent.map((a, i) => {
          const tc = tones[a.tone] || tones.violet;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 28, height: 28, flex: '0 0 28px', borderRadius: '50%',
                background: tc.bg, color: tc.fg,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${tc.fg}33`
              }}>
                <Icon name={a.icon} size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.35 }}>
                  <span style={{ fontWeight: 700 }}>{a.label}:</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{a.body}</span>
                </div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11.5, marginTop: 2 }}>{a.when}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
function TempoTrigger({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 40, width: 56, height: 56, borderRadius: '50%',
        background: 'var(--surface-1)', border: '1px solid rgba(139,92,246,0.4)', shadowBox: 'var(--glow-violet-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none'
      }}
      className="floating-ai-trigger"
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="../../assets/logo.png" alt="Tempo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </button>
  );
}

// Sub-component: TempoAssistant
function TempoAssistant({ context, open, onClose, variant }) {
  const { Button } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const [input, setInput] = React.useState('');
  const [msgs, setMsgs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [langToken, setLangToken] = React.useState(0);

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(tok => tok + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  React.useEffect(() => {
    setMsgs([
      {
        role: 'ai',
        text: context?.materialName
          ? (window.currentLanguage === 'vi' 
              ? `Tôi đang tập trung vào "${context.materialName}". Hỏi tôi bất kỳ điều gì từ tài liệu này.` 
              : `I'm focused on "${context.materialName}". Ask me anything from this document.`)
          : (window.currentLanguage === 'vi' 
              ? 'Xin chào, tôi là Tempo. Hãy mở một bộ thẻ ghi nhớ hoặc ghi chú để tôi trả lời từ tài liệu nguồn.' 
              : 'Hi, I’m Tempo. Open a flashcard set or note and I’ll answer from its document.')
      }
    ]);
    setInput('');
  }, [context?.itemId, langToken]);

  async function send() {
    if (!input.trim()) return;
    const question = input.trim();
    setMsgs(m => [...m, { role: 'user', text: question }]);
    setInput('');

    if (!context?.documentContext && !context?.itemId) {
      setMsgs(m => [...m, { role: 'ai', text: window.currentLanguage === 'vi' ? 'Tôi cần tài liệu nguồn từ một bộ thẻ hoặc ghi chú được tạo trước khi trả lời.' : 'I need document context from a generated flashcard set or note before I can answer.' }]);
      return;
    }

    setLoading(true);

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          question,
          documentContext: context.documentContext,
          materialType: context.materialType,
          materialName: context.materialName,
          sourceName: context.sourceName,
          resourceId: context.itemId
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload && payload.code === 'PLAN_LIMIT') {
          window.dispatchEvent(new CustomEvent('tempo:paywall', { detail: payload }));
        }
        throw new Error(payload.error || (window.currentLanguage === 'vi' ? 'Tempo AI không thể trả lời lúc này.' : 'Tempo AI could not answer right now.'));
      }

      setMsgs(m => [...m, { role: 'ai', text: payload.answer || (window.currentLanguage === 'vi' ? 'Tôi không tìm thấy câu trả lời trong tài liệu.' : 'I could not find an answer in the document.') }]);
    } catch (error) {
      setMsgs(m => [...m, { role: 'ai', text: error.message || (window.currentLanguage === 'vi' ? 'Tempo AI không thể trả lời lúc này.' : 'Tempo AI could not answer right now.') }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <aside style={{
      position: 'fixed', right: 0, top: 64, bottom: 0, zIndex: 30, width: 384, maxWidth: '100%',
      background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      boxShadow: 'var(--shadow-lg)', animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-sunken)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="../../assets/logo.png" alt="Tempo Logo" style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'cover' }} />
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-bold)', fontSize: 14.5, margin: 0 }}>Tempo AI</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 11, margin: 0 }}>
              {context?.materialType === 'notes' 
                ? (window.currentLanguage === 'vi' ? 'Hỏi từ tài liệu ghi chú Cornell' : 'Asking from your note source') 
                : (window.currentLanguage === 'vi' ? 'Hỏi từ tài liệu thẻ ghi nhớ' : 'Asking from your flashcard source')}
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 6 }}><Icon name="x" size={14} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: '16px', fontSize: 13, lineHeight: 1.45,
              background: m.role === 'user' ? 'var(--grad-cta)' : 'var(--surface-2)',
              color: m.role === 'user' ? 'var(--text-on-violet)' : 'var(--text-primary)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: '16px', fontSize: 13, lineHeight: 1.45,
              background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)'
            }}>{window.currentLanguage === 'vi' ? 'Đang suy nghĩ...' : 'Thinking...'}</div>
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, background: 'var(--bg-sunken)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={window.currentLanguage === 'vi' ? 'Hỏi Tempo bất kỳ điều gì...' : 'Ask Tempo anything...'}
          style={{
            flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', transition: 'var(--t-colors)'
          }}
        />
        <Button variant="primary" onClick={send} disabled={loading} style={{ padding: '0 14px' }}><Icon name="send" size={14} /></Button>
      </div>
    </aside>
  );
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-learn-general-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-learn-general-css';
  s.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .item-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-strong) !important;
      box-shadow: var(--glow-violet-sm) !important;
    }
    .upload-dropzone:hover {
      border-color: var(--violet-400) !important;
      background: rgba(139,92,246,0.05) !important;
    }
    .btn-swipe-left:hover {
      background: rgba(240,88,79,0.12) !important;
      border-color: var(--danger) !important;
    }
    .btn-swipe-right:hover {
      background: rgba(63,209,128,0.12) !important;
      border-color: var(--success) !important;
    }
    .floating-ai-trigger:hover {
      transform: scale(1.1);
      box-shadow: var(--glow-violet) !important;
    }
    .floating-ai-trigger:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { LearnScreen });

})();




