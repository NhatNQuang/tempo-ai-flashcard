// Tempo UI kit - Library (Notes / Flashcards / Study Spaces)
if (typeof document !== 'undefined' && !document.getElementById('tempo-star-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-star-css';
  s.textContent = `.tempo-star-fav svg { fill: var(--warning); color: var(--warning); }`;
  document.head.appendChild(s);
}

const FC_TONES = {
  violet: { bg: 'rgba(139,92,246,0.16)', fg: 'var(--violet-300)' },
  blue: { bg: 'rgba(91,157,248,0.16)', fg: 'var(--info-text)' },
  green: { bg: 'rgba(63,209,128,0.16)', fg: 'var(--success-text)' },
  amber: { bg: 'rgba(246,178,60,0.16)', fg: 'var(--warning-text)' },
};

const DECKS_KEY = 'tempo:decks';
const NOTES_KEY = 'tempo:notes';

function readCollection(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSortTimestamp(item) {
  return Number(item.lastUsedAt || item.createdAt || 0);
}

function compareResources(a, b) {
  if (!!b.fav !== !!a.fav) return Number(!!b.fav) - Number(!!a.fav);
  const timeDelta = getSortTimestamp(b) - getSortTimestamp(a);
  if (timeDelta !== 0) return timeDelta;
  return String(a.title || '').localeCompare(String(b.title || ''));
}

function sortResources(items) {
  return [...items].sort(compareResources);
}

function sortRecordEntries(items) {
  return [...items].sort((a, b) => {
    if (!!b.fav !== !!a.fav) return Number(!!b.fav) - Number(!!a.fav);
    const timeDelta = Number(b.lastUsedAt || b.createdAt || 0) - Number(a.lastUsedAt || a.createdAt || 0);
    if (timeDelta !== 0) return timeDelta;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function formatLibraryTime(timestamp) {
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

function getDeckTone(contentType) {
  if (contentType === 'Situation') return 'amber';
  if (contentType === 'Mixed') return 'blue';
  return 'violet';
}

function toFlashcardItem(deck) {
  return {
    id: deck.id,
    title: deck.name,
    icon: deck.contentType === 'Situation' ? 'briefcase' : deck.contentType === 'Mixed' ? 'layers' : 'circle-help',
    tone: getDeckTone(deck.contentType),
    cardsCount: Array.isArray(deck.cards) ? deck.cards.length : Number(deck.count) || 0,
    studied: 0,
    status: deck.contentType || 'Multiple choice',
    when: formatLibraryTime(deck.createdAt),
    source: deck.source,
    difficulty: deck.difficulty,
    fav: !!deck.fav,
    createdAt: deck.createdAt,
    lastUsedAt: deck.lastUsedAt,
  };
}

function toNoteItem(note) {
  return {
    id: note.id,
    title: note.name,
    desc: note.summary,
    pages: Array.isArray(note.notes) ? note.notes.length : 0,
    edited: formatLibraryTime(note.createdAt),
    source: note.source,
    detail: note.detail,
    fav: !!note.fav,
    createdAt: note.createdAt,
    lastUsedAt: note.lastUsedAt,
  };
}

function LibraryScreen({ onOpenResource }) {
  const { Card, Tabs, Chip, IconButton, Button, Badge } = window.TempoDesignSystem_e112f2;
  const [tab, setTab] = React.useState('flashcards');
  const [filter, setFilter] = React.useState('All');
  const [deckRecords, setDeckRecords] = React.useState([]);
  const [noteRecords, setNoteRecords] = React.useState([]);
  const [deleted, setDeleted] = React.useState(() => new Set());
  const [menuTarget, setMenuTarget] = React.useState(null);
  const [menuPos, setMenuPos] = React.useState({ top: 0, right: 0 });
  const [shareTarget, setShareTarget] = React.useState(null);
  const [publicTarget, setPublicTarget] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState(null); // { type: 'success'|'error', text }
  const [langToken, setLangToken] = React.useState(0);

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const t = window.t;

  React.useEffect(() => {
    async function loadLibrary() {
      if (window.supabaseClient) {
        try {
          const { data: { session } } = await window.supabaseClient.auth.getSession();
          if (session) {
            const authHeaders = {};
            if (session.access_token) {
              authHeaders['Authorization'] = `Bearer ${session.access_token}`;
            }
            const response = await fetch('/api/v1/library/resources', {
              headers: authHeaders
            });
            const resJson = await response.json();
            if (resJson.success && resJson.data?.resources) {
              const resources = resJson.data.resources;
              const fetchedDecks = [];
              const fetchedNotes = [];

              // The list endpoint already includes the lightweight metadata needed for
              // the cards (count/difficulty/type/summary), so no per-resource detail
              // fetch is required here — full cards/blocks load when a item is opened.
              for (const resItem of resources) {
                if (resItem.type === 'flashcard_set') {
                  fetchedDecks.push({
                    id: resItem.id,
                    name: resItem.title,
                    count: resItem.flashcard_set?.card_count || 0,
                    difficulty: window.difficultyFromEnum(resItem.flashcard_set?.difficulty),
                    contentType: window.contentTypeFromEnum(resItem.flashcard_set?.content_type),
                    source: resItem.title,
                    createdAt: new Date(resItem.created_at).getTime(),
                    fav: !!resItem.favorite,
                    visibility: resItem.visibility
                  });
                } else if (resItem.type === 'cornell_note') {
                  fetchedNotes.push({
                    id: resItem.id,
                    name: resItem.title,
                    summary: resItem.note?.summary || '',
                    source: resItem.title,
                    createdAt: new Date(resItem.created_at).getTime(),
                    fav: !!resItem.favorite,
                    visibility: resItem.visibility
                  });
                }
              }
              setDeckRecords(sortRecordEntries(fetchedDecks));
              setNoteRecords(sortRecordEntries(fetchedNotes));
              return;
            }
          }
        } catch (e) {
          console.error('Failed to load library resources from Supabase:', e);
        }
      }
      setDeckRecords(sortRecordEntries(readCollection(DECKS_KEY)));
      setNoteRecords(sortRecordEntries(readCollection(NOTES_KEY)));
    }
    loadLibrary();
  }, []);

  React.useEffect(() => {
    if (menuTarget == null) return;
    const onDoc = (e) => { if (!e.target.closest('[data-menu-root]')) setMenuTarget(null); };
    const onKey = (e) => { if (e.key === 'Escape') setMenuTarget(null); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuTarget]);

  React.useEffect(() => {
    if (!window.lucide) return;
    requestAnimationFrame(() => window.lucide.createIcons());
  }, [tab, deckRecords, noteRecords]);

  const flashcards = sortResources(deckRecords.map(toFlashcardItem).filter(item => !deleted.has(`flashcards:${item.id}`)));
  const notes = sortResources(noteRecords.map(toNoteItem).filter(item => !deleted.has(`notes:${item.id}`)));
  const isFlash = tab === 'flashcards';
  const isSpaces = tab === 'spaces';
  const PAGE = isFlash ? 12 : 9;
  const COLS = isFlash ? 4 : 3;
  const rawItems = isFlash ? flashcards : notes;
  const filteredItems = rawItems.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Recent') return true;
    if (filter === 'Starred') return item.fav;
    if (isFlash && filter === 'Studying') return item.status === 'Mixed';
    if (isFlash && ['Multiple choice', 'Situation', 'Mixed'].includes(filter)) return item.status === filter;
    return true;
  });
  const items = filteredItems.slice(0, PAGE);
  const total = filteredItems.length;
  const noun = isFlash ? t('flashcards').toLowerCase() : t('notes').toLowerCase();
  const filterChips = isFlash ? ['All', 'Recent', 'Multiple choice', 'Situation', 'Mixed', 'Starred'] : ['All', 'Recent', 'Starred'];
  const filterAllLabel = `${t('all')} (${total})`;

  const toggleFav = async (type, id) => {
    const isFlash = type === 'flashcards';
    const records = isFlash ? deckRecords : noteRecords;
    const item = records.find(r => r.id === id);
    if (!item) return;
    const nextFav = !item.fav;

    if (window.supabaseClient) {
      try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
          const authHeaders = {};
          if (session.access_token) {
            authHeaders['Authorization'] = `Bearer ${session.access_token}`;
            authHeaders['Content-Type'] = 'application/json';
          }
          await fetch(`/api/v1/library/resources/${id}`, {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify({ favorite: nextFav })
          });
        }
      } catch (e) {
        console.error('Failed to update favorite status on server:', e);
      }
    }

    if (isFlash) {
      const next = sortRecordEntries(deckRecords.map(deck => deck.id === id ? { ...deck, fav: nextFav } : deck));
      setDeckRecords(next);
      writeCollection(DECKS_KEY, next);
    } else {
      const next = sortRecordEntries(noteRecords.map(note => note.id === id ? { ...note, fav: nextFav } : note));
      setNoteRecords(next);
      writeCollection(NOTES_KEY, next);
    }
  };

  const openMenu = (e, type, id) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    const sameAsOpen = menuTarget && menuTarget.type === type && menuTarget.id === id;
    setMenuTarget(sameAsOpen ? null : { type, id });
  };

  const resolveItem = (target) => {
    if (!target) return null;
    return target.type === 'flashcards'
      ? flashcards.find(item => item.id === target.id)
      : notes.find(item => item.id === target.id);
  };

  const entityName = (target) => target && target.type === 'flashcards' ? t('flashcards').toLowerCase() : t('notes').toLowerCase();

  const handleDelete = async (target) => {
    if (!target) return;

    if (window.supabaseClient) {
      try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
          const authHeaders = {};
          if (session.access_token) {
            authHeaders['Authorization'] = `Bearer ${session.access_token}`;
          }
          await fetch(`/api/v1/library/resources/${target.id}`, {
            method: 'DELETE',
            headers: authHeaders
          });
        }
      } catch (e) {
        console.error('Failed to delete resource on server:', e);
      }
    }

    if (target.type === 'flashcards') {
      const next = sortRecordEntries(deckRecords.filter(deck => deck.id !== target.id));
      setDeckRecords(next);
      writeCollection(DECKS_KEY, next);
    } else {
      const next = sortRecordEntries(noteRecords.filter(note => note.id !== target.id));
      setNoteRecords(next);
      writeCollection(NOTES_KEY, next);
    }
    setDeleted(prev => new Set(prev).add(`${target.type}:${target.id}`));
  };

  const handleConfirmPublic = async (target, policy) => {
    const vi = window.currentLanguage === 'vi';
    let ok = false;
    let errMsg = '';
    if (window.supabaseClient) {
      try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
          const authHeaders = {};
          if (session.access_token) {
            authHeaders['Authorization'] = `Bearer ${session.access_token}`;
            authHeaders['Content-Type'] = 'application/json';
          }
          const response = await fetch(`/api/v1/library/resources/${target.id}/publish`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              document_access_policy: policy
            })
          });
          const resJson = await response.json();
          if (resJson.success) {
            ok = true;
            if (target.type === 'flashcards') {
              setDeckRecords(prev => prev.map(d => d.id === target.id ? { ...d, visibility: 'public' } : d));
            } else {
              setNoteRecords(prev => prev.map(n => n.id === target.id ? { ...n, visibility: 'public' } : n));
            }
          } else {
            errMsg = resJson.error?.message || '';
          }
        }
      } catch (e) {
        console.error('Failed to publish resource:', e);
        errMsg = e.message;
      }
    }
    setToast(ok
      ? { type: 'success', text: vi ? 'Đã công khai! Hiện có thể tìm thấy trong tab Khám phá.' : 'Published! It can now be found in the Explore tab.' }
      : { type: 'error', text: (vi ? 'Công khai thất bại. ' : 'Failed to publish. ') + errMsg });
    setTimeout(() => setToast(null), 4000);
    setPublicTarget(null);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', padding: '16px 28px 16px', boxSizing: 'border-box' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000, maxWidth: 380,
          background: toast.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)', color: '#fff',
          padding: '12px 18px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, fontSize: 13.5
        }}>
          <Icon name={toast.type === 'success' ? 'check-circle' : 'alert-circle'} size={17} />
          {toast.text}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flex: '0 0 auto' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tabs value={tab} onChange={setTab} items={[
            { id: 'flashcards', label: t('flashcards'), count: flashcards.length },
            { id: 'notes', label: t('notes'), count: notes.length },
            { id: 'spaces', label: t('study_spaces') },
          ]} />
        </div>
        <Button variant="primary" size="sm" iconLeft={<Icon name="upload" size={15} />} onClick={() => onOpenResource && onOpenResource({ view: 'upload', id: 'new' })}>{t('upload')}</Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flex: '0 0 auto' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filterChips.map(f => (
            <Chip key={f} size="sm" selected={filter === f} onClick={() => setFilter(f)}>
              {f === 'All' ? filterAllLabel : (t(f.toLowerCase().replace(' ', '_')) || f)}
            </Chip>
          ))}
        </div>
      </div>

      {isSpaces ? (
        <SpacesPlaceholder />
      ) : (
        <React.Fragment>
          <div
            key={tab}
            className="workspace-container"
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <div
              className="flashcards-grid"
              style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 12, height: 'auto' }}
            >
              {items.length === 0 && (
                <Card style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', minHeight: 180, padding: 24, textAlign: 'center' }}>
                  {isFlash ? t('no_flashcards_yet') : t('no_notes_yet')}
                </Card>
              )}
              {items.map(item => isFlash
                ? <FlashcardCard key={item.id} card={item} isFav={item.fav} onToggleFav={() => toggleFav('flashcards', item.id)} onMenu={(e) => openMenu(e, 'flashcards', item.id)} onOpen={() => onOpenResource && onOpenResource({ view: 'study', id: item.id })} />
                : <NoteCard key={item.id} note={item} isFav={item.fav} onToggleFav={() => toggleFav('notes', item.id)} onMenu={(e) => openMenu(e, 'notes', item.id)} onOpen={() => onOpenResource && onOpenResource({ view: 'notes', id: item.id })} />)}
            </div>

            <div className="spacer" style={{ flexGrow: 1 }} />

            <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 0', flex: '0 0 auto' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                {window.currentLanguage === 'vi' 
                  ? `Hiển thị 1-${Math.min(PAGE, total)} trong số ${total} ${noun}`
                  : `1-${Math.min(PAGE, total)} of ${total} ${noun}`
                }
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconButton label="Prev" size="sm" variant="solid"><Icon name="chevron-left" size={15} /></IconButton>
                <span style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, background: 'var(--violet-500)', color: '#fff' }}>1</span>
                <IconButton label="Next" size="sm" variant="solid"><Icon name="chevron-right" size={15} /></IconButton>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}

      {menuTarget && ReactDOM.createPortal(
        <OverflowMenu pos={menuPos}
          onPick={(action) => {
            if (action === 'share') setShareTarget(menuTarget);
            else if (action === 'public') setPublicTarget(menuTarget);
            else if (action === 'delete') setDeleteTarget(menuTarget);
            setMenuTarget(null);
          }} />,
        document.body
      )}

      {shareTarget && <ShareDialog item={resolveItem(shareTarget)} noun={entityName(shareTarget)} onClose={() => setShareTarget(null)} />}
      {publicTarget && <PublicDialog item={resolveItem(publicTarget)} noun={entityName(publicTarget)} onClose={() => setPublicTarget(null)} onConfirm={(policy) => handleConfirmPublic(publicTarget, policy)} />}
      {deleteTarget && <DeleteConfirm item={resolveItem(deleteTarget)} noun={entityName(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          handleDelete(deleteTarget);
          setDeleteTarget(null);
        }} />}
    </div>
  );
}

