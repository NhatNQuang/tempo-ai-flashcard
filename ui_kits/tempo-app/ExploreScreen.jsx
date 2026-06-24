// Tempo UI kit - Explore
function ExploreScreen() {
  const { Card, Badge, Chip, Button, Input, Avatar } = window.TempoDesignSystem_e112f2;
  const [cat, setCat] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [importingId, setImportingId] = React.useState(null);
  const [importedIds, setImportedIds] = React.useState(new Set());
  const [toastMessage, setToastMessage] = React.useState('');
  const [langToken, setLangToken] = React.useState(0);
  const [previewItem, setPreviewItem] = React.useState(null);
  const [previewData, setPreviewData] = React.useState(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);

  const getAuthHeaders = async (json) => {
    const headers = {};
    if (window.supabaseClient) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        if (json) headers['Content-Type'] = 'application/json';
      }
    }
    return headers;
  };

  const openPreview = async (item) => {
    setPreviewItem(item);
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/v1/community/resources/${item.id}/preview`, { headers });
      const resJson = await response.json();
      if (resJson.success) setPreviewData(resJson.data);
    } catch (e) {
      console.error('Failed to load preview:', e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => { setPreviewItem(null); setPreviewData(null); };

  const handleToggleLike = async (communityId) => {
    try {
      const headers = await getAuthHeaders(true);
      const response = await fetch(`/api/v1/community/resources/${communityId}/like`, { method: 'POST', headers });
      const resJson = await response.json();
      if (resJson.success) {
        setPreviewData(prev => prev ? { ...prev, liked: resJson.data.liked, community: { ...prev.community, like_count: resJson.data.like_count } } : prev);
        setItems(prev => prev.map(it => it.id === communityId ? { ...it, like_count: resJson.data.like_count } : it));
      }
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  };

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const t = window.t;

  const categoryTypeMap = {
    'All': '',
    'Flashcards': 'flashcard_set',
    'Notes': 'cornell_note'
  };

  const loadPublicResources = async (queryVal = searchQuery, catVal = cat) => {
    setLoading(true);
    try {
      const type = categoryTypeMap[catVal] || '';
      let url = `/api/v1/community/resources?`;
      if (type) url += `type=${type}&`;
      if (queryVal) url += `q=${encodeURIComponent(queryVal)}&`;

      const authHeaders = {};
      if (window.supabaseClient) {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch(url, { headers: authHeaders });
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setItems(resJson.data);
      }
    } catch (error) {
      console.error('Failed to load community resources:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadPublicResources(searchQuery, cat);
  }, [cat]);

  const handleSearch = () => {
    loadPublicResources(searchQuery, cat);
  };

  const handleImport = async (item, e) => {
    if (e) e.stopPropagation();
    setImportingId(item.id);
    try {
      const headers = await getAuthHeaders(true);
      const response = await fetch(`/api/v1/community/resources/${item.id}/import`, {
        method: 'POST',
        headers
      });
      const resJson = await response.json();
      if (resJson.success) {
        setImportedIds(prev => new Set(prev).add(item.id));
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, import_count: (it.import_count || 0) + 1 } : it));
        setToastMessage(window.currentLanguage === 'vi'
          ? `Đã tải thành công "${item.title}" vào Thư viện của bạn!`
          : `Successfully imported "${item.title}" into your Library!`);
        setTimeout(() => setToastMessage(''), 4000);
        closePreview();
      } else {
        alert(resJson.error?.message || 'Failed to import resource.');
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImportingId(null);
    }
  };

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div style={{ padding: '24px 28px 48px', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: 'var(--success-text)', color: '#fff',
          padding: '12px 18px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, fontSize: 13.5
        }}>
          <Icon name="check-circle" size={17} />
          {toastMessage}
        </div>
      )}

      {/* Header and Category Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Study Spaces', 'Flashcards', 'Notes', 'Exam Packs', 'Collections', 'Users'].map(c => {
            let trans = c;
            if (c === 'All') trans = t('all');
            else if (c === 'Study Spaces') trans = t('study_spaces');
            else if (c === 'Flashcards') trans = t('flashcards');
            else if (c === 'Notes') trans = t('notes');
            else if (c === 'Exam Packs') trans = window.currentLanguage === 'vi' ? 'Bộ đề thi' : 'Exam Packs';
            else if (c === 'Collections') trans = window.currentLanguage === 'vi' ? 'Bộ sưu tập' : 'Collections';
            else if (c === 'Users') trans = window.currentLanguage === 'vi' ? 'Người dùng' : 'Users';
            return (
              <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{trans}</Chip>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder={window.currentLanguage === 'vi' ? 'Tìm bộ thẻ ghi nhớ hoặc ghi chú công khai...' : 'Search public flashcards or notes by keyword...'}
            iconLeft={<Icon name="search" size={16} />}
          />
        </div>
        <Button variant="primary" onClick={handleSearch} iconLeft={<Icon name="search" size={15} />}>
          {window.currentLanguage === 'vi' ? 'Tìm kiếm' : 'Search'}
        </Button>
      </div>

      {/* Main Content Area */}
      {['Study Spaces', 'Exam Packs', 'Collections', 'Users'].includes(cat) ? (
        <Card style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Icon name="folder-open" size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: 14 }}>
            {window.currentLanguage === 'vi' 
              ? `Chưa có ${cat === 'Study Spaces' ? t('study_spaces').toLowerCase() : cat === 'Users' ? 'người dùng' : cat.toLowerCase()} công khai nào được chia sẻ trong cộng đồng.`
              : `No public ${cat.toLowerCase()} shared in the community yet.`}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>
            {window.currentLanguage === 'vi' 
              ? 'Hãy thử chuyển sang tab Tất cả, Thẻ ghi nhớ hoặc Ghi chú.'
              : 'Try switching to the All, Flashcards, or Notes tabs.'}
          </p>
        </Card>
      ) : (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-secondary)' }}>
              <Icon name="loader-2" size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> {window.currentLanguage === 'vi' ? 'Đang tải tài nguyên...' : 'Loading resources...'}
            </div>
          ) : items.length === 0 ? (
            <Card style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Icon name="search-code" size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 14 }}>{window.currentLanguage === 'vi' ? 'Không tìm thấy tài nguyên cộng đồng phù hợp.' : 'No matching community resources found.'}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>{window.currentLanguage === 'vi' ? 'Hãy thử tìm kiếm với từ khóa khác hoặc quay lại sau.' : 'Try searching for a different keyword or check back later.'}</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {items.map(item => {
                const isFlash = item.resource_type === 'flashcard_set';
                const hasDoc = item.document_access_policy === 'with_document';
                const publisherName = item.publisher?.full_name || item.publisher?.email || 'Anonymous';
                const isImported = importedIds.has(item.id);

                return (
                  <Card key={item.id} onClick={() => openPreview(item)} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Badge tone={isFlash ? 'violet' : 'green'} uppercase size="sm">
                        {isFlash ? t('flashcards') : t('notes')}
                      </Badge>
                      <Badge tone={hasDoc ? 'green' : 'amber'} size="sm">
                        {hasDoc 
                          ? (window.currentLanguage === 'vi' ? 'Kèm tài liệu' : 'With documents') 
                          : (isFlash 
                              ? (window.currentLanguage === 'vi' ? 'Chỉ bộ thẻ ghi nhớ' : 'Flashcard set only') 
                              : (window.currentLanguage === 'vi' ? 'Chỉ bộ ghi chú' : 'Notes set only'))}
                      </Badge>
                    </div>

                    <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3 }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.45, margin: '0 0 16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || (window.currentLanguage === 'vi' ? 'Không có mô tả.' : 'No description provided.')}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', borderTop: '1px solid var(--border-subtle)', marginBottom: 12 }}>
                      <Avatar name={publisherName} size="xs" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {publisherName}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
                          {window.currentLanguage === 'vi' 
                            ? `Đã đăng ${new Date(item.published_at).toLocaleDateString()}` 
                            : `Published ${new Date(item.published_at).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 12, color: 'var(--text-tertiary)', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="download" size={13} /> {item.import_count || 0}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="thumbs-up" size={13} /> {item.like_count || 0}</span>
                      </div>
                      
                      {isImported ? (
                        <Button variant="secondary" size="sm" disabled iconLeft={<Icon name="check" size={14} />}>
                          {window.currentLanguage === 'vi' ? 'Đã tải về' : 'Imported'}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={importingId === item.id}
                          onClick={(e) => handleImport(item, e)}
                          iconLeft={<Icon name="plus" size={14} />}
                        >
                          {window.currentLanguage === 'vi' ? 'Tải về' : 'Import'}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {previewItem && (
        <PreviewDialog
          item={previewItem}
          data={previewData}
          loading={previewLoading}
          liked={previewData?.liked}
          onClose={closePreview}
          onToggleLike={handleToggleLike}
          onImport={(community) => handleImport(previewItem)}
          importing={importingId === previewItem.id}
          imported={importedIds.has(previewItem.id)}
        />
      )}
    </div>
  );
}

function PreviewDialog({ item, data, loading, liked, onClose, onToggleLike, onImport, importing, imported }) {
  const { Button, Badge, Avatar } = window.TempoDesignSystem_e112f2;
  const t = window.t;
  const vi = window.currentLanguage === 'vi';

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const community = data?.community || item;
  const preview = data?.preview;
  const isFlash = (community.resource_type || preview?.type) === 'flashcard_set';
  const hasDoc = (community.document_access_policy === 'with_document') || (preview && preview.has_document);
  const publisher = community.publisher || {};
  const author = publisher.username || publisher.full_name || publisher.email || 'Anonymous';

  return (
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(4,6,11,0.7)', backdropFilter: 'var(--blur-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ width: 560, maxWidth: '95vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Badge tone={isFlash ? 'violet' : 'green'} uppercase size="sm">{isFlash ? t('flashcards') : t('notes')}</Badge>
                <Badge tone={hasDoc ? 'green' : 'amber'} size="sm">{hasDoc ? (vi ? 'Có tài liệu' : 'Document available') : (vi ? 'Không có tài liệu' : 'Document unavailable')}</Badge>
              </div>
              <h3 style={{ font: 'var(--text-h3)', fontSize: 19, color: 'var(--text-primary)', margin: 0 }}>{community.title}</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-tertiary)', cursor: 'pointer', flex: '0 0 auto' }}><Icon name="x" size={18} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Avatar name={publisher.full_name || author} size="xs" />
              <span style={{ color: 'var(--text-secondary)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{author}</span>
            </div>
            <button onClick={() => onToggleLike(community.id)} title={liked ? 'Unlike' : 'Like'} className={liked ? 'tempo-star-fav' : ''} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 10px', cursor: 'pointer', color: liked ? 'var(--warning)' : 'var(--text-secondary)' }}>
              <Icon name="star" size={15} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{community.like_count || 0}</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
          {loading || !preview ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, color: 'var(--text-secondary)' }}>
              <Icon name="loader-2" size={22} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> {vi ? 'Đang tải bản xem trước...' : 'Loading preview...'}
            </div>
          ) : isFlash ? (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                {vi ? `Tổng ${preview.card_count} thẻ · xem trước ${preview.preview_count || 0}` : `${preview.card_count} cards total · previewing ${preview.preview_count || 0}`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(preview.cards || []).map((c, i) => (
                  <div key={c.id || i} style={{ padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{i + 1}. {c.question}</div>
                    {(c.options && c.options.length) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {c.options.map((o, oi) => (<div key={oi} style={{ fontSize: 12.5, color: o.is_correct ? 'var(--success-text)' : 'var(--text-secondary)' }}>{String.fromCharCode(65 + oi)}. {o.option_text}{o.is_correct ? ' ✓' : ''}</div>))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.answer}</div>
                    )}
                  </div>
                ))}
              </div>
              {preview.card_count > (preview.preview_count || 0) && (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12, marginTop: 12 }}>
                  {vi ? `Nhập để xem tất cả ${preview.card_count} thẻ` : `Import to see all ${preview.card_count} cards`}
                </div>
              )}
            </div>
          ) : (
            <div>
              {preview.summary && (
                <div style={{ padding: '12px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border-violet)', borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
                  <div style={{ font: 'var(--text-eyebrow)', textTransform: 'uppercase', color: 'var(--violet-300)', marginBottom: 6 }}>{vi ? 'Tóm tắt' : 'Summary'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{preview.summary}</div>
                </div>
              )}
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
                {vi ? `Tổng ${preview.total_points || 0} ý chính · xem trước ${(preview.points || []).length}` : `${preview.total_points || 0} main points · previewing ${(preview.points || []).length}`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(preview.points || []).map((b, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {b.title && <div style={{ fontWeight: 600, marginBottom: 3 }}>{b.title}</div>}
                    {b.content}
                  </div>
                ))}
              </div>
              {(preview.total_points || 0) > (preview.points || []).length && (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12, marginTop: 12 }}>
                  {vi ? 'Nhập để xem toàn bộ ghi chú' : 'Import to see the full notes'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
          {imported ? (
            <Button variant="secondary" disabled iconLeft={<Icon name="check" size={15} />}>{vi ? 'Đã tải về' : 'Imported'}</Button>
          ) : (
            <Button variant="primary" loading={importing} onClick={() => onImport(community)} iconLeft={<Icon name="download" size={15} />}>{vi ? 'Tải về thư viện' : 'Import to Library'}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExploreScreen });
