// Tempo UI kit - top bar (search + contextual actions)
function TopBar({ placeholder = 'Search study spaces, notes, flashcards...', actions, userProfile, userSettings, setUserProfile, setUserSettings }) {
  const { Input, IconButton, Button, Avatar } = window.TempoDesignSystem_e112f2;
  const [showPopup, setShowPopup] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showBillingPlans, setShowBillingPlans] = React.useState(false);
  const [billingInterval, setBillingInterval] = React.useState('year');
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  
  const [settingsTab, setSettingsTab] = React.useState('profile'); // 'subscription' | 'profile' | 'appearance' | 'privacy'
  const [editingUsername, setEditingUsername] = React.useState(false);
  const [editingEmail, setEditingEmail] = React.useState(false);
  
  const [usernameInput, setUsernameInput] = React.useState(userProfile?.username || '');
  const [fullNameInput, setFullNameInput] = React.useState(userProfile?.full_name || '');
  const [emailInput, setEmailInput] = React.useState(userProfile?.email || '');
  
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwLoading, setPwLoading] = React.useState(false);
  const [profileLoading, setProfileLoading] = React.useState(false);

  const [langToken, setLangToken] = React.useState(0);

  const [notifications, setNotifications] = React.useState([]);
  const [showNotif, setShowNotif] = React.useState(false);

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  React.useEffect(() => {
    if (userProfile) {
      setUsernameInput(userProfile.username || '');
      setFullNameInput(userProfile.full_name || '');
      setEmailInput(userProfile.email || '');
    }
  }, [userProfile]);

  // Safety net: if the app shell mounted without a loaded profile (e.g. the initial
  // /me call during auth bootstrap was missed), fetch it here so the header shows the
  // real account instead of the "User / @username / email" placeholders.
  React.useEffect(() => {
    if (userProfile || !window.supabaseClient || !setUserProfile) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/v1/me', { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        const json = await res.json();
        if (!cancelled && json.success && json.data?.user) {
          setUserProfile(json.data.user);
          if (json.data.settings && setUserSettings) setUserSettings(json.data.settings);
        }
      } catch (e) {
        console.error('TopBar: failed to load profile:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [userProfile]);

  const fetchNotifications = React.useCallback(async () => {
    if (!window.supabaseClient) return;
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/v1/notifications', { headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const json = await res.json();
      if (json.success) setNotifications(json.data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60000); // poll once a minute
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markNotifRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_at: n.read_at || new Date().toISOString() } : n));
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (!session) return;
      await fetch(`/api/v1/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  const notifTimeAgo = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return window.currentLanguage === 'vi' ? 'vừa xong' : 'just now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const t = window.t;

  const handleLogOut = async () => {
    if (window.supabaseClient) {
      await window.supabaseClient.auth.signOut();
      window.location.href = '/index.html';
    }
  };

  const handleToggleTheme = async (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const nextSettings = { ...userSettings, theme };
    setUserSettings(nextSettings);
    
    // Save to DB
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        await fetch('/api/v1/me/settings', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ theme })
        });
      }
    } catch (e) {
      console.error('Failed to save theme setting:', e);
    }
  };

  const handleToggleLanguage = async (language) => {
    window.currentLanguage = language;
    const nextSettings = { ...userSettings, language };
    setUserSettings(nextSettings);
    window.dispatchEvent(new Event('languagechange'));
    
    // Save to DB
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        await fetch('/api/v1/me/settings', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ language })
        });
      }
    } catch (e) {
      console.error('Failed to save language setting:', e);
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        const res = await fetch('/api/v1/me/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: fullNameInput,
            username: usernameInput
          })
        });
        const resJson = await res.json();
        if (resJson.success) {
          setUserProfile(resJson.data);
          setEditingUsername(false);
          alert(t('save_success') || 'Profile updated successfully!');
        } else {
          throw new Error(resJson.error?.message || 'Update failed');
        }
      }
    } catch (e) {
      alert('Failed to update username/name: ' + e.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    setProfileLoading(true);
    try {
      if (!window.supabaseClient) return;
      const { error } = await window.supabaseClient.auth.updateUser({ email: emailInput });
      if (error) throw error;
      
      setUserProfile(p => ({ ...p, email: emailInput }));
      setEditingEmail(false);
      alert(t('email_update_sent') || 'Email update confirmation sent. Please check both your old and new email addresses to complete the change.');
    } catch (e) {
      alert('Failed to update email: ' + e.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePwSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert(t('password_mismatch') || 'Confirm password does not match.');
      return;
    }
    setPwLoading(true);
    try {
      if (!window.supabaseClient) return;
      const { error } = await window.supabaseClient.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      alert(t('password_change_success') || 'Password updated successfully!');
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Failed to change password: ' + err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const isPro = userProfile?.plan === 'pro' || userProfile?.role === 'admin';

  const handleUpgrade = () => {
    setShowBillingPlans(true);
  };

  const handleStartCheckout = async (interval = billingInterval, endpoint = '/api/v1/billing/checkout') => {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (!session) return alert('Please log in first.');
      setCheckoutLoading(true);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interval }),
      });
      const json = await res.json();
      if (json.success && json.checkout_url) {
        setShowBillingPlans(false);
        window.open(json.checkout_url, '_blank');
      } else {
        alert(json.error || 'Failed to start checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const upgradeButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 32,
    padding: '0 12px',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 'var(--fw-semibold)',
    letterSpacing: '-0.005em',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-standard)',
    userSelect: 'none',
    background: 'var(--grad-cta)',
    color: 'var(--on-accent)',
    boxShadow: 'var(--glow-violet-sm)',
  };

  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 28px', borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, zIndex: 99, background: 'var(--bg-base)', backdropFilter: 'var(--blur-md)',
      }}>
        {placeholder && (
          <div style={{ flex: 1, maxWidth: 520 }}>
            <Input
              iconLeft={<Icon name="search" size={16} />}
              placeholder={placeholder}
              iconRight={<kbd style={{ font: 'var(--text-caption)', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 5, padding: '1px 6px' }}>/</kbd>}
            />
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          {!isPro && (
            <button
              type="button"
              onClick={handleUpgrade}
              style={upgradeButtonStyle}
            >
              <Icon name="crown" size={14} />
              {t('upgrade_pro')}
            </button>
          )}
          
          {/* Profile Button */}
          <button
            onClick={() => setShowPopup(!showPopup)}
            title={`${userProfile?.full_name || 'User'} - ${isPro ? t('pro_plan') : t('free_plan')}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '6px 10px', cursor: 'pointer', color: 'var(--text-primary)'
            }}
          >
            <Avatar name={userProfile?.full_name || 'User'} src={userProfile?.avatar_url} size="sm" ring />
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{userProfile?.full_name || 'User'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{isPro ? t('pro_plan') : t('free_plan')}</div>
            </div>
            <Icon name="chevron-down" size={14} color="var(--text-tertiary)" />
          </button>

          {/* Profile Pop-up Dropdown */}
          {showPopup && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 280, background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 14, zIndex: 100,
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <Avatar name={userProfile?.full_name || 'User'} src={userProfile?.avatar_url} size="md" ring />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.full_name || 'User'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{userProfile?.username || 'username'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.email || 'email'}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={() => { setShowPopup(false); setShowSettings(true); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Icon name="settings" size={15} color="var(--text-secondary)" />
                  {t('settings')}
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('theme')}:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleToggleTheme('light')} style={{
                      padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: (userSettings?.theme === 'light') ? 'var(--violet-500)' : 'var(--surface-3)',
                      color: (userSettings?.theme === 'light') ? '#fff' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600
                    }}>{t('light')}</button>
                    <button onClick={() => handleToggleTheme('dark')} style={{
                      padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: (userSettings?.theme === 'dark' || !userSettings?.theme) ? 'var(--violet-500)' : 'var(--surface-3)',
                      color: (userSettings?.theme === 'dark' || !userSettings?.theme) ? '#fff' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600
                    }}>{t('dark')}</button>
                  </div>
                </div>
              </div>
              
              <div style={{ height: 1, background: 'var(--border)' }} />
              
              <button onClick={handleLogOut} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                color: 'var(--danger-text)', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,88,79,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon name="log-out" size={15} color="var(--danger-text)" />
                {t('logout')}
              </button>
            </div>
          )}

          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <IconButton label="Notifications" variant="ghost" onClick={() => { setShowNotif(s => !s); if (!showNotif) fetchNotifications(); }}><Icon name="bell" /></IconButton>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999, background: 'var(--violet-500)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-base)' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}

            {showNotif && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                width: 340, maxHeight: 420, overflowY: 'auto',
                background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', zIndex: 120, color: 'var(--text-primary)'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface-2)' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>{window.currentLanguage === 'vi' ? 'Thông báo' : 'Notifications'}</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'inline-flex' }}><Icon name="x" size={15} /></button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12.5 }}>
                    {window.currentLanguage === 'vi' ? 'Chưa có thông báo nào.' : 'No notifications yet.'}
                  </div>
                ) : notifications.map(n => (
                  <button key={n.id} onClick={() => markNotifRead(n.id)} style={{
                    display: 'flex', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
                    padding: '11px 16px', border: 'none', borderBottom: '1px solid var(--border)',
                    background: n.read_at ? 'transparent' : 'rgba(139,92,246,0.07)'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read_at ? 'transparent' : 'rgba(139,92,246,0.07)'}>
                    <span style={{ flex: '0 0 auto', marginTop: 2, color: 'var(--violet-300)' }}>
                      <Icon name={n.type === 'resource_imported' ? 'download' : n.type === 'resource_shared' ? 'share-2' : 'bell'} size={15} />
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 1 }}>{n.message}</span>
                      <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 3 }}>{notifTimeAgo(n.created_at)}</span>
                    </span>
                    {!n.read_at && <span style={{ flex: '0 0 auto', width: 7, height: 7, borderRadius: 999, background: 'var(--violet-500)', marginTop: 5 }} />}
                  </button>
                ))}
              </div>
            )}
          </span>
          {actions}
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(4,6,11,0.65)', backdropFilter: 'var(--blur-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            width: 720, height: 500, background: 'var(--surface-1)',
            border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)', display: 'flex', overflow: 'hidden'
          }}>
            {/* Sidebar */}
            <div style={{ width: 220, borderRight: '1px solid var(--border)', background: 'var(--bg-sunken)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', padding: '0 8px', marginBottom: 12 }}>{t('account_settings')}</h3>
              {[
                { id: 'subscription', label: t('subscription'), icon: 'crown' },
                { id: 'profile', label: t('profile_info'), icon: 'user' },
                { id: 'appearance', label: t('appearance'), icon: 'palette' },
                { id: 'privacy', label: t('privacy'), icon: 'lock' }
              ].map(tabItem => (
                <button
                  key={tabItem.id}
                  onClick={() => setSettingsTab(tabItem.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
                    background: settingsTab === tabItem.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                    color: settingsTab === tabItem.id ? 'var(--violet-300)' : 'var(--text-secondary)',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <Icon name={tabItem.icon} size={15} />
                  {tabItem.label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <Button variant="ghost" style={{ width: '100%' }} onClick={() => setShowSettings(false)}>{t('cancel')}</Button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {settingsTab === 'subscription' && t('subscription')}
                  {settingsTab === 'profile' && t('profile_info')}
                  {settingsTab === 'appearance' && t('appearance')}
                  {settingsTab === 'privacy' && t('privacy')}
                </h4>
                <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                  <Icon name="x" size={18} />
                </button>
              </div>

              {/* Tab: Subscription */}
              {settingsTab === 'subscription' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Current Status:</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--violet-300)', marginTop: 4 }}>
                      {isPro ? t('pro_plan') : t('free_plan')}
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.45 }}>
                      {isPro 
                        ? 'Thank you for supporting Tempo AI! You have unlimited uploads and access to advanced AI generation features.'
                        : 'Upgrade to Tempo Pro to get unlimited document uploads, larger context windows, and advanced Cornell Notes.'
                      }
                    </p>
                  </div>
                  {!isPro && (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      style={{ ...upgradeButtonStyle, height: 40, width: '100%' }}
                    >
                      <Icon name="crown" size={15} />
                      {t('upgrade_pro')}
                    </button>
                  )}
                </div>
              )}

              {/* Tab: Profile */}
              {settingsTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Avatar section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                    <Avatar name={userProfile?.full_name || 'User'} src={userProfile?.avatar_url} size="lg" ring />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{userProfile?.full_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Set your profile details below.</div>
                    </div>
                  </div>

                  {/* Username & Full Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{t('username')} / Full Name</span>
                        {!editingUsername && (
                          <button onClick={() => setEditingUsername(true)} style={{ background: 'transparent', border: 'none', color: 'var(--violet-400)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {t('edit')}
                          </button>
                        )}
                      </div>
                      
                      {editingUsername ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Input placeholder="Full Name" value={fullNameInput} onChange={e => setFullNameInput(e.target.value)} />
                          <Input placeholder="Username" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingUsername(false); setUsernameInput(userProfile?.username || ''); setFullNameInput(userProfile?.full_name || ''); }}>{t('cancel')}</Button>
                            <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={profileLoading}>{t('save')}</Button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-primary)' }}>
                          {userProfile?.full_name} (@{userProfile?.username})
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{t('email')}</span>
                        {!editingEmail && (
                          <button onClick={() => setEditingEmail(true)} style={{ background: 'transparent', border: 'none', color: 'var(--violet-400)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {t('edit')}
                          </button>
                        )}
                      </div>
                      
                      {editingEmail ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Input placeholder="Email Address" type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingEmail(false); setEmailInput(userProfile?.email || ''); }}>{t('cancel')}</Button>
                            <Button variant="primary" size="sm" onClick={handleSaveEmail} disabled={profileLoading}>{t('save')}</Button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-primary)' }}>
                          {userProfile?.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Appearance */}
              {settingsTab === 'appearance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{t('theme')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { id: 'light', label: t('light'), icon: 'sun' },
                        { id: 'dark', label: t('dark'), icon: 'moon' }
                      ].map(themeOption => (
                        <button
                          key={themeOption.id}
                          onClick={() => handleToggleTheme(themeOption.id)}
                          style={{
                            flex: 1, padding: '16px', borderRadius: 'var(--radius-lg)',
                            border: '1px solid',
                            borderColor: userSettings?.theme === themeOption.id ? 'var(--violet-500)' : 'var(--border)',
                            background: userSettings?.theme === themeOption.id ? 'rgba(139,92,246,0.1)' : 'var(--surface-2)',
                            color: userSettings?.theme === themeOption.id ? 'var(--violet-300)' : 'var(--text-primary)',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                          }}
                        >
                          <Icon name={themeOption.icon} size={20} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{themeOption.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{t('language')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { id: 'en', label: 'English' },
                        { id: 'vi', label: 'Tiếng Việt (Vietnamese)' }
                      ].map(langOption => (
                        <button
                          key={langOption.id}
                          onClick={() => handleToggleLanguage(langOption.id)}
                          style={{
                            flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                            border: '1px solid',
                            borderColor: userSettings?.language === langOption.id ? 'var(--violet-500)' : 'var(--border)',
                            background: userSettings?.language === langOption.id ? 'rgba(139,92,246,0.1)' : 'var(--surface-2)',
                            color: userSettings?.language === langOption.id ? 'var(--violet-300)' : 'var(--text-primary)',
                            cursor: 'pointer', fontSize: 13, fontWeight: 600
                          }}
                        >
                          {langOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Privacy */}
              {settingsTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t('change_password')}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Update your account security credentials.</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setShowChangePassword(true)}>{t('edit')}</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showBillingPlans && ReactDOM.createPortal(
        <BillingPlansModal
          yearly={billingInterval === 'year'}
          checkoutLoading={checkoutLoading}
          isPro={isPro}
          onClose={() => {
            if (!checkoutLoading) setShowBillingPlans(false);
          }}
          onSelectInterval={(isYearly) => setBillingInterval(isYearly ? 'year' : 'month')}
          onChoosePlan={() => handleStartCheckout(billingInterval)}
          onChooseQrPlan={() => handleStartCheckout(billingInterval, '/api/v1/billing/payos/checkout')}
        />,
        document.body
      )}

      {/* Change Password Dialog */}
      {showChangePassword && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(4,6,11,0.7)', backdropFilter: 'var(--blur-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form onSubmit={handleChangePwSubmit} style={{
            width: 400, background: 'var(--surface-1)',
            border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h4 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{t('change_password')}</h4>
              <button type="button" onClick={() => setShowChangePassword(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <Icon name="x" size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t('current_password')}</label>
                <Input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t('new_password')}</label>
                <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t('confirm_password')}</label>
                <Input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button type="button" variant="ghost" onClick={() => setShowChangePassword(false)}>{t('cancel')}</Button>
              <Button type="submit" variant="primary" disabled={pwLoading}>{t('save')}</Button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </>
  );
}

function BillingPlansModal({ yearly, checkoutLoading, isPro, onClose, onSelectInterval, onChoosePlan, onChooseQrPlan }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !checkoutLoading) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [checkoutLoading, onClose]);

  const toggleStyle = (active) => ({
    padding: '7px 18px',
    borderRadius: 'var(--radius-pill)',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    background: active ? 'var(--violet-500)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    transition: 'var(--t-colors)',
  });

  return (
    <div
      onClick={() => {
        if (!checkoutLoading) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 260,
        background: 'rgba(4,6,11,0.72)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(960px, 100%)',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: '28px 28px 32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ls-wider)', color: 'var(--violet-400)', marginBottom: 10 }}>
              Pricing
            </div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.05, color: 'var(--text-primary)' }}>
              Choose the right Tempo plan
            </h3>
            <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', font: 'var(--text-body-lg)' }}>
              Compare Free and Pro, then continue to Polar checkout when you are ready.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={checkoutLoading}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: checkoutLoading ? 'wait' : 'pointer' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)', padding: 3, marginBottom: 28,
        }}>
          <button type="button" onClick={() => onSelectInterval(false)} style={toggleStyle(!yearly)}>Monthly</button>
          <button type="button" onClick={() => onSelectInterval(true)} style={toggleStyle(yearly)}>
            Yearly
            <span style={{
              marginLeft: 6, padding: '2px 8px',
              background: 'rgba(63,209,128,0.18)', color: 'var(--success-text)',
              borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700,
            }}>-29%</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <BillingPlanCard
            name="Free"
            desc="Perfect for getting started"
            price="0"
            unit="/month"
            buttonLabel={!isPro ? 'Current plan' : 'Available'}
            buttonVariant="outline"
            buttonDisabled
            features={[
              { text: '50 flashcards per week', included: true },
              { text: '5 notes per week', included: true },
              { text: 'Upload DOCX files only (max 3 MB)', included: true },
              { text: '10 Tempo Assistant uses', included: true },
              { text: 'Basic study analytics', included: true },
              { text: '24/7 priority support', included: false },
              { text: 'Unlimited flashcards & notes', included: false },
              { text: 'PDF & PPTX upload', included: false },
            ]}
          />
          <BillingPlanCard
            name="Pro"
            desc="For serious students"
            price={yearly ? '25,000' : '35,000'}
            unit="đ/month"
            yearlyNote={yearly ? 'Billed 299,000đ/year' : null}
            originalPrice={yearly ? '35,000' : null}
            popular
            buttonLabel={checkoutLoading ? 'Connecting to Polar...' : (isPro ? 'Manage current plan' : 'Choose the Plan')}
            buttonVariant="gradient"
            buttonDisabled={checkoutLoading}
            onButtonClick={onChoosePlan}
            secondaryButtonLabel={checkoutLoading ? 'Please wait...' : 'Thanh toán QR ngân hàng 🇻🇳'}
            onSecondaryButtonClick={onChooseQrPlan}
            features={[
              { text: 'Unlimited flashcards & notes', included: true },
              { text: 'Unlimited Tempo Assistant', included: true },
              { text: 'Upload DOCX, PDF, PPTX (max 10 MB)', included: true },
              { text: '24/7 priority support', included: true },
              { text: 'Advanced analytics & insights', included: true },
              { text: 'Study groups & collaboration', included: true },
              { text: 'Export & share materials', included: true },
              { text: 'Early access to new features', included: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function BillingPlanCard({ name, desc, price, unit, yearlyNote, originalPrice, popular, buttonLabel, buttonVariant, buttonDisabled, onButtonClick, secondaryButtonLabel, onSecondaryButtonClick, features }) {
  const isGradient = buttonVariant === 'gradient';
  return (
    <div style={{
      position: 'relative',
      background: popular ? 'var(--surface-2)' : 'var(--surface-1)',
      border: `1.5px solid ${popular ? 'var(--violet-500)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: '32px 28px',
      boxShadow: popular ? '0 0 0 1px var(--violet-600), 0 20px 60px -16px rgba(139,92,246,0.32)' : 'var(--shadow-sm)',
    }}>
      {popular && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          padding: '5px 18px', borderRadius: 'var(--radius-pill)',
          background: 'var(--grad-brand)', color: '#fff',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
          whiteSpace: 'nowrap', boxShadow: 'var(--glow-violet-sm)',
        }}>Most popular</div>
      )}

      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)', margin: '0 0 4px' }}>{name}</h4>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px' }}>{desc}</p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        {originalPrice && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{originalPrice}</span>
        )}
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{price}</span>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-tertiary)' }}>{unit}</span>
      </div>
      {yearlyNote && (
        <p style={{ fontSize: 13, color: 'var(--violet-300)', fontWeight: 500, margin: '4px 0 0' }}>{yearlyNote}</p>
      )}

      <button
        type="button"
        onClick={onButtonClick}
        disabled={buttonDisabled}
        style={{
          width: '100%', height: 48, marginTop: 24, marginBottom: 28,
          background: isGradient ? 'var(--grad-brand)' : 'transparent',
          color: isGradient ? '#fff' : 'var(--text-primary)',
          border: isGradient ? 'none' : '1.5px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15,
          cursor: buttonDisabled ? 'not-allowed' : 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isGradient ? '0 8px 28px -6px rgba(139,92,246,0.45)' : 'none',
          opacity: buttonDisabled ? 0.7 : 1,
        }}
      >
        {buttonLabel}
      </button>

      {secondaryButtonLabel && (
        <button
          type="button"
          onClick={onSecondaryButtonClick}
          disabled={buttonDisabled}
          style={{
            width: '100%', height: 42, marginTop: -18, marginBottom: 28,
            background: 'transparent', color: 'var(--text-primary)',
            border: '1.5px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s ease',
            opacity: buttonDisabled ? 0.7 : 1,
          }}
        >
          {secondaryButtonLabel}
        </button>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.45 }}>
            <span style={{
              width: 20, height: 20, flex: '0 0 20px', borderRadius: '50%', marginTop: 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: f.included ? 'rgba(63,209,128,0.15)' : 'rgba(100,108,126,0.12)',
              color: f.included ? 'var(--success-text)' : 'var(--text-disabled)',
            }}>
              <i data-lucide={f.included ? 'check' : 'x'} style={{ width: 12, height: 12 }}></i>
            </span>
            <span style={{ color: f.included ? 'var(--text-primary)' : 'var(--text-disabled)' }}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

Object.assign(window, { TopBar });