function NoteCard({ note, isFav, onToggleFav, onMenu, onOpen }) {
  const { Card, Badge } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  return (
    <Card interactive padding="none" onClick={onOpen} style={{ display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer' }}>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-tertiary)', fontSize: 11.5, minWidth: 0 }}>
            <Icon name="file-text" size={13} color="var(--info-text)" />
            <span style={{ whiteSpace: 'nowrap' }}>{note.source}</span>
          </div>
          <CardActions isFav={isFav} onToggleFav={onToggleFav} onMenu={onMenu} />
        </div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, margin: '2px 0 0',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.45, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <Badge tone="neutral" uppercase size="sm">{t(note.detail?.toLowerCase()) || note.detail}</Badge>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{t('edited')} {note.edited}</span>
        </div>
      </div>
    </Card>
  );
}

function FlashcardCard({ card, isFav, onToggleFav, onMenu, onOpen }) {
  const { Card, Badge } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const tone = FC_TONES[card.tone] || FC_TONES.violet;

  return (
    <Card interactive padding="none" onClick={onOpen} style={{ display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer' }}>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{
            width: 36, height: 36, flex: '0 0 36px',
            borderRadius: 'var(--radius-md)',
            background: tone.bg, color: tone.fg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={card.icon} size={18} />
          </span>
          <h3 style={{ flex: 1, color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, lineHeight: 1.25,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{card.title}</h3>
          <CardActions isFav={isFav} onToggleFav={onToggleFav} onMenu={onMenu} compact />
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: 12.5 }}>
          {card.cardsCount} {t('cards_count')} · {t(card.difficulty?.toLowerCase()) || card.difficulty}
        </div>

        <div>
          <Badge tone="neutral" uppercase size="sm">{t(card.status?.toLowerCase().replace(' ', '_')) || card.status}</Badge>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 6 }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>{card.when}</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>{card.source}</span>
        </div>
      </div>
    </Card>
  );
}

function CardActions({ isFav, onToggleFav, onMenu, compact = false }) {
  const t = window.t;
  return (
    <div data-menu-root style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: -4, marginTop: -2, flex: '0 0 auto' }}>
      <button onClick={(e) => { e.stopPropagation(); onToggleFav(); }} title={isFav ? 'Unfavorite' : 'Favorite'}
        className={isFav ? 'tempo-star-fav' : ''}
        style={{ width: compact ? 22 : 24, height: compact ? 22 : 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', color: isFav ? 'var(--warning)' : 'var(--text-tertiary)' }}>
        <Icon name="star" size={14} />
      </button>
      <button onClick={onMenu} title="More"
        style={{ width: compact ? 22 : 24, height: compact ? 22 : 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--text-tertiary)' }}>
        <Icon name="more-vertical" size={14} />
      </button>
    </div>
  );
}

function SpacesPlaceholder() {
  const t = window.t;
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-tertiary)' }}>
      <span style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'rgba(139,92,246,0.14)', color: 'var(--violet-300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="library" size={26} /></span>
      <div style={{ font: 'var(--text-h3)', color: 'var(--text-secondary)' }}>{t('study_spaces')}</div>
      <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 400 }}>{window.currentLanguage === 'vi' ? 'Sử dụng Học tập để tạo tài liệu thực tế từ các file tải lên.' : 'Use Learn to generate real materials from uploaded documents.'}</p>
    </div>
  );
}

