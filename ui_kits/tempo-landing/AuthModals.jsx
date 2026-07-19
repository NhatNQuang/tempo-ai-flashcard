function LucideIcon({ name, size = 16, style }) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
  };

  const paths = {
    x: (
      <>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    'eye-off': (
      <>
        <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.1" />
        <path d="M6.6 6.7C3.6 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.5" />
        <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
        <path d="M3 3l18 18" />
      </>
    ),
    'arrow-right': (
      <>
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
      </>
    ),
  };

  return (
    <svg {...iconProps}>
      {paths[name] || paths.x}
    </svg>
  );
}

// Tempo landing - Login & Sign-up modals

function AuthModal({ mode, onClose, onSwitch }) {
  const isLogin = mode === 'login';
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleGoogleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!window.supabaseClient) {
      toast({ body: 'Dịch vụ xác thực đang khởi tạo. Vui lòng thử lại sau giây lát.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/ui_kits/tempo-app/index.html'
        }
      });
      if (error) throw error;
    } catch (err) {
      toast({ body: 'Đăng nhập Google thất bại: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.supabaseClient) {
      toast({ body: 'Dịch vụ xác thực đang khởi tạo. Vui lòng thử lại sau.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        window.location.href = '/ui_kits/tempo-app/index.html';
      } else {
        const { data, error } = await window.supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              full_name: username
            }
          }
        });
        if (error) throw error;

        if (data.session) {
          window.location.href = '/ui_kits/tempo-app/index.html';
        } else {
          toast({ body: 'Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.', type: 'success', autoHideDuration: 8000 });
          setLoading(false);
        }
      }
    } catch (err) {
      toast({ body: 'Xác thực thất bại: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const inputWrap = {
    display: 'flex', flexDirection: 'column', gap: 6,
  };
  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)',
  };
  const inputStyle = {
    height: 44, padding: '0 14px',
    background: 'var(--surface-2)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    width: '100%', boxSizing: 'border-box',
  };
  const inputFocus = (e) => { e.target.style.borderColor = 'var(--violet-500)'; e.target.style.boxShadow = 'var(--glow-focus)'; };
  const inputBlur  = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4,6,11,0.72)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onMouseDown={e => e.stopPropagation()} style={{
        width: 440, maxHeight: '90vh', overflow: 'auto',
        background: 'var(--surface-1)', border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
        padding: '36px 32px 32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button onClick={onClose} style={{
            width: 32, height: 32, background: 'transparent', border: 'none',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name="x" size={18} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="../../assets/logo.png" alt="Tempo" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', marginBottom: 16 }} />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26,
            color: 'var(--text-primary)', margin: '0 0 6px',
          }}>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            {isLogin ? 'Sign in to continue learning with Tempo' : 'Start your learning journey with Tempo'}
          </p>
        </div>

        <button onClick={handleGoogleLogin} style={{
          width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'var(--surface-2)', color: 'var(--text-primary)',
          border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14.5,
          cursor: 'pointer', transition: 'var(--t-colors), transform 0.12s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={inputWrap}>
            <label style={labelStyle}>Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', display: 'flex' }}>
                <LucideIcon name="mail" size={16} />
              </span>
              <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 40 }} onFocus={inputFocus} onBlur={inputBlur} required />
            </div>
          </div>

          {!isLogin && (
            <div style={inputWrap}>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', display: 'flex' }}>
                  <LucideIcon name="user" size={16} />
                </span>
                <input type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 40 }} onFocus={inputFocus} onBlur={inputBlur} required />
              </div>
            </div>
          )}

          <div style={inputWrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Password</label>
              {isLogin && (
                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12.5, color: 'var(--violet-400)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', display: 'flex' }}>
                <LucideIcon name="lock" size={16} />
              </span>
              <input type={showPw ? 'text' : 'password'} placeholder={isLogin ? 'Enter your password' : 'Create a password'} value={password} onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 40, paddingRight: 42 }} onFocus={inputFocus} onBlur={inputBlur} required />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                width: 34, height: 34, background: 'transparent', border: 'none',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)',
              }}>
                <LucideIcon name={showPw ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', height: 48, marginTop: 4,
            background: 'var(--grad-brand)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
            boxShadow: '0 6px 24px -6px rgba(139,92,246,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 32px -6px rgba(139,92,246,0.6)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px -6px rgba(139,92,246,0.45)'; }}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                {isLogin ? 'Sign in' : 'Create account'}
                <LucideIcon name="arrow-right" size={16} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 22 }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }}
            style={{ color: 'var(--violet-400)', fontWeight: 600, textDecoration: 'none' }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

Object.assign(window, { AuthModal, GoogleIcon, LucideIcon });
