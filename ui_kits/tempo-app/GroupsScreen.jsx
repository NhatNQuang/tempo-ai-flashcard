// Tempo UI kit — Groups
function GroupsScreen() {
  const { Card, Badge, Tabs, Chip, AvatarGroup, Button, IconButton } = window.TempoDesignSystem_e112f2;
  const [tab, setTab] = React.useState('my');
  const [cat, setCat] = React.useState('All');
  const [langToken, setLangToken] = React.useState(0);
  
  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const t = window.t;
  const members = window.AVATARS.map(a => ({ name: a.name }));

  const categoryLabels = {
    'All': t('all'),
    'Computer Science': window.currentLanguage === 'vi' ? 'Khoa học máy tính' : 'Computer Science',
    'Mathematics': window.currentLanguage === 'vi' ? 'Toán học' : 'Mathematics',
    'Science': window.currentLanguage === 'vi' ? 'Khoa học' : 'Science',
    'Languages': window.currentLanguage === 'vi' ? 'Ngôn ngữ' : 'Languages',
    'Business': window.currentLanguage === 'vi' ? 'Kinh doanh' : 'Business'
  };

  return (
    <div style={{ padding: '24px 28px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)', letterSpacing: 'var(--ls-tight)' }}>
          {window.currentLanguage === 'vi' ? 'Nhóm học tập' : 'Groups'}
        </h1>
        <Button variant="primary" iconLeft={<Icon name="plus" size={16} />}>
          {window.currentLanguage === 'vi' ? 'Tạo nhóm' : 'Create Group'}
        </Button>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 18 }}>
        {window.currentLanguage === 'vi' ? 'Học cùng nhau, chia sẻ tài nguyên và đạt kết quả tốt hơn theo nhóm.' : 'Study together, share resources, and achieve more as a team.'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: 'my', label: window.currentLanguage === 'vi' ? 'Nhóm của tôi' : 'My Groups' }, 
          { id: 'explore', label: window.currentLanguage === 'vi' ? 'Khám phá nhóm' : 'Explore Groups' }, 
          { id: 'requests', label: window.currentLanguage === 'vi' ? 'Yêu cầu' : 'Requests', count: 2 },
        ]} style={{ border: 'none', flex: 1 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div>
          {/* My group cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 26 }}>
            {window.GROUPS.map((g, i) => (
              <Card key={i} interactive padding="none" style={{ overflow: 'hidden' }}>
                <div style={{ height: 92, ...subjectBackdrop(g.tone) }}>
                  <Constellation tone={g.tone} />
                  <button style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 8, width: 28, height: 28, color: '#fff', cursor: 'pointer' }}><Icon name="more-vertical" size={15} /></button>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>{g.name}</h3>
                    {g.pro && <Icon name="badge-check" size={16} color="var(--violet-400)" />}
                  </div>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 12, margin: '4px 0 8px' }}>
                    {g.members} {window.currentLanguage === 'vi' ? 'thành viên' : 'members'} · {window.currentLanguage === 'vi' ? 'Bạn' : 'You'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.45, minHeight: 34 }}>{g.desc}</p>
                  <div style={{ display: 'flex', gap: 18, margin: '14px 0', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                    {[
                      [window.currentLanguage === 'vi' ? 'Tài liệu' : 'Resources', g.resources], 
                      [t('notes'), g.notes], 
                      [t('flashcards'), g.cards]
                    ].map(([l,v]) => (
                      <div key={l}><div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-display)' }}>{v}</div><div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{l}</div></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12 }}>
                      <Icon name="calendar" size={13} />
                      {g.next.replace('Next session in', window.currentLanguage === 'vi' ? 'Phiên tiếp theo trong' : 'Next session in')
                             .replace('Next session tomorrow', window.currentLanguage === 'vi' ? 'Phiên tiếp theo vào ngày mai' : 'Next session tomorrow')
                             .replace('Next session in 1d', window.currentLanguage === 'vi' ? 'Phiên tiếp theo sau 1 ngày' : 'Next session in 1d')
                             .replace('No upcoming session', window.currentLanguage === 'vi' ? 'Không có phiên sắp tới' : 'No upcoming session')}
                    </span>
                    <AvatarGroup users={members.slice(i, i + 4)} max={3} size="xs" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Explore groups table */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ font: 'var(--text-h2)', fontSize: 20, color: 'var(--text-primary)' }}>
              {window.currentLanguage === 'vi' ? 'Khám phá nhóm' : 'Explore Groups'}
            </h2>
            <a style={{ color: 'var(--violet-300)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {window.currentLanguage === 'vi' ? 'Xem tất cả →' : 'View all →'}
            </a>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {['All','Computer Science','Mathematics','Science','Languages','Business'].map(c => (
              <Chip key={c} size="sm" selected={cat === c} onClick={() => setCat(c)}>{categoryLabels[c] || c}</Chip>
            ))}
          </div>
          <Card padding="none">
            {window.EXPLORE_GROUPS.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ width: 40, height: 40, flex: '0 0 40px', borderRadius: 'var(--radius-md)', background: SUBJECT[g.tone].soft, color: SUBJECT[g.tone].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={g.icon} size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>{g.name}</span>
                    {g.hub && <Icon name="badge-check" size={14} color="var(--violet-400)" />}
                  </div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{g.desc}</div>
                </div>
                <AvatarGroup users={members.slice(i, i + 3)} max={3} size="xs" />
                <div style={{ display: 'flex', gap: 16, color: 'var(--text-tertiary)', fontSize: 12, width: 200, justifyContent: 'flex-end' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="file-text" size={13} />{g.docs}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="sticky-note" size={13} />{g.notes}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: g.active ? 'var(--success-text)' : 'var(--text-tertiary)' }}>{g.active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />}{g.active ? (window.currentLanguage === 'vi' ? 'Đang hoạt động' : g.activity) : (g.activity.replace('2h ago', window.currentLanguage === 'vi' ? '2 giờ trước' : '2h ago').replace('Today', window.currentLanguage === 'vi' ? 'Hôm nay' : 'Today').replace('1d ago', window.currentLanguage === 'vi' ? '1 ngày trước' : '1d ago'))}</span>
                </div>
                <Button variant="secondary" size="sm">{window.currentLanguage === 'vi' ? 'Tham gia' : 'Join'}</Button>
              </div>
            ))}
          </Card>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ font: 'var(--text-h3)', fontSize: 16, color: 'var(--text-primary)' }}>
                {window.currentLanguage === 'vi' ? 'Buổi học sắp tới' : 'Upcoming Sessions'}
              </h3>
              <a style={{ color: 'var(--violet-300)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {window.currentLanguage === 'vi' ? 'Xem lịch biểu' : 'View calendar'}
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                [window.currentLanguage === 'vi' ? 'Buổi học Deep Learning' : 'Deep Learning Study Session', window.currentLanguage === 'vi' ? 'Hôm nay, 19:00' : 'Today, 7:00 PM', 'cs'],
                [window.currentLanguage === 'vi' ? 'Luyện tập giải thuật' : 'Algorithms Practice', window.currentLanguage === 'vi' ? 'Ngày mai, 18:00' : 'Tomorrow, 6:00 PM', 'science'],
                [window.currentLanguage === 'vi' ? 'Ôn tập bài kiểm tra Hóa học' : 'Chemistry Quiz Review', window.currentLanguage === 'vi' ? '25 tháng 5, 20:00' : 'May 25, 8:00 PM', 'math']
              ].map(([t,d,tone], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ width: 36, height: 36, flex: '0 0 36px', borderRadius: 'var(--radius-md)', background: SUBJECT[tone].soft, color: SUBJECT[tone].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="calendar" size={17} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{t}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>{d}</div>
                  </div>
                  <Button variant="outline" size="sm">{window.currentLanguage === 'vi' ? 'Vào' : 'Join'}</Button>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 style={{ font: 'var(--text-h3)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 14 }}>{t('recent_activity')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Sarah Lee', window.currentLanguage === 'vi' ? 'đã tải lên “CNN Architecture Notes” vào Deep Learning Squad' : 'uploaded “CNN Architecture Notes” to Deep Learning Squad', window.currentLanguage === 'vi' ? '20 phút trước' : '20m ago'],
                ['Alex Chen', window.currentLanguage === 'vi' ? 'đã thêm 25 thẻ ghi nhớ mới vào Algorithms Club' : 'added 25 new flashcards to Algorithms Club', window.currentLanguage === 'vi' ? '1 giờ trước' : '1h ago'],
                ['Emily Johnson', window.currentLanguage === 'vi' ? 'đã bắt đầu thảo luận trong Calculus Study Circle' : 'started a discussion in Calculus Study Circle', window.currentLanguage === 'vi' ? '3 giờ trước' : '3h ago']
              ].map(([who,what,when], i) => {
                const { Avatar } = window.TempoDesignSystem_e112f2;
                return (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <Avatar name={who} size="sm" />
                    <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{who} </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{what}</span>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 11, marginTop: 2 }}>{when}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { GroupsScreen });