function OverflowMenu({ pos, onPick }) {
  const t = window.t;
  const items = [
    { id: 'share', icon: 'share-2', label: t('share') },
    { id: 'public', icon: 'globe', label: t('make_public') },
  ];
  const rowStyle = (danger) => ({
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
    color: danger ? 'var(--danger-text)' : 'var(--text-primary)',
    fontSize: 13, fontWeight: danger ? 700 : 500, cursor: 'pointer', textAlign: 'left',
  });
  return (
    <div data-menu-root role="menu" style={{
      position: 'fixed', top: pos.top, right: pos.right, zIndex: 200,
      width: 210, padding: 6,
      background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
    }}>
      {items.map((it) => (
        <button key={it.id} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPick(it.id); }}
          style={rowStyle(false)}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name={it.icon} size={15} color="var(--text-secondary)" />
          {it.label}
        </button>
      ))}
      <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
      <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPick('delete'); }}
        style={rowStyle(true)}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(240,88,79,0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Icon name="trash-2" size={15} color="var(--danger-text)" />
        {t('delete_btn')}
      </button>
    </div>
  );
}

function friendlyShareError(code) {
  const vi = window.currentLanguage === 'vi';
  switch (code) {
    case 'USER_NOT_FOUND': return vi ? 'không tìm thấy người dùng' : 'user not found';
    case 'CANNOT_SHARE_SELF': return vi ? 'không thể chia sẻ với chính bạn' : "can't share with yourself";
    case 'NOT_OWNER': return vi ? 'bạn không sở hữu tài nguyên này' : 'you do not own this resource';
    case 'RESOURCE_NOT_FOUND': return vi ? 'không tìm thấy tài nguyên' : 'resource not found';
    default: return code;
  }
}

