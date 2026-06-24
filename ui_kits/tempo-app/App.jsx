// Setup translation dictionary and system-wide translation state/events
window.translations = {
  en: {
    // Sidebar
    learn: 'Learn',
    library: 'Library',
    explore: 'Explore',
    groups: 'Groups',
    analytics: 'Analytics',
    settings: 'Settings',
    support: 'Help & Support',
    workspace: 'Workspace',
    
    // TopBar / Profile
    upgrade_pro: 'Upgrade to Pro',
    pro_plan: 'Pro Plan',
    free_plan: 'Free Plan',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    logout: 'Log Out',
    
    // Settings modal
    account_settings: 'Account Settings',
    subscription: 'Subscription Plan',
    profile_info: 'Personal Info',
    appearance: 'Appearance',
    privacy: 'Account & Privacy',
    username: 'Username',
    email: 'Email',
    language: 'Language',
    change_password: 'Change Password',
    edit: 'Edit',
    save: 'Save Changes',
    cancel: 'Cancel',
    
    // Password dialog
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_password: 'Confirm New Password',
    
    // Library
    flashcards: 'Flashcards',
    notes: 'Notes',
    study_spaces: 'Study Spaces',
    upload: 'Upload',
    all: 'All',
    recent: 'Recent',
    multiple_choice: 'Multiple Choice',
    situation: 'Situation',
    mixed: 'Mixed',
    starred: 'Starred',
    studying: 'Studying',
    no_flashcards_yet: 'No flashcard sets yet. Upload a document in Learn to generate them.',
    no_notes_yet: 'No notes yet. Upload a document in Learn to generate them.',
    cards_count: 'cards',
    edited: 'Edited',
    just_now: 'just now',
    m_ago: 'm ago',
    h_ago: 'h ago',
    d_ago: 'd ago',
    delete_confirm_title: 'Delete this resource?',
    delete_confirm_desc: 'will be permanently removed.',
    delete_btn: 'Delete',
    make_public: 'Make public',
    share: 'Share',
    share_with_doc: 'Share with document',
    public_with_doc: 'Public with documents',
    public_with_doc_desc: 'Anyone with the link can access the material and use the AI assistant with the document.',
    only_public_set: 'Only public set',
    only_public_set_desc: 'Anyone can access the material, but cannot use the AI assistant to query the document.',
    
    // Learn
    drop_docs_here: 'Drop your study documents here',
    drop_docs_desc: 'Upload a PDF, DOCX, PPTX, TXT, or Markdown file and let Tempo turn it into study-ready flashcards or structured notes.',
    choose_file: 'Choose File',
    processing_doc: 'Processing document...',
    analyzing_doc: 'Analyzing your document...',
    reading_flashcards: 'Tempo AI is reading your document and generating flashcards...',
    reading_notes: 'Tempo AI is reading your document and generating Cornell notes...',
    study_room_ready: 'Study room ready!',
    opening_session: 'Opening your learning session...',
    learning_tracking: 'Learning tracking',
    configure_flashcards: 'Configure Flashcards',
    configure_notes: 'Configure Cornell Notes',
    change_method: 'Change Study Method',
    deck_name: 'Deck name',
    note_name: 'Note name',
    num_cards: 'Number of cards',
    difficulty: 'Difficulty',
    content_type: 'Content type',
    detail_level: 'Level of detail',
    custom: 'Custom',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    less: 'less',
    generating_fc: 'Generating Flashcards...',
    generate_fc: 'Generate Flashcards',
    generating_notes: 'Generating Cornell Notes...',
    generate_notes: 'Generate Cornell Notes',
    todays_goal: "Today's Goal",
    recent_activity: 'Recent Activity',
    study_time: 'Total Study Time',
    cards_reviewed: 'Cards Reviewed',
    notes_created: 'Notes Created',
    exams_taken: 'Exams Taken',
    avg_mastery: 'Average Mastery',
    weak_topics: 'Weak topics detected',
    review_overdue: 'Review overdue',
    improving: "You're improving!",
    best_time: 'Best time to study',
    search_analytics: 'Search analytics, topics, sessions...',
    search_library: 'Search flashcards, notes, study spaces...',
    search_explore: 'Search study spaces, notes, flashcards, exams...',
    search_groups: 'Search groups, members, or resources...'
  },
  vi: {
    // Sidebar
    learn: 'Học tập',
    library: 'Thư viện',
    explore: 'Khám phá',
    groups: 'Nhóm học tập',
    analytics: 'Phân tích',
    settings: 'Cài đặt',
    support: 'Hỗ trợ & Trợ giúp',
    workspace: 'Không gian làm việc',
    
    // TopBar / Profile
    upgrade_pro: 'Nâng cấp Pro',
    pro_plan: 'Gói Pro',
    free_plan: 'Gói Miễn phí',
    theme: 'Giao diện',
    light: 'Sáng',
    dark: 'Tối',
    logout: 'Đăng xuất',
    
    // Settings modal
    account_settings: 'Cài đặt tài khoản',
    subscription: 'Gói đăng ký',
    profile_info: 'Thông tin cá nhân',
    appearance: 'Giao diện',
    privacy: 'Tài khoản & Quyền riêng tư',
    username: 'Tên người dùng',
    email: 'Email',
    language: 'Ngôn ngữ',
    change_password: 'Đổi mật khẩu',
    edit: 'Chỉnh sửa',
    save: 'Lưu thay đổi',
    cancel: 'Hủy',
    
    // Password dialog
    current_password: 'Mật khẩu hiện tại',
    new_password: 'Mật khẩu mới',
    confirm_password: 'Xác nhận mật khẩu mới',
    
    // Library
    flashcards: 'Thẻ ghi nhớ',
    notes: 'Ghi chú',
    study_spaces: 'Không gian học',
    upload: 'Tải lên',
    all: 'Tất cả',
    recent: 'Gần đây',
    multiple_choice: 'Trắc nghiệm',
    situation: 'Tình huống',
    mixed: 'Hỗn hợp',
    starred: 'Đánh dấu sao',
    studying: 'Đang học',
    no_flashcards_yet: 'Chưa có bộ thẻ nào. Tải lên tài liệu trong mục Học tập để tự động tạo.',
    no_notes_yet: 'Chưa có ghi chú nào. Tải lên tài liệu trong mục Học tập để tự động tạo.',
    cards_count: 'thẻ',
    edited: 'Đã sửa',
    just_now: 'vừa xong',
    m_ago: 'phút trước',
    h_ago: 'giờ trước',
    d_ago: 'ngày trước',
    delete_confirm_title: 'Xóa tài nguyên này?',
    delete_confirm_desc: 'sẽ bị xóa vĩnh viễn khỏi tài khoản.',
    delete_btn: 'Xóa',
    make_public: 'Công khai',
    share: 'Chia sẻ',
    share_with_doc: 'Chia sẻ kèm tài liệu',
    public_with_doc: 'Công khai kèm tài liệu',
    public_with_doc_desc: 'Bất cứ ai có liên kết đều có thể xem và hỏi trợ lý AI về tài liệu.',
    only_public_set: 'Chỉ công khai nội dung',
    only_public_set_desc: 'Bất cứ ai cũng xem được thẻ/ghi chú, nhưng không thể đặt câu hỏi cho AI về tài liệu nguồn.',
    
    // Learn
    drop_docs_here: 'Thả tài liệu học tập của bạn vào đây',
    drop_docs_desc: 'Tải lên file PDF, DOCX, PPTX, TXT, hoặc Markdown để Tempo tự động tạo thẻ ghi nhớ và ghi chú Cornell.',
    choose_file: 'Chọn tệp',
    processing_doc: 'Đang xử lý tài liệu...',
    analyzing_doc: 'Đang phân tích tài liệu...',
    reading_flashcards: 'Tempo AI đang đọc tài liệu và tạo thẻ ghi nhớ...',
    reading_notes: 'Tempo AI đang đọc tài liệu và tạo ghi chú Cornell...',
    study_room_ready: 'Phòng học đã sẵn sàng!',
    opening_session: 'Đang mở phiên học...',
    learning_tracking: 'Theo dõi tiến độ',
    configure_flashcards: 'Cấu hình thẻ ghi nhớ',
    configure_notes: 'Cấu hình ghi chú Cornell',
    change_method: 'Đổi phương pháp học',
    deck_name: 'Tên bộ thẻ',
    note_name: 'Tên ghi chú',
    num_cards: 'Số lượng thẻ',
    difficulty: 'Độ khó',
    content_type: 'Loại nội dung',
    detail_level: 'Mức độ chi tiết',
    custom: 'Tùy chỉnh',
    easy: 'Dễ',
    normal: 'Thường',
    hard: 'Khó',
    less: 'tóm tắt',
    generating_fc: 'Đang tạo thẻ...',
    generate_fc: 'Tạo thẻ ghi nhớ',
    generating_notes: 'Đang tạo ghi chú...',
    generate_notes: 'Tạo ghi chú Cornell',
    todays_goal: 'Mục tiêu hôm nay',
    recent_activity: 'Hoạt động gần đây',
    study_time: 'Tổng thời gian học',
    cards_reviewed: 'Thẻ đã ôn tập',
    notes_created: 'Ghi chú đã tạo',
    exams_taken: 'Đề thi đã làm',
    avg_mastery: 'Độ tinh thông trung bình',
    weak_topics: 'Chủ đề còn yếu',
    review_overdue: 'Cần ôn tập ngay',
    improving: 'Bạn đang tiến bộ!',
    best_time: 'Thời gian học hiệu quả nhất',
    search_analytics: 'Tìm kiếm phân tích, chủ đề, phiên học...',
    search_library: 'Tìm kiếm thẻ ghi nhớ, ghi chú, phòng học...',
    search_explore: 'Tìm kiếm phòng học, ghi chú, thẻ ghi nhớ, đề thi...',
    search_groups: 'Tìm kiếm nhóm, thành viên, hoặc tài nguyên...'
  }
};

