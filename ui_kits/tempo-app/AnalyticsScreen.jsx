// Tempo UI kit — Analytics dashboard
function AnalyticsScreen() {
  const { StatTile, Card, ProgressRing, ProgressBar, Tabs, Avatar, Badge, Button } = window.TempoDesignSystem_e112f2;
  const [tab, setTab] = React.useState('overview');
  const [langToken, setLangToken] = React.useState(0);
  
  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const t = window.t;

  const toneIcon = (t, name) => <Icon name={name} size={16} />;

  // Stacked bar chart data (study time over time)
  const days = Array.from({ length: 28 }, (_, i) => {
    const f = 6 + Math.sin(i / 2) * 4 + (i % 5) * 1.5;
    return { f: Math.max(2, f), n: 2 + (i % 4), e: 1 + (i % 3) * 0.6, a: 0.5 + (i % 2) };
  });
  const maxTot = Math.max(...days.map(d => d.f + d.n + d.e + d.a));

  // Mastery line points
  const mastery = [38,40,43,42,47,50,49,54,56,58,57,62,64,63,66,68];
  const linePts = mastery.map((v, i) => `${(i/(mastery.length-1))*100},${100-((v-30)/45)*100}`).join(' ');

  const getTranslatedStatLabel = (lbl) => {
    if (lbl === 'Total Study Time') return t('study_time');
    if (lbl === 'Cards Reviewed') return t('cards_reviewed');
    if (lbl === 'Notes Created') return t('notes_created');
    if (lbl === 'Exams Taken') return t('exams_taken');
    if (lbl === 'Average Mastery') return t('avg_mastery');
    return lbl;
  };

  const getTranslatedStudyType = (name) => {
    if (name === 'Flashcards') return t('flashcards');
    if (name === 'Notes') return t('notes');
    if (name === 'Exams') return window.currentLanguage === 'vi' ? 'Đề thi' : 'Exams';
    if (name === 'AI Chat (Tutor)') return window.currentLanguage === 'vi' ? 'Trò chuyện AI (Gia sư)' : 'AI Chat (Tutor)';
    return name;
  };

  const getTranslatedWeakTopicName = (name) => {
    if (window.currentLanguage !== 'vi') return name;
    const map = {
      'Thermodynamics': 'Nhiệt động lực học',
      'Backpropagation': 'Lan truyền ngược',
      'Linear Algebra': 'Đại số tuyến tính',
      'Operating Systems': 'Hệ điều hành',
      'Data Structures': 'Cấu trúc dữ liệu'
    };
    return map[name] || name;
  };

  const getTranslatedInsight = (ins) => {
    if (window.currentLanguage !== 'vi') return ins;
    const titleMap = {
      "You're improving!": t('improving'),
      'Review overdue': t('review_overdue'),
      'Weak topics detected': t('weak_topics'),
      'Best time to study': t('best_time')
    };
    const bodyMap = {
      'Your mastery score increased 12% this month.': 'Điểm tinh thông của bạn tăng 12% trong tháng này.',
      '142 cards are overdue. Review them to boost retention.': '142 thẻ đã quá hạn ôn tập. Hãy ôn tập ngay để tăng khả năng ghi nhớ.',
      'Thermodynamics, Backpropagation, and Linear Algebra need more practice.': 'Nhiệt động lực học, Lan truyền ngược và Đại số tuyến tính cần luyện tập thêm.',
      "You're most productive between 7PM - 10PM.": 'Bạn hoạt động hiệu quả nhất trong khoảng 19:00 - 22:00.'
    };
    return {
      ...ins,
      title: titleMap[ins.title] || ins.title,
      body: bodyMap[ins.body] || ins.body
    };
  };

  return (
    <div style={{ padding: '24px 28px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)', letterSpacing: 'var(--ls-tight)' }}>
            {window.currentLanguage === 'vi' ? 'Phân tích' : 'Analytics'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            {window.currentLanguage === 'vi' ? 'Theo dõi tiến trình và nâng cao hành trình học tập của bạn.' : 'Track your progress and improve your learning journey.'}
          </p>
        </div>
      </div>

      {/* Tabs + date range */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: 'overview', label: window.currentLanguage === 'vi' ? 'Tổng quan' : 'Overview' }, 
          { id: 'spaces', label: t('study_spaces') },
          { id: 'cards', label: t('flashcards') }, 
          { id: 'notes', label: t('notes') },
          { id: 'exams', label: window.currentLanguage === 'vi' ? 'Đề thi' : 'Exams' }, 
          { id: 'goals', label: window.currentLanguage === 'vi' ? 'Mục tiêu' : 'Goals' },
        ]} style={{ border: 'none', flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>
          <Icon name="calendar" size={15} /> 
          {window.currentLanguage === 'vi' ? '19 thg 5 – 18 thg 6, 2024' : 'May 19 – Jun 18, 2024'} 
          <Icon name="chevron-down" size={14} />
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 16 }}>
        {window.STATS.map((s, i) => {
          const val = s.value.replace('h', window.currentLanguage === 'vi' ? 'g' : 'h').replace('m', window.currentLanguage === 'vi' ? 'ph' : 'm');
          return (
            <StatTile key={i} label={getTranslatedStatLabel(s.label)} value={val} delta={s.delta} caption={s.caption.replace('vs', window.currentLanguage === 'vi' ? 'so với' : 'vs')} icon={toneIcon(s.tone, s.icon)} iconTone={s.tone} />
          );
        })}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* Study Time Over Time */}
        <Card style={{ gridColumn: 'span 2' }}>
          <ChartHeader title={window.currentLanguage === 'vi' ? 'Thời gian học theo thời gian' : 'Study Time Over Time'} legend={window.STUDY_BY_TYPE.slice(0,4).map(item => ({ ...item, name: getTranslatedStudyType(item.name) }))} right={<DropdownPill label={window.currentLanguage === 'vi' ? 'Hàng ngày' : 'Daily'} />} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 180, marginTop: 16 }}>
            {days.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', gap: 1 }}>
                {[['a','var(--chart-4)'],['e','var(--chart-3)'],['n','var(--chart-2)'],['f','var(--chart-1)']].map(([k,c]) => (
                  <div key={k} style={{ height: `${(d[k]/maxTot)*100}%`, background: c, borderRadius: k==='f'?'3px 3px 0 0':0, opacity: 0.9 }} />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text-tertiary)', fontSize: 11 }}>
            <span>May 19</span><span>May 26</span><span>Jun 2</span><span>Jun 9</span><span>Jun 16</span>
          </div>
        </Card>

        {/* Study Time by Type donut */}
        <Card>
          <ChartHeader title={window.currentLanguage === 'vi' ? 'Thời gian học theo loại' : 'Study Time by Type'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14 }}>
            <Donut segments={window.STUDY_BY_TYPE.map(item => ({ ...item, name: getTranslatedStudyType(item.name) }))} size={132} centerTop={window.currentLanguage === 'vi' ? "128g" : "128h"} centerBottom={window.currentLanguage === 'vi' ? "45ph Tổng cộng" : "45m Total"} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {window.STUDY_BY_TYPE.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{getTranslatedStudyType(s.name)}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Learning streak */}
        <Card style={{ gridRow: 'span 1' }}>
          <SectionTitle>{window.currentLanguage === 'vi' ? 'Chuỗi học tập' : 'Learning Streak'}</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
            <Icon name="flame" size={26} color="var(--warning)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--text-primary)' }}>
              23 <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{window.currentLanguage === 'vi' ? 'ngày' : 'days'}</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, marginBottom: 12 }}>{window.currentLanguage === 'vi' ? 'Cố gắng lên! 🔥' : 'Keep it up! 🔥'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
              const viDays = ['Hai','Ba','Tư','Năm','Sáu','Bảy','CN'];
              return (
                <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < 6 ? 'var(--violet-500)' : 'var(--surface-3)', color: i < 6 ? '#fff' : 'var(--text-tertiary)' }}>
                    {i < 6 ? <Icon name="check" size={13} /> : ''}
                  </span>
                  <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{window.currentLanguage === 'vi' ? viDays[i] : d}</span>
                </div>
              );
            })}
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            {window.currentLanguage === 'vi' ? 'Kỷ lục cá nhân: 37 ngày' : 'Personal Best: 37 days'}
          </p>
        </Card>

        {/* Mastery Progress */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <SectionTitle>{window.currentLanguage === 'vi' ? 'Tiến độ tinh thông' : 'Mastery Progress'}</SectionTitle>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)' }}>68%</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t('avg_mastery')}</div>
              <div style={{ fontSize: 11, color: 'var(--success-text)', fontWeight: 700 }}>
                {window.currentLanguage === 'vi' ? '▲ 12% so với kỳ trước' : '▲ 12% vs last period'}
              </div>
            </div>
          </div>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: 130, marginTop: 12 }}>
            <defs><linearGradient id="ml" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--violet-500)" stopOpacity="0.35" /><stop offset="100%" stopColor="var(--violet-500)" stopOpacity="0" /></linearGradient></defs>
            <polygon points={`0,60 ${linePts} 100,60`} fill="url(#ml)" />
            <polyline points={linePts} fill="none" stroke="var(--violet-400)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
        </Card>

        {/* Weak topics */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle>{window.currentLanguage === 'vi' ? 'Chủ đề còn yếu' : 'Weak Topics'}</SectionTitle>
            <a style={{ color: 'var(--violet-300)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{window.currentLanguage === 'vi' ? 'Xem tất cả' : 'View all'}</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {window.WEAK_TOPICS.map((t, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{getTranslatedWeakTopicName(t.name)}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.pct}%</span>
                </div>
                <ProgressBar value={t.pct} height={5} gradient={false} color={t.pct < 50 ? 'var(--danger)' : t.pct < 65 ? 'var(--warning)' : 'var(--success)'} />
              </div>
            ))}
          </div>
        </Card>

        {/* Review forecast */}
        <Card>
          <SectionTitle>{window.currentLanguage === 'vi' ? 'Dự báo ôn tập' : 'Review Forecast'}</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
            <Donut size={110} thickness={16} centerTop="142" centerBottom={window.currentLanguage === 'vi' ? "7 ngày tới" : "Next 7 Days"} segments={[{pct:20,color:'var(--danger)'},{pct:24,color:'var(--warning)'},{pct:28,color:'var(--success)'},{pct:28,color:'var(--violet-500)'}]} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                [window.currentLanguage === 'vi' ? 'Hôm nay' : 'Today', 28, 'var(--danger)'],
                [window.currentLanguage === 'vi' ? 'Ngày mai' : 'Tomorrow', 34, 'var(--warning)'],
                [window.currentLanguage === 'vi' ? 'Trong 3 ngày' : 'In 3 days', 40, 'var(--success)'],
                [window.currentLanguage === 'vi' ? 'Trong 4–7 ngày' : 'In 4–7 days', 40, 'var(--violet-400)']
              ].map(([l,n,c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{l}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="primary" fullWidth style={{ marginTop: 16 }}>{window.currentLanguage === 'vi' ? 'Ôn tập ngay' : 'Review Now'}</Button>
        </Card>

        {/* AI Insights */}
        <Card style={{ gridColumn: '3', gridRow: '2 / span 2' }}>
          <SectionTitle>{window.currentLanguage === 'vi' ? 'Nhận xét từ AI' : 'AI Insights'}</SectionTitle>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginBottom: 14 }}>{window.currentLanguage === 'vi' ? 'Dựa trên hành vi học tập của bạn' : 'Based on your learning behavior'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {window.AI_INSIGHTS.map((ins, i) => {
              const tones = { green: 'var(--success-text)', red: 'var(--danger-text)', amber: 'var(--warning-text)', violet: 'var(--violet-300)' };
              const softs = { green: 'var(--success-soft)', red: 'var(--danger-soft)', amber: 'var(--warning-soft)', violet: 'rgba(139,92,246,0.16)' };
              const translatedIns = getTranslatedInsight(ins);
              return (
                <div key={i} style={{ display: 'flex', gap: 11 }}>
                  <span style={{ width: 32, height: 32, flex: '0 0 32px', borderRadius: 'var(--radius-md)', background: softs[ins.tone], color: tones[ins.tone], display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ins.icon} size={16} /></span>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{translatedIns.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.4, marginTop: 2 }}>{translatedIns.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <a style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--violet-300)', fontSize: 12.5, fontWeight: 600, marginTop: 16, cursor: 'pointer' }}>
            {window.currentLanguage === 'vi' ? 'Xem tất cả nhận xét' : 'View all insights'} 
            <Icon name="arrow-right" size={14} />
          </a>
        </Card>
      </div>
    </div>
  );
}

// — small shared bits —
function SectionTitle({ children }) {
  return <h3 style={{ font: 'var(--text-h3)', fontSize: 17, color: 'var(--text-primary)' }}>{children}</h3>;
}
function ChartHeader({ title, legend, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SectionTitle>{title}</SectionTitle>
        {legend && <div style={{ display: 'flex', gap: 12 }}>{legend.map((s,i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-secondary)' }}><span style={{ width: 7, height: 7, borderRadius: 2, background: s.color }} />{s.name}</span>)}</div>}
      </div>
      {right}
    </div>
  );
}
function DropdownPill({ label }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 12.5 }}>{label} <Icon name="chevron-down" size={13} /></span>;
}

Object.assign(window, { AnalyticsScreen });