function ShareDialog({ item, noun, onClose }) {
  const { Button, Input, Switch } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const vi = window.currentLanguage === 'vi';
  const [identifiers, setIdentifiers] = React.useState('');
  const [withDoc, setWithDoc] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState(null); // { type: 'success'|'error', text }

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleShare = async () => {
    const list = identifiers.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length === 0) {
      setFeedback({ type: 'error', text: vi ? 'Nhập email hoặc tên người dùng.' : 'Enter an email or username.' });
      return;
    }
    if (!window.supabaseClient) return;
    setLoading(true);
    setFeedback(null);
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      const res = await fetch(`/api/v1/resources/${item.id}/shares`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiers: list, permission: 'viewer', share_with_document: withDoc })
      });
      const rawBody = await res.text();
      let json;
      try {
        json = JSON.parse(rawBody);
      } catch {
        // Non-JSON (e.g. an HTML 404 page) means the share endpoint isn't reachable —
        // usually a stale API container that predates the sharing route.
        throw new Error(vi
          ? 'Tính năng chia sẻ chưa khả dụng trên máy chủ. Hãy triển khai lại API và áp dụng migration.'
          : 'Sharing is not available on the server yet. Redeploy the API and apply the latest migration.');
      }
      const shares = json.data?.shares || [];
      const errors = json.data?.errors || [];
      if (shares.length > 0) {
        const names = shares.map(s => s.target_name || s.target_email).join(', ');
        let text = vi ? `Đã chia sẻ với ${names}.` : `Shared with ${names}.`;
        if (errors.length) text += ' ' + errors.map(e => `${e.identifier}: ${friendlyShareError(e.error)}`).join('; ');
        setFeedback({ type: 'success', text });
        setIdentifiers('');
        setTimeout(onClose, 1400);
      } else {
        const text = errors.length
          ? errors.map(e => `${e.identifier}: ${friendlyShareError(e.error)}`).join('; ')
          : (vi ? 'Chia sẻ thất bại.' : 'Share failed.');
        setFeedback({ type: 'error', text });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(4,6,11,0.65)', backdropFilter: 'var(--blur-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{
        width: 420, background: 'var(--surface-1)',
        border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)', padding: 22,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
          <div>
            <h3 style={{ font: 'var(--text-h3)', fontSize: 18, color: 'var(--text-primary)' }}>{t('share')} {noun}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{item?.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 600, margin: '16px 0 6px' }}>
          {vi ? 'Thêm người bằng email hoặc tên người dùng' : 'Add people by email or username'}
        </label>
        <Input iconLeft={<Icon name="user-plus" size={15} />} placeholder={vi ? 'email hoặc tên người dùng, ...' : 'email or username, ...'} value={identifiers} onChange={(e) => setIdentifiers(e.target.value)} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer' }}>
          <Switch checked={withDoc} onChange={setWithDoc} />
          <span style={{ color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 500 }}>{t('share_with_doc')}</span>
        </label>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 11.5, margin: '6px 0 0', lineHeight: 1.4 }}>
          {vi
            ? 'Khi bật, người nhận có thể dùng Trợ lý AI với tài liệu nguồn.'
            : 'When on, the recipient can use the AI Assistant with the source document.'}
        </p>

        {feedback && (
          <div style={{
            marginTop: 14, padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: 12.5, lineHeight: 1.45,
            background: feedback.type === 'success' ? 'rgba(63,209,128,0.12)' : 'rgba(240,88,79,0.12)',
            color: feedback.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(63,209,128,0.3)' : 'rgba(240,88,79,0.3)'}`
          }}>{feedback.text}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="primary" loading={loading} iconLeft={<Icon name="send" size={15} />} onClick={handleShare}>{t('share')}</Button>
        </div>
      </div>
    </div>
  );
}