window.currentLanguage = 'en';

window.t = function(key) {
  const lang = window.currentLanguage || 'en';
  return window.translations[lang]?.[key] || key;
};

// Inject light theme CSS variables
if (typeof document !== 'undefined' && !document.getElementById('tempo-light-theme-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-light-theme-css';
  s.textContent = `
    [data-theme="light"] {
      --black:       #ffffff;
      --bg-sunken:   #f8fafc;
      --bg-base:     #ffffff;
      --surface-1:   #f1f5f9;
      --surface-2:   #e2e8f0;
      --surface-3:   #cbd5e1;
      --surface-4:   #94a3b8;

      --border-subtle: #cbd5e1;
      --border:        #e2e8f0;
      --border-strong: #94a3b8;
      --border-violet: rgba(139,92,246,0.3);

      --text-primary:   #0f172a;
      --text-secondary: #334155;
      --text-tertiary:  #64748b;
      --text-disabled:  #94a3b8;
      
      --grad-surface: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    }
    [data-theme="light"] header {
      background: rgba(248, 250, 252, 0.82) !important;
    }
    [data-theme="light"] aside {
      background: #f1f5f9 !important;
    }
  `;
  document.head.appendChild(s);
}

// Expose Supabase client globally in the app
window.supabaseClient = null;

// Tempo UI kit - app shell + routing
function parseTempoHash(hash) {
  const value = String(hash || '').replace(/^#/, '');
  const [screen, view, id] = value.split('/');
  if (screen !== 'learn' || !view || !id) return null;
  return { screen: 'learn', route: { view, id, origin: 'library', token: Date.now() } };
}

function App() {
  const [screen, setScreen] = React.useState('learn');
  const [learnRoute, setLearnRoute] = React.useState({ view: 'upload', id: null, token: 0 });
  const [initialized, setInitialized] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  const [userSettings, setUserSettings] = React.useState(null);
  const [langToken, setLangToken] = React.useState(0);

  React.useEffect(() => {
    async function initAuth() {
      try {
        const configRes = await fetch('/api/v1/auth/config');
        const configJson = await configRes.json();
        if (configJson.success && configJson.data) {
          window.supabaseClient = window.supabase.createClient(configJson.data.supabaseUrl, configJson.data.supabaseAnonKey);
          
          // Check session
          const { data: { session } } = await window.supabaseClient.auth.getSession();
          if (session) {
            // Fetch profile and settings
            const profileRes = await fetch('/api/v1/me', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            const profileJson = await profileRes.json();
            if (profileJson.success && profileJson.data) {
              setUserProfile(profileJson.data.user);
              setUserSettings(profileJson.data.settings);
              
              // Apply theme & language
              const theme = profileJson.data.settings?.theme || 'dark';
              const language = profileJson.data.settings?.language || 'en';
              document.documentElement.setAttribute('data-theme', theme);
              window.currentLanguage = language;
              window.dispatchEvent(new Event('languagechange'));
            }
          } else {
            // No session, redirect to landing page
            window.location.href = '/index.html';
            return;
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth in App:', err);
      } finally {
        setInitialized(true);
      }
    }
    initAuth();
  }, []);

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  React.useEffect(() => {
    function syncFromHash() {
      const parsed = parseTempoHash(window.location.hash);
      if (!parsed) return;
      setLearnRoute(parsed.route);
      setScreen(parsed.screen);
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  function handleOpenLearningResource(target) {
    if (!target?.view || !target?.id) return;
    const nextRoute = { view: target.view, id: target.id, origin: 'library', token: Date.now() };
    setLearnRoute(nextRoute);
    setScreen('learn');
    window.location.hash = `learn/${target.view}/${target.id}`;
  }

  function handleScreenChange(nextScreen) {
    if (nextScreen !== 'learn' && window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (nextScreen === 'learn') {
      setLearnRoute({ view: 'upload', id: null, origin: 'learn', token: Date.now() });
    }
    setScreen(nextScreen);
  }

  const t = window.t;

  const topbarByScreen = {
    learn: { ph: null, actions: null },
    analytics: { ph: t('search_analytics'), actions: <ExportBtn /> },
    library: { ph: t('search_library'), actions: null },
    explore: { ph: t('search_explore'), actions: null },
    groups: { ph: t('search_groups'), actions: null }, // Removed CreateGroupBtn from header
  };
  const tb = topbarByScreen[screen] || { ph: undefined, actions: null };

  if (!initialized) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
        <Icon name="loader-2" size={32} style={{ animation: 'spin 2s linear infinite', color: 'var(--violet-400)' }} />
      </div>
    );
  }

  let body;
  if (screen === 'learn') body = <LearnScreen key={`learn:${learnRoute.token || 0}:${learnRoute.view || 'upload'}:${learnRoute.id || 'none'}`} routeRequest={learnRoute} onNavigateScreen={handleScreenChange} />;
  else if (screen === 'analytics') body = <AnalyticsScreen />;
  else if (screen === 'library') body = <LibraryScreen onOpenResource={handleOpenLearningResource} />;
  else if (screen === 'explore') body = <ExploreScreen />;
  else if (screen === 'groups') body = <GroupsScreen />;
  else body = <Placeholder screen={screen} />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <Sidebar active={screen} onNavigate={handleScreenChange} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar 
          placeholder={tb.ph} 
          actions={tb.actions}
          userProfile={userProfile}
          userSettings={userSettings}
          setUserProfile={setUserProfile}
          setUserSettings={setUserSettings}
        />
        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div className="app-content">{body}</div>
        </main>
      </div>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-app-content-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-app-content-css';
  s.textContent = `
    .app-content {
      max-width: var(--content-max);
      width: 100%;
      margin-inline: auto;
      min-height: 100%;
    }
  `;
  document.head.appendChild(s);
}

function ExportBtn() {
  const { Button } = window.TempoDesignSystem_e112f2;
  return <Button variant="secondary" iconLeft={<Icon name="upload" size={15} />} iconRight={<Icon name="chevron-down" size={14} />}>{window.t('export') || 'Export'}</Button>;
}

function Placeholder({ screen }) {
  const labels = { learn: 'Learn', 'tempo-ai': 'Tempo AI', 'exam-gen': 'Exam Generator', import: 'Import Quizlet' };
  const icons = { learn: 'graduation-cap', 'tempo-ai': 'sparkles', 'exam-gen': 'file-check-2', import: 'download' };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-tertiary)' }}>
      <span style={{ width: 64, height: 64, borderRadius: 'var(--radius-xl)', background: 'rgba(139,92,246,0.14)', color: 'var(--violet-300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icons[screen]} size={28} /></span>
      <div style={{ font: 'var(--text-h2)', color: 'var(--text-secondary)' }}>{labels[screen]}</div>
      <p style={{ fontSize: 13 }}>This surface isn't part of the UI-kit sample. Try Analytics, Library, Explore, or Groups.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