function PublicDialog({ item, noun, onClose, onConfirm }) {
  const { Button } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const [pick, setPick] = React.useState('with-doc');

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const Option = ({ id, icon, title, desc }) => {
    const on = pick === id;
    return (
      <button onClick={() => setPick(id)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%',
          padding: 14, textAlign: 'left', cursor: 'pointer',
          background: on ? 'rgba(139,92,246,0.10)' : 'var(--surface-2)',
          border: `1px solid ${on ? 'var(--violet-500)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
        }}>
        <span style={{ width: 34, height: 34, flex: '0 0 34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', background: on ? 'rgba(139,92,246,0.20)' : 'var(--surface-3)', color: on ? 'var(--violet-300)' : 'var(--text-secondary)' }}>
          <Icon name={icon} size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600 }}>{title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 3, lineHeight: 1.45 }}>{desc}</div>
        </div>
      </button>
    );
  };

  const optionTitle1 = t('public_with_doc');
  const optionTitle2 = t('only_public_set');

  const handleConfirm = () => {
    const policy = pick === 'with-doc' ? 'with_document' : 'resource_only';
    if (onConfirm) onConfirm(policy);
  };

  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(4,6,11,0.65)', backdropFilter: 'var(--blur-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{
        width: 460, background: 'var(--surface-1)',
        border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)', padding: 22,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
          <div>
            <h3 style={{ font: 'var(--text-h3)', fontSize: 18, color: 'var(--text-primary)' }}>{t('make_public')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{item?.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          <Option id="with-doc" icon="globe" title={optionTitle1} desc={t('public_with_doc_desc')} />
          <Option id="note-only" icon="file-lock" title={optionTitle2} desc={t('only_public_set_desc')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="primary" iconLeft={<Icon name="globe" size={15} />} onClick={handleConfirm}>{t('make_public')}</Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ item, noun, onCancel, onConfirm }) {
  const { Button } = window.TempoDesignSystem_e112f2;
  const t = window.t;

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div onMouseDown={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(4,6,11,0.7)', backdropFilter: 'var(--blur-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onMouseDown={(e) => e.stopPropagation()} role="alertdialog" style={{
        width: 400, background: 'var(--surface-1)',
        border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)', padding: 22,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 38, height: 38, flex: '0 0 38px', borderRadius: 'var(--radius-md)', background: 'var(--danger-soft)', color: 'var(--danger-text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trash-2" size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ font: 'var(--text-h3)', fontSize: 17, color: 'var(--text-primary)' }}>{t('delete_confirm_title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>
              "<span style={{ color: 'var(--text-primary)' }}>{item?.title}</span>" {t('delete_confirm_desc')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <Button variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
          <Button variant="danger" iconLeft={<Icon name="trash-2" size={15} />} onClick={onConfirm}>{t('delete_btn')}</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryScreen });;


