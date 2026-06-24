/* @ds-bundle: {"format":3,"namespace":"TempoDesignSystem_e112f2","components":[{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"ProgressRing","sourcePath":"components/data/ProgressRing.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/display/AvatarGroup.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Chip","sourcePath":"components/navigation/Chip.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/data/ProgressBar.jsx":"d7f3e6f2c20e","components/data/ProgressRing.jsx":"2a0eafe35276","components/data/StatTile.jsx":"75db1359b852","components/display/Avatar.jsx":"083e8938a74a","components/display/AvatarGroup.jsx":"9fa7b55d3223","components/display/Badge.jsx":"f367caf1f18e","components/display/Card.jsx":"b6d77995623b","components/forms/Button.jsx":"dbc7b05e0189","components/forms/IconButton.jsx":"9dd3056d6a10","components/forms/Input.jsx":"5f23d0990294","components/forms/Switch.jsx":"26ed15608c1a","components/navigation/Chip.jsx":"ff8ae094ac5a","components/navigation/NavItem.jsx":"9115995e0bd4","components/navigation/Tabs.jsx":"2156b4c52f38","ui_kits/tempo-app/AnalyticsScreen.jsx":"d362e82ec060","ui_kits/tempo-app/App.jsx":"ffcead638b0b","ui_kits/tempo-app/ExploreScreen.jsx":"27ec466dcaa1","ui_kits/tempo-app/GroupsScreen.jsx":"e1ca2ed5d7b4","ui_kits/tempo-app/LibraryScreen.jsx":"383522fe4c5f","ui_kits/tempo-app/Sidebar.jsx":"b139f075b56e","ui_kits/tempo-app/TopBar.jsx":"bad552b96db3","ui_kits/tempo-app/data.jsx":"0df1bcd88fcb","ui_kits/tempo-app/helpers.jsx":"b6612e6109d6"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TempoDesignSystem_e112f2 = window.TempoDesignSystem_e112f2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo ProgressBar — thin horizontal progress (read %, studied %, mastery).
 */
function ProgressBar({
  value = 0,
  height = 6,
  color = 'var(--violet-500)',
  trackColor = 'var(--surface-4)',
  gradient = true,
  rounded = true,
  style,
  ...rest
}) {
  const v = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'block',
      width: '100%',
      height,
      background: trackColor,
      borderRadius: rounded ? 999 : 0,
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: '100%',
      width: `${v}%`,
      background: gradient ? 'linear-gradient(90deg, var(--indigo-500), var(--violet-400))' : color,
      borderRadius: rounded ? 999 : 0,
      transition: 'width var(--dur-slower) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressRing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo ProgressRing — circular mastery / completion indicator with a
 * centered value. Stroke color follows the value by default (red→amber→green→violet)
 * or can be set explicitly.
 */
function autoColor(v) {
  if (v >= 80) return 'var(--violet-400)';
  if (v >= 65) return 'var(--success)';
  if (v >= 50) return 'var(--warning)';
  return 'var(--danger)';
}
function ProgressRing({
  value = 0,
  size = 64,
  thickness = 6,
  color,
  trackColor = 'var(--surface-4)',
  label,
  showValue = true,
  style,
  ...rest
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const stroke = color || autoColor(v);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: size,
      height: size,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: trackColor,
    strokeWidth: thickness
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: stroke,
    strokeWidth: thickness,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - v / 100),
    style: {
      transition: 'stroke-dashoffset var(--dur-slower) var(--ease-out)'
    }
  })), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.28,
      color: 'var(--text-primary)',
      lineHeight: 1
    }
  }, Math.round(v), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.16
    }
  }, "%")), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.13,
      color: 'var(--text-tertiary)',
      marginTop: 2
    }
  }, label)));
}
Object.assign(__ds_scope, { ProgressRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressRing.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo StatTile — big KPI number with label, trend delta and optional icon.
 * The Analytics overview row is a grid of these.
 */
function StatTile({
  label,
  value,
  delta,
  // e.g. "+18%"
  trend = 'up',
  // 'up' | 'down' | 'flat'
  caption,
  // e.g. "vs May 5 – May 18"
  icon,
  iconTone = 'violet',
  style,
  ...rest
}) {
  const tones = {
    violet: {
      bg: 'rgba(139,92,246,0.14)',
      fg: 'var(--violet-300)'
    },
    blue: {
      bg: 'var(--info-soft)',
      fg: 'var(--info-text)'
    },
    green: {
      bg: 'var(--success-soft)',
      fg: 'var(--success-text)'
    },
    amber: {
      bg: 'var(--warning-soft)',
      fg: 'var(--warning-text)'
    }
  };
  const it = tones[iconTone] || tones.violet;
  const trendColor = trend === 'down' ? 'var(--danger-text)' : trend === 'flat' ? 'var(--text-tertiary)' : 'var(--success-text)';
  const arrow = trend === 'down' ? '▾' : trend === 'flat' ? '–' : '▴';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-md)',
      background: it.bg,
      color: it.fg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 34px'
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: '-0.02em',
      color: 'var(--text-primary)',
      lineHeight: 1
    }
  }, value), (delta || caption) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      color: trendColor,
      fontWeight: 700
    }
  }, arrow, " ", delta), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, caption)));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Avatar — user image with initials fallback, optional ring & verified badge.
 */
const SIZES = {
  xs: 22,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56
};
function hashHue(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}
function Avatar({
  src,
  name = '',
  size = 'md',
  ring = false,
  status,
  // 'online' | 'offline' | undefined
  verified = false,
  style,
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const hue = hashHue(name);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: `0 0 ${d}px`,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: d,
      height: d,
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: src ? 'var(--surface-3)' : `linear-gradient(135deg, hsl(${hue} 60% 42%), hsl(${(hue + 40) % 360} 60% 30%))`,
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: d * 0.4,
      letterSpacing: '-0.02em',
      border: ring ? '2px solid var(--violet-500)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: ring ? 'var(--glow-violet-sm)' : 'none'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials), status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: Math.max(8, d * 0.28),
      height: Math.max(8, d * 0.28),
      borderRadius: '50%',
      background: status === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
      border: '2px solid var(--bg-base)'
    }
  }), verified && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -3,
      top: -3,
      width: Math.max(12, d * 0.36),
      height: Math.max(12, d * 0.36),
      borderRadius: '50%',
      background: 'var(--info)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid var(--bg-base)',
      fontSize: d * 0.2,
      fontWeight: 900
    }
  }, "\u2713"));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/AvatarGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo AvatarGroup — overlapping avatar stack with a "+N" overflow chip.
 */
function AvatarGroup({
  users = [],
  size = 'sm',
  max = 4,
  style,
  ...rest
}) {
  const dims = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56
  };
  const d = dims[size] || dims.sm;
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  const overlap = Math.round(d * 0.32);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      ...style
    }
  }, rest), shown.map((u, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      marginLeft: i === 0 ? 0 : -overlap,
      borderRadius: '50%',
      boxShadow: '0 0 0 2px var(--bg-base)',
      zIndex: shown.length - i
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    src: u.src,
    name: u.name,
    size: size
  }))), extra > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: -overlap,
      zIndex: 0,
      width: d,
      height: d,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-3)',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: d * 0.34,
      boxShadow: '0 0 0 2px var(--bg-base)'
    }
  }, "+", extra));
}
Object.assign(__ds_scope, { AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/AvatarGroup.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Badge — compact status / level pill. Used for note levels
 * (DETAILED / NORMAL / BASIC), visibility (PUBLIC / PRIVATE / SHARED),
 * counts, and "Pro" markers.
 */
const TONES = {
  violet: {
    fg: 'var(--violet-300)',
    bg: 'rgba(139,92,246,0.16)',
    bd: 'rgba(139,92,246,0.35)',
    solid: 'var(--violet-500)'
  },
  blue: {
    fg: 'var(--info-text)',
    bg: 'var(--info-soft)',
    bd: 'rgba(91,157,248,0.35)',
    solid: 'var(--info)'
  },
  green: {
    fg: 'var(--success-text)',
    bg: 'var(--success-soft)',
    bd: 'rgba(63,209,128,0.35)',
    solid: 'var(--success)'
  },
  amber: {
    fg: 'var(--warning-text)',
    bg: 'var(--warning-soft)',
    bd: 'rgba(246,178,60,0.35)',
    solid: 'var(--warning)'
  },
  red: {
    fg: 'var(--danger-text)',
    bg: 'var(--danger-soft)',
    bd: 'rgba(240,88,79,0.35)',
    solid: 'var(--danger)'
  },
  neutral: {
    fg: 'var(--text-secondary)',
    bg: 'var(--surface-3)',
    bd: 'var(--border)',
    solid: 'var(--surface-4)'
  }
};
function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  uppercase = false,
  dot = false,
  icon,
  style,
  children,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const sizes = {
    sm: {
      fs: 10.5,
      pad: '2px 7px',
      h: 18,
      ls: '0.04em'
    },
    md: {
      fs: 11,
      pad: '3px 9px',
      h: 22,
      ls: '0.03em'
    },
    lg: {
      fs: 12,
      pad: '4px 11px',
      h: 26,
      ls: '0.02em'
    }
  };
  const s = sizes[size];
  const skin = variant === 'solid' ? {
    background: t.solid,
    color: '#fff',
    border: '1px solid transparent'
  } : variant === 'outline' ? {
    background: 'transparent',
    color: t.fg,
    border: `1px solid ${t.bd}`
  } : {
    background: t.bg,
    color: t.fg,
    border: `1px solid ${t.bd}`
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: s.h,
      padding: s.pad,
      font: 'var(--text-caption)',
      fontSize: s.fs,
      fontWeight: 'var(--fw-bold)',
      letterSpacing: uppercase ? '0.06em' : s.ls,
      textTransform: uppercase ? 'uppercase' : 'none',
      borderRadius: 'var(--radius-xs)',
      whiteSpace: 'nowrap',
      lineHeight: 1,
      ...skin,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'currentColor',
      flex: '0 0 6px'
    }
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Card — the core surface container. Default dark panel with hairline
 * border; optional hover lift and accent glow for interactive cards.
 */
function Card({
  interactive = false,
  glow = false,
  padding = 'md',
  as = 'div',
  style,
  children,
  onClick,
  ...rest
}) {
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)'
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onClick: onClick,
    className: interactive ? 'tempo-card tempo-card--interactive' : 'tempo-card',
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--card-radius)',
      padding: pads[padding],
      boxShadow: glow ? 'var(--glow-violet-sm)' : 'var(--shadow-sm)',
      cursor: interactive ? 'pointer' : undefined,
      transition: 'var(--t-colors), transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-card-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-card-kf';
  s.textContent = `.tempo-card--interactive:hover{transform:translateY(-2px);border-color:var(--border-strong);box-shadow:var(--shadow-md)}
  .tempo-card--interactive:active{transform:translateY(0)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Button — violet-primary CTA and its quieter siblings.
 */
function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  style,
  children,
  ...rest
}) {
  const heights = {
    sm: 32,
    md: 40,
    lg: 48
  };
  const pads = {
    sm: '0 12px',
    md: '0 16px',
    lg: '0 22px'
  };
  const fontSizes = {
    sm: 13,
    md: 14,
    lg: 15
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: heights[size],
    padding: pads[size],
    width: fullWidth ? '100%' : undefined,
    fontFamily: 'var(--font-sans)',
    fontSize: fontSizes[size],
    fontWeight: 'var(--fw-semibold)',
    letterSpacing: '-0.005em',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-standard)',
    userSelect: 'none'
  };
  const variants = {
    primary: {
      background: 'var(--grad-cta)',
      color: 'var(--on-accent)',
      boxShadow: 'var(--glow-violet-sm)'
    },
    secondary: {
      background: 'var(--surface-2)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--violet-300)',
      borderColor: 'var(--border-violet)'
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled || loading,
    onClick: onClick,
    className: "tempo-btn",
    "data-variant": variant,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && iconLeft, children, !loading && iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff',
      display: 'inline-block',
      animation: 'tempo-spin 0.7s linear infinite'
    }
  });
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-btn-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-btn-kf';
  s.textContent = `@keyframes tempo-spin{to{transform:rotate(360deg)}}
  .tempo-btn[data-variant="primary"]:hover:not(:disabled){filter:brightness(1.08);box-shadow:var(--glow-violet)}
  .tempo-btn[data-variant="primary"]:active:not(:disabled){transform:translateY(1px) scale(0.99)}
  .tempo-btn[data-variant="secondary"]:hover:not(:disabled){background:var(--surface-3);border-color:var(--border-strong)}
  .tempo-btn[data-variant="secondary"]:active:not(:disabled){transform:translateY(1px)}
  .tempo-btn[data-variant="ghost"]:hover:not(:disabled){background:var(--surface-2);color:var(--text-primary)}
  .tempo-btn[data-variant="outline"]:hover:not(:disabled){background:var(--violet-900);border-color:var(--violet-600)}
  .tempo-btn[data-variant="danger"]:hover:not(:disabled){filter:brightness(1.08)}
  .tempo-btn:active:not(:disabled){transform:translateY(1px)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo IconButton — square icon-only control for toolbars, card menus, nav.
 */
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  active = false,
  disabled = false,
  onClick,
  style,
  children,
  ...rest
}) {
  const dims = {
    sm: 30,
    md: 36,
    lg: 42
  };
  const d = dims[size];
  const variants = {
    ghost: {
      background: active ? 'var(--surface-3)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: '1px solid transparent'
    },
    solid: {
      background: 'var(--surface-2)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)'
    },
    accent: {
      background: 'var(--violet-900)',
      color: 'var(--violet-300)',
      border: '1px solid var(--border-violet)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    className: "tempo-iconbtn",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      flex: `0 0 ${d}px`,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out)',
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-iconbtn-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-iconbtn-kf';
  s.textContent = `.tempo-iconbtn:hover:not(:disabled){background:var(--surface-3);color:var(--text-primary)}
  .tempo-iconbtn:active:not(:disabled){transform:scale(0.92)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Input — text field with optional leading icon and search styling.
 */
function Input({
  size = 'md',
  iconLeft,
  iconRight,
  invalid = false,
  disabled = false,
  fullWidth = true,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  onChange,
  style,
  ...rest
}) {
  const heights = {
    sm: 34,
    md: 40,
    lg: 46
  };
  const h = heights[size];
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      width: fullWidth ? '100%' : undefined,
      padding: '0 12px',
      background: 'var(--surface-2)',
      border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--violet-500)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--glow-focus)' : 'none',
      opacity: disabled ? 0.5 : 1,
      transition: 'var(--t-colors), box-shadow var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--text-tertiary)',
      flex: '0 0 auto'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14
    }
  }, rest)), iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--text-tertiary)',
      flex: '0 0 auto'
    }
  }, iconRight));
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-input-ph')) {
  const s = document.createElement('style');
  s.id = 'tempo-input-ph';
  s.textContent = `.tempo-input-ph input::placeholder{color:var(--text-tertiary)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Switch — toggle for settings and filters (e.g. "Verified only").
 */
function Switch({
  checked,
  defaultChecked = false,
  disabled = false,
  size = 'md',
  onChange,
  label,
  style,
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [on, setOn] = React.useState(defaultChecked);
  const val = isControlled ? checked : on;
  const dims = size === 'sm' ? {
    w: 34,
    h: 20,
    k: 14
  } : {
    w: 42,
    h: 24,
    k: 18
  };
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setOn(v => !v);
    onChange && onChange(!val);
  };
  const track = /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": val,
    onClick: toggle,
    style: {
      position: 'relative',
      display: 'inline-block',
      width: dims.w,
      height: dims.h,
      flex: `0 0 ${dims.w}px`,
      borderRadius: 999,
      background: val ? 'var(--violet-500)' : 'var(--surface-4)',
      boxShadow: val ? 'var(--glow-violet-sm)' : 'var(--inner-hair)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: (dims.h - dims.k) / 2,
      left: val ? dims.w - dims.k - (dims.h - dims.k) / 2 : (dims.h - dims.k) / 2,
      width: dims.k,
      height: dims.k,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      transition: 'left var(--dur-base) var(--ease-spring)'
    }
  }));
  if (!label) return /*#__PURE__*/React.createElement("span", _extends({
    style: style
  }, rest), track);
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), track, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-md)',
      color: 'var(--text-secondary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Chip — selectable filter pill (Explore tabs, subject filters).
 */
function Chip({
  selected = false,
  icon,
  onClick,
  size = 'md',
  style,
  children,
  ...rest
}) {
  const sizes = {
    sm: {
      h: 28,
      fs: 12.5,
      pad: '0 12px'
    },
    md: {
      h: 34,
      fs: 13.5,
      pad: '0 16px'
    }
  };
  const s = sizes[size];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    className: "tempo-chip",
    "data-selected": selected ? 'true' : 'false',
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      height: s.h,
      padding: s.pad,
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)',
      fontSize: s.fs,
      fontWeight: 600,
      cursor: 'pointer',
      background: selected ? 'var(--violet-500)' : 'var(--surface-2)',
      color: selected ? '#fff' : 'var(--text-secondary)',
      border: `1px solid ${selected ? 'transparent' : 'var(--border)'}`,
      boxShadow: selected ? 'var(--glow-violet-sm)' : 'none',
      transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), icon, children);
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-chip-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-chip-kf';
  s.textContent = `.tempo-chip[data-selected="false"]:hover{background:var(--surface-3);color:var(--text-primary);border-color:var(--border-strong)}
  .tempo-chip:active{transform:scale(0.96)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Chip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo NavItem — a row in the workspace sidebar. Active state shows a violet
 * tint, left accent bar, and brightened label.
 */
function NavItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    className: "tempo-navitem",
    "data-active": active ? 'true' : 'false',
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '9px 12px',
      background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
      border: '1px solid',
      borderColor: active ? 'var(--border-violet)' : 'transparent',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: active ? 600 : 500,
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      transition: 'var(--t-colors)',
      ...style
    }
  }, rest), active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -1,
      top: 9,
      bottom: 9,
      width: 3,
      borderRadius: 2,
      background: 'var(--grad-cta)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 18,
      height: 18,
      color: active ? 'var(--violet-300)' : 'var(--text-tertiary)',
      flex: '0 0 18px'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      background: 'var(--violet-500)',
      color: '#fff'
    }
  }, badge));
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-navitem-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-navitem-kf';
  s.textContent = `.tempo-navitem[data-active="false"]:hover{background:var(--surface-2);color:var(--text-primary)}
  .tempo-navitem[data-active="false"]:hover span:first-of-type{color:var(--text-secondary)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tempo Tabs — underline tab bar (Overview / Study Spaces / Flashcards …).
 * Controlled via `value`/`onChange` or uncontrolled with `defaultValue`.
 */
function Tabs({
  items = [],
  // [{ id, label, count }]
  value,
  defaultValue,
  onChange,
  style,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id);
  const active = isControlled ? value : internal;
  const select = id => {
    if (!isControlled) setInternal(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      borderBottom: '1px solid var(--border)',
      ...style
    }
  }, rest), items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": on,
      onClick: () => select(it.id),
      className: "tempo-tab",
      style: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '0 2px 12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: on ? 700 : 500,
        color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'var(--t-colors)'
      }
    }, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '1px 7px',
        borderRadius: 999,
        background: on ? 'var(--violet-500)' : 'var(--surface-3)',
        color: on ? '#fff' : 'var(--text-secondary)'
      }
    }, it.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        borderRadius: 2,
        background: on ? 'var(--grad-cta)' : 'transparent',
        transition: 'background var(--dur-fast) var(--ease-standard)'
      }
    }));
  }));
}
if (typeof document !== 'undefined' && !document.getElementById('tempo-tab-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-tab-kf';
  s.textContent = `.tempo-tab:hover{color:var(--text-primary)}`;
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/AnalyticsScreen.jsx
try { (() => {
// Tempo UI kit — Analytics dashboard
function AnalyticsScreen() {
  const {
    StatTile,
    Card,
    ProgressRing,
    ProgressBar,
    Tabs,
    Avatar,
    Badge,
    Button
  } = window.TempoDesignSystem_e112f2;
  const [tab, setTab] = React.useState('overview');
  const toneIcon = (t, name) => /*#__PURE__*/React.createElement(Icon, {
    name: name,
    size: 16
  });

  // Stacked bar chart data (study time over time)
  const days = Array.from({
    length: 28
  }, (_, i) => {
    const f = 6 + Math.sin(i / 2) * 4 + i % 5 * 1.5;
    return {
      f: Math.max(2, f),
      n: 2 + i % 4,
      e: 1 + i % 3 * 0.6,
      a: 0.5 + i % 2
    };
  });
  const maxTot = Math.max(...days.map(d => d.f + d.n + d.e + d.a));

  // Mastery line points
  const mastery = [38, 40, 43, 42, 47, 50, 49, 54, 56, 58, 57, 62, 64, 63, 66, 68];
  const linePts = mastery.map((v, i) => `${i / (mastery.length - 1) * 100},${100 - (v - 30) / 45 * 100}`).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-h1)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--ls-tight)'
    }
  }, "Analytics"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 14,
      marginTop: 6
    }
  }, "Track your progress and improve your learning journey."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      id: 'overview',
      label: 'Overview'
    }, {
      id: 'spaces',
      label: 'Study Spaces'
    }, {
      id: 'cards',
      label: 'Flashcards'
    }, {
      id: 'notes',
      label: 'Notes'
    }, {
      id: 'exams',
      label: 'Exams'
    }, {
      id: 'goals',
      label: 'Goals'
    }],
    style: {
      border: 'none',
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-secondary)',
      fontSize: 13,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 15
  }), " May 19 \u2013 Jun 18, 2024 ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 14,
      marginBottom: 16
    }
  }, window.STATS.map((s, i) => /*#__PURE__*/React.createElement(StatTile, {
    key: i,
    label: s.label,
    value: s.value,
    delta: s.delta,
    caption: s.caption,
    icon: toneIcon(s.tone, s.icon),
    iconTone: s.tone
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 320px',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: 'span 2'
    }
  }, /*#__PURE__*/React.createElement(ChartHeader, {
    title: "Study Time Over Time",
    legend: window.STUDY_BY_TYPE.slice(0, 4),
    right: /*#__PURE__*/React.createElement(DropdownPill, {
      label: "Daily"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 3,
      height: 180,
      marginTop: 16
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      height: '100%',
      gap: 1
    }
  }, [['a', 'var(--chart-4)'], ['e', 'var(--chart-3)'], ['n', 'var(--chart-2)'], ['f', 'var(--chart-1)']].map(([k, c]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: `${d[k] / maxTot * 100}%`,
      background: c,
      borderRadius: k === 'f' ? '3px 3px 0 0' : 0,
      opacity: 0.9
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      color: 'var(--text-tertiary)',
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("span", null, "May 19"), /*#__PURE__*/React.createElement("span", null, "May 26"), /*#__PURE__*/React.createElement("span", null, "Jun 2"), /*#__PURE__*/React.createElement("span", null, "Jun 9"), /*#__PURE__*/React.createElement("span", null, "Jun 16"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(ChartHeader, {
    title: "Study Time by Type"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    segments: window.STUDY_BY_TYPE,
    size: 132,
    centerTop: "128h",
    centerBottom: "45m Total"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, window.STUDY_BY_TYPE.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: s.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)',
      flex: 1
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, s.pct, "%")))))), /*#__PURE__*/React.createElement(Card, {
    style: {
      gridRow: 'span 1'
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, "Learning Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '12px 0'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 26,
    color: "var(--warning)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 30,
      color: 'var(--text-primary)'
    }
  }, "23 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500
    }
  }, "days"))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 12.5,
      marginBottom: 12
    }
  }, "Keep it up! \uD83D\uDD25"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: i < 6 ? 'var(--violet-500)' : 'var(--surface-3)',
      color: i < 6 ? '#fff' : 'var(--text-tertiary)'
    }
  }, i < 6 ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13
  }) : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-tertiary)'
    }
  }, d)))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12,
      marginTop: 14,
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 12
    }
  }, "Personal Best: 37 days")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, "Mastery Progress"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 24,
      color: 'var(--text-primary)'
    }
  }, "68%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, "Average Mastery"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--success-text)',
      fontWeight: 700
    }
  }, "\u25B4 12% vs last period"))), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 60",
    preserveAspectRatio: "none",
    style: {
      width: '100%',
      height: 130,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "ml",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "var(--violet-500)",
    stopOpacity: "0.35"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "var(--violet-500)",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("polygon", {
    points: `0,60 ${linePts} 100,60`,
    fill: "url(#ml)"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: linePts,
    fill: "none",
    stroke: "var(--violet-400)",
    strokeWidth: "1.6",
    vectorEffect: "non-scaling-stroke"
  }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, "Weak Topics"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-300)',
      fontSize: 12.5,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "View all")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginTop: 14
    }
  }, window.WEAK_TOPICS.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 5,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, t.pct, "%")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: t.pct,
    height: 5,
    gradient: false,
    color: t.pct < 50 ? 'var(--danger)' : t.pct < 65 ? 'var(--warning)' : 'var(--success)'
  }))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionTitle, null, "Review Forecast"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    size: 110,
    thickness: 16,
    centerTop: "142",
    centerBottom: "Next 7 Days",
    segments: [{
      pct: 20,
      color: 'var(--danger)'
    }, {
      pct: 24,
      color: 'var(--warning)'
    }, {
      pct: 28,
      color: 'var(--success)'
    }, {
      pct: 28,
      color: 'var(--violet-500)'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, [['Today', 28, 'var(--danger)'], ['Tomorrow', 34, 'var(--warning)'], ['In 3 days', 40, 'var(--success)'], ['In 4–7 days', 40, 'var(--violet-400)']].map(([l, n, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)',
      flex: 1
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, n))))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    style: {
      marginTop: 16
    }
  }, "Review Now")), /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: '3',
      gridRow: '2 / span 2'
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, "AI Insights"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12,
      marginBottom: 14
    }
  }, "Based on your learning behavior"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, window.AI_INSIGHTS.map((ins, i) => {
    const tones = {
      green: 'var(--success-text)',
      red: 'var(--danger-text)',
      amber: 'var(--warning-text)',
      violet: 'var(--violet-300)'
    };
    const softs = {
      green: 'var(--success-soft)',
      red: 'var(--danger-soft)',
      amber: 'var(--warning-soft)',
      violet: 'rgba(139,92,246,0.16)'
    };
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        flex: '0 0 32px',
        borderRadius: 'var(--radius-md)',
        background: softs[ins.tone],
        color: tones[ins.tone],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ins.icon,
      size: 16
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 600
      }
    }, ins.title), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 12,
        lineHeight: 1.4,
        marginTop: 2
      }
    }, ins.body)));
  })), /*#__PURE__*/React.createElement("a", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      color: 'var(--violet-300)',
      fontSize: 12.5,
      fontWeight: 600,
      marginTop: 16,
      cursor: 'pointer'
    }
  }, "View all insights ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14
  }))), /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: '3'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, "Top Learners"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12
    }
  }, "This Month \u25BE")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginTop: 12
    }
  }, window.LEADERS.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.rank,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 8px',
      borderRadius: 'var(--radius-md)',
      background: l.you ? 'rgba(139,92,246,0.12)' : 'transparent',
      border: l.you ? '1px solid var(--border-violet)' : '1px solid transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      textAlign: 'center',
      color: 'var(--text-tertiary)',
      fontSize: 13,
      fontWeight: 700
    }
  }, l.rank), /*#__PURE__*/React.createElement(Avatar, {
    name: l.name.replace(' (You)', ''),
    size: "sm",
    verified: l.verified,
    ring: l.you
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: 'var(--text-primary)',
      fontSize: 13,
      fontWeight: l.you ? 600 : 500
    }
  }, l.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 12.5,
      fontFamily: 'var(--font-mono)'
    }
  }, l.time)))))));
}

// — small shared bits —
function SectionTitle({
  children
}) {
  return /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 17,
      color: 'var(--text-primary)'
    }
  }, children);
}
function ChartHeader({
  title,
  legend,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, title), legend && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, legend.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11.5,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 2,
      background: s.color
    }
  }), s.name)))), right);
}
function DropdownPill({
  label
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-secondary)',
      fontSize: 12.5
    }
  }, label, " ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 13
  }));
}
Object.assign(window, {
  AnalyticsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/AnalyticsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/App.jsx
try { (() => {
// Tempo UI kit — app shell + routing
function App() {
  const [screen, setScreen] = React.useState('analytics');

  // Hydrate Lucide icons after every commit
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const topbarByScreen = {
    analytics: {
      ph: 'Search analytics, topics, sessions…',
      actions: /*#__PURE__*/React.createElement(ExportBtn, null)
    },
    library: {
      ph: 'Search flashcards, notes, study spaces…',
      actions: null
    },
    explore: {
      ph: 'Search study spaces, notes, flashcards, exams…',
      actions: /*#__PURE__*/React.createElement(UploadBtn, null)
    },
    groups: {
      ph: 'Search groups, members, or resources…',
      actions: /*#__PURE__*/React.createElement(CreateGroupBtn, null)
    }
  };
  const tb = topbarByScreen[screen] || {
    ph: undefined,
    actions: null
  };
  let body;
  if (screen === 'analytics') body = /*#__PURE__*/React.createElement(AnalyticsScreen, null);else if (screen === 'library') body = /*#__PURE__*/React.createElement(LibraryScreen, null);else if (screen === 'explore') body = /*#__PURE__*/React.createElement(ExploreScreen, null);else if (screen === 'groups') body = /*#__PURE__*/React.createElement(GroupsScreen, null);else body = /*#__PURE__*/React.createElement(Placeholder, {
    screen: screen
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-base)'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: screen,
    onNavigate: setScreen
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    placeholder: tb.ph,
    actions: tb.actions
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: screen === 'library' ? 'hidden' : 'auto',
      minHeight: 0
    }
  }, body)));
}
function ExportBtn() {
  const {
    Button
  } = window.TempoDesignSystem_e112f2;
  return /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "upload",
      size: 15
    }),
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 14
    })
  }, "Export");
}
function UploadBtn() {
  const {
    Button
  } = window.TempoDesignSystem_e112f2;
  return /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "upload",
      size: 15
    }),
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 14
    })
  }, "Upload");
}
function CreateGroupBtn() {
  const {
    Button
  } = window.TempoDesignSystem_e112f2;
  return /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 15
    })
  }, "Create Group");
}
function Placeholder({
  screen
}) {
  const labels = {
    learn: 'Learn',
    'tempo-ai': 'Tempo AI',
    'exam-gen': 'Exam Generator',
    import: 'Import Quizlet'
  };
  const icons = {
    learn: 'graduation-cap',
    'tempo-ai': 'sparkles',
    'exam-gen': 'file-check-2',
    import: 'download'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 'var(--radius-xl)',
      background: 'rgba(139,92,246,0.14)',
      color: 'var(--violet-300)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icons[screen],
    size: 28
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-h2)',
      color: 'var(--text-secondary)'
    }
  }, labels[screen]), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13
    }
  }, "This surface isn't part of the UI-kit sample. Try Analytics, Library, Explore, or Groups."));
}
/* DISABLED: this bundled snapshot of App.jsx must not auto-render. The live app is
   rendered by the source ui_kits/tempo-app/App.jsx loaded later in index.html. This
   bundle is kept only for the window.TempoDesignSystem_e112f2 component exports. */
/* ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null)); */
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/ExploreScreen.jsx
try { (() => {
// Tempo UI kit — Explore
function ExploreScreen() {
  const {
    Card,
    Badge,
    Chip,
    Avatar,
    Button,
    Switch
  } = window.TempoDesignSystem_e112f2;
  const [cat, setCat] = React.useState('All');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px 48px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-h1)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--ls-tight)'
    }
  }, "Explore"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 14,
      margin: '6px 0 18px'
    }
  }, "Discover high-quality study resources shared by learners around the world."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 22,
      flexWrap: 'wrap'
    }
  }, ['All', 'Study Spaces', 'Flashcards', 'Notes', 'Exam Packs', 'Collections', 'Users'].map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    selected: cat === c,
    onClick: () => setCat(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--text-h2)',
      fontSize: 20,
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 20,
    color: "var(--warning)"
  }), " Trending Study Spaces"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-300)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "View all \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12.5,
      marginBottom: 14
    }
  }, "Most popular and effective study spaces this week"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 14,
      marginBottom: 28
    }
  }, window.TRENDING.map((t, i) => {
    const tones = ['cs', 'math', 'science', 'physics'];
    const tone = tones[i % 4];
    return /*#__PURE__*/React.createElement(Card, {
      key: i,
      interactive: true,
      padding: "none",
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 84,
        ...subjectBackdrop(tone)
      }
    }, /*#__PURE__*/React.createElement(Constellation, {
      tone: tone
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 24,
        height: 24,
        borderRadius: 7,
        background: i === 0 ? 'var(--warning)' : 'rgba(0,0,0,0.45)',
        color: i === 0 ? '#1a1203' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 12
      }
    }, t.rank)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: 'var(--text-primary)',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1.3
      }
    }, t.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        margin: '8px 0 12px'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: t.author,
      size: "xs"
    }), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 12
      }
    }, t.author), " ", /*#__PURE__*/React.createElement(Icon, {
      name: "badge-check",
      size: 13,
      color: "var(--info)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        paddingTop: 12,
        borderTop: '1px solid var(--border-subtle)'
      }
    }, [['Notes', t.notes], ['Cards', t.cards], ['Exams', t.exams], ['Learners', t.learners]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-primary)',
        fontWeight: 700,
        fontSize: 14,
        fontFamily: 'var(--font-display)'
      }
    }, v), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-tertiary)',
        fontSize: 10.5
      }
    }, l)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: 'var(--warning-text)',
        fontSize: 12.5,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 13,
      color: "var(--warning)",
      style: {
        fill: 'var(--warning)'
      }
    }), " ", t.rating), /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      size: "sm"
    }, t.mastery, " mastery"))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(ListColumn, {
    title: "Popular Flashcards",
    items: [['Anatomy – Full Body Systems', 'Mike Ross', '1,024 cards'], ['Chemical Reactions MCQ', 'Rachel Green', '650 cards'], ['Psychology Theories', 'Monica Geller', '720 cards']],
    icon: "layers",
    tone: "cs"
  }), /*#__PURE__*/React.createElement(ListColumn, {
    title: "Top Notes",
    items: [['MIT – Calculus Lecture Notes', 'John Doe', '128 pages'], ['Physics – Thermodynamics', 'Albert E.', '86 pages'], ['ML Lecture Notes', 'Andrew Ng', '156 pages']],
    icon: "file-text",
    tone: "math"
  }), /*#__PURE__*/React.createElement(ListColumn, {
    title: "Exam Packs",
    items: [['Computer Networks Final', 'Network Pro', '120 Qs'], ['Database Systems Midterm', 'DB Master', '85 Qs'], ['Calculus I – Practice', 'Math Wizard', '100 Qs']],
    icon: "clipboard-list",
    tone: "science"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 16,
      color: 'var(--text-primary)',
      marginBottom: 14
    }
  }, "Search & Filter"), ['Subject', 'Resource Type', 'Language', 'Difficulty'].map(f => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      color: 'var(--text-secondary)',
      fontSize: 12,
      marginBottom: 6
    }
  }, f), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '9px 12px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-secondary)',
      fontSize: 13
    }
  }, "All ", f === 'Resource Type' ? 'Types' : f === 'Difficulty' ? 'Levels' : f + 's', " ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '14px 0'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    size: "sm",
    defaultChecked: true
  }), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 13
    }
  }, "Verified only")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true
  }, "Apply Filters")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }, "Most Effective"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-300)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "View all \u2192")), [['Deep Learning Mastery', '+22%'], ['Algorithms Advanced', '+21%'], ['Linear Algebra Essentials', '+18%'], ['Data Structures Guide', '+17%'], ['Operating Systems', '+16%']].map(([n, p], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 14,
    color: "var(--violet-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: 'var(--text-secondary)',
      fontSize: 12.5
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--success-text)',
      fontWeight: 700,
      fontSize: 12.5
    }
  }, p)))))));
}
function ListColumn({
  title,
  items,
  icon,
  tone
}) {
  const {
    Card
  } = window.TempoDesignSystem_e112f2;
  return /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 15,
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-300)',
      fontSize: 11.5,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "View all")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, items.map(([n, a, m], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      flex: '0 0 32px',
      borderRadius: 'var(--radius-sm)',
      background: SUBJECT[tone].soft,
      color: SUBJECT[tone].color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 12.5,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 11
    }
  }, a)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 11,
      whiteSpace: 'nowrap'
    }
  }, m)))));
}
Object.assign(window, {
  ExploreScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/ExploreScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/GroupsScreen.jsx
try { (() => {
// Tempo UI kit — Groups
function GroupsScreen() {
  const {
    Card,
    Badge,
    Tabs,
    Chip,
    AvatarGroup,
    Button,
    IconButton
  } = window.TempoDesignSystem_e112f2;
  const [tab, setTab] = React.useState('my');
  const [cat, setCat] = React.useState('All');
  const members = window.AVATARS.map(a => ({
    name: a.name
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-h1)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--ls-tight)'
    }
  }, "Groups"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16
    })
  }, "Create Group")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 14,
      marginBottom: 18
    }
  }, "Study together, share resources, and achieve more as a team."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      id: 'my',
      label: 'My Groups'
    }, {
      id: 'explore',
      label: 'Explore Groups'
    }, {
      id: 'requests',
      label: 'Requests',
      count: 2
    }],
    style: {
      border: 'none',
      flex: 1
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 18,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 14,
      marginBottom: 26
    }
  }, window.GROUPS.map((g, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    interactive: true,
    padding: "none",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 92,
      ...subjectBackdrop(g.tone)
    }
  }, /*#__PURE__*/React.createElement(Constellation, {
    tone: g.tone
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.3)',
      border: 'none',
      borderRadius: 8,
      width: 28,
      height: 28,
      color: '#fff',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "more-vertical",
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 16,
      fontWeight: 600
    }
  }, g.name), g.pro && /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 16,
    color: "var(--violet-400)"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12,
      margin: '4px 0 8px'
    }
  }, g.members, " members \xB7 You"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 12.5,
      lineHeight: 1.45,
      minHeight: 34
    }
  }, g.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      margin: '14px 0',
      paddingTop: 14,
      borderTop: '1px solid var(--border-subtle)'
    }
  }, [['Resources', g.resources], ['Notes', g.notes], ['Flashcards', g.cards]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: 17,
      fontFamily: 'var(--font-display)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 11
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--text-secondary)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 13
  }), g.next), /*#__PURE__*/React.createElement(AvatarGroup, {
    users: members.slice(i, i + 4),
    max: 3,
    size: "xs"
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--text-h2)',
      fontSize: 20,
      color: 'var(--text-primary)'
    }
  }, "Explore Groups"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-300)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "View all \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, ['All', 'Computer Science', 'Mathematics', 'Science', 'Languages', 'Business'].map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    size: "sm",
    selected: cat === c,
    onClick: () => setCat(c)
  }, c))), /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, window.EXPLORE_GROUPS.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: '0 0 40px',
      borderRadius: 'var(--radius-md)',
      background: SUBJECT[g.tone].soft,
      color: SUBJECT[g.tone].color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: g.icon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 14,
      fontWeight: 600
    }
  }, g.name), g.hub && /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 14,
    color: "var(--violet-400)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12
    }
  }, g.desc)), /*#__PURE__*/React.createElement(AvatarGroup, {
    users: members.slice(i, i + 3),
    max: 3,
    size: "xs"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      color: 'var(--text-tertiary)',
      fontSize: 12,
      width: 200,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 13
  }), g.docs), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sticky-note",
    size: 13
  }), g.notes), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: g.active ? 'var(--success-text)' : 'var(--text-tertiary)'
    }
  }, g.active && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--success)'
    }
  }), g.activity)), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Join"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }, "Upcoming Sessions"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-300)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "View calendar")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, [['Deep Learning Study Session', 'Today, 7:00 PM', 'cs'], ['Algorithms Practice', 'Tomorrow, 6:00 PM', 'science'], ['Chemistry Quiz Review', 'May 25, 8:00 PM', 'math']].map(([t, d, tone], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: '0 0 36px',
      borderRadius: 'var(--radius-md)',
      background: SUBJECT[tone].soft,
      color: SUBJECT[tone].color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 13,
      fontWeight: 600
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 11.5
    }
  }, d)), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "Join"))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 16,
      color: 'var(--text-primary)',
      marginBottom: 14
    }
  }, "Recent Activity"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, [['Sarah Lee', 'uploaded “CNN Architecture Notes” to Deep Learning Squad', '20m ago'], ['Alex Chen', 'added 25 new flashcards to Algorithms Club', '1h ago'], ['Emily Johnson', 'started a discussion in Calculus Study Circle', '3h ago']].map(([who, what, when], i) => {
    const {
      Avatar
    } = window.TempoDesignSystem_e112f2;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: who,
      size: "sm"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        lineHeight: 1.4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-primary)',
        fontWeight: 600
      }
    }, who, " "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-secondary)'
      }
    }, what), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-tertiary)',
        fontSize: 11,
        marginTop: 2
      }
    }, when)));
  }))))));
}
Object.assign(window, {
  GroupsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/GroupsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/LibraryScreen.jsx
try { (() => {
// Tempo UI kit — Library (Notes / Flashcards / Study Spaces)

// CSS for filled-star — Lucide draws a fill="none" path so we override via CSS.
if (typeof document !== 'undefined' && !document.getElementById('tempo-star-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-star-css';
  s.textContent = `.tempo-star-fav svg { fill: var(--warning); color: var(--warning); }`;
  document.head.appendChild(s);
}

// Subject-icon chip tones for flashcard cards (matches subject-accent tokens).
const FC_TONES = {
  violet: {
    bg: 'rgba(139,92,246,0.16)',
    fg: 'var(--violet-300)'
  },
  blue: {
    bg: 'rgba(91,157,248,0.16)',
    fg: 'var(--info-text)'
  },
  green: {
    bg: 'rgba(63,209,128,0.16)',
    fg: 'var(--success-text)'
  },
  amber: {
    bg: 'rgba(246,178,60,0.16)',
    fg: 'var(--warning-text)'
  },
  red: {
    bg: 'rgba(240,88,79,0.16)',
    fg: 'var(--danger-text)'
  },
  teal: {
    bg: 'rgba(45,212,191,0.14)',
    fg: '#5EE6D2'
  }
};
const STATUS_TONE = {
  Public: 'green',
  Private: 'violet',
  Shared: 'blue',
  Studying: 'blue'
};
function LibraryScreen() {
  const {
    Card,
    Tabs,
    Chip,
    IconButton,
    Button,
    Badge
  } = window.TempoDesignSystem_e112f2;
  const [tab, setTab] = React.useState('flashcards');
  const [filter, setFilter] = React.useState('All');

  // Compound keys per tab to keep favs/deleted independent between Notes and Flashcards
  const k = (type, i) => `${type}:${i}`;
  const initFavs = React.useMemo(() => {
    const s = new Set();
    window.NOTES.forEach((n, i) => n.fav && s.add(k('notes', i)));
    window.FLASHCARDS.forEach((f, i) => f.fav && s.add(k('flashcards', i)));
    return s;
  }, []);
  const [favs, setFavs] = React.useState(initFavs);
  const [deleted, setDeleted] = React.useState(() => new Set());

  // Menu / dialog targets: { type, idx }
  const [menuTarget, setMenuTarget] = React.useState(null);
  const [menuPos, setMenuPos] = React.useState({
    top: 0,
    right: 0
  });
  const [shareTarget, setShareTarget] = React.useState(null);
  const [publicTarget, setPublicTarget] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  React.useEffect(() => {
    if (menuTarget == null) return;
    const onDoc = e => {
      if (!e.target.closest('[data-menu-root]')) setMenuTarget(null);
    };
    const onKey = e => {
      if (e.key === 'Escape') setMenuTarget(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuTarget]);

  // Re-hydrate Lucide icons after a tab switch — the new <i data-lucide>
  // placeholders need to be rescanned and converted to SVGs.
  React.useEffect(() => {
    if (!window.lucide) return;
    requestAnimationFrame(() => window.lucide.createIcons());
  }, [tab]);
  const toggleFav = (type, i) => setFavs(s => {
    const n = new Set(s);
    const key = k(type, i);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  });
  const openMenu = (e, type, i) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: r.bottom + 6,
      right: window.innerWidth - r.right
    });
    const sameAsOpen = menuTarget && menuTarget.type === type && menuTarget.idx === i;
    setMenuTarget(sameAsOpen ? null : {
      type,
      idx: i
    });
  };

  // Per-tab metadata
  const isFlash = tab === 'flashcards';
  const isSpaces = tab === 'spaces';
  const PAGE = isFlash ? 12 : 9;
  const COLS = isFlash ? 4 : 3;
  const TOTAL = isFlash ? 128 : 96;
  const NOUN = isFlash ? 'sets' : 'notes';
  const DATA = isFlash ? window.FLASHCARDS : window.NOTES;
  const pages = Math.ceil(TOTAL / PAGE); // 11 for notes (96/9), 11 for flashcards (128/12)

  const items = DATA.slice(0, PAGE).map((it, i) => ({
    it,
    i
  })).filter(({
    i
  }) => !deleted.has(k(tab, i)));
  const filterAllLabel = `All (${TOTAL})`;
  const resolveItem = target => target && (target.type === 'flashcards' ? window.FLASHCARDS[target.idx] : window.NOTES[target.idx]);
  const entityName = target => target && target.type === 'flashcards' ? 'flashcard set' : 'note';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 28px 16px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      id: 'flashcards',
      label: 'Flashcards',
      count: 128
    }, {
      id: 'notes',
      label: 'Notes',
      count: 96
    }, {
      id: 'spaces',
      label: 'Study Spaces'
    }]
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "upload",
      size: 15
    })
  }, "Upload")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 12,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, ['All', 'Recent', 'Studying', 'Public', 'Private', 'Shared', 'Starred'].slice(0, isFlash ? 7 : 5).map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    size: "sm",
    selected: filter === f,
    onClick: () => setFilter(f)
  }, f === 'All' ? filterAllLabel : f)))), isSpaces ? /*#__PURE__*/React.createElement(SpacesPlaceholder, null) : /*#__PURE__*/React.createElement("div", {
    key: tab,
    style: {
      flex: 1,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridAutoRows: '1fr',
      gap: 12,
      overflow: 'hidden'
    }
  }, items.map(({
    it,
    i
  }) => {
    const isFav = favs.has(k(tab, i));
    return isFlash ? /*#__PURE__*/React.createElement(FlashcardCard, {
      key: i,
      card: it,
      isFav: isFav,
      onToggleFav: () => toggleFav('flashcards', i),
      onMenu: e => openMenu(e, 'flashcards', i)
    }) : /*#__PURE__*/React.createElement(NoteCard, {
      key: i,
      note: it,
      isFav: isFav,
      onToggleFav: () => toggleFav('notes', i),
      onMenu: e => openMenu(e, 'notes', i)
    });
  })), !isSpaces && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 13
    }
  }, "1\u2013", PAGE, " of ", TOTAL, " ", NOUN), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Prev",
    size: "sm",
    variant: "solid"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 15
  })), [1, 2, 3, 4, 5].map(p => /*#__PURE__*/React.createElement("span", {
    key: p,
    style: {
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      background: p === 1 ? 'var(--violet-500)' : 'transparent',
      color: p === 1 ? '#fff' : 'var(--text-secondary)'
    }
  }, p)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, "\u2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)',
      fontSize: 13
    }
  }, pages), /*#__PURE__*/React.createElement(IconButton, {
    label: "Next",
    size: "sm",
    variant: "solid"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 15
  })))), menuTarget && ReactDOM.createPortal(/*#__PURE__*/React.createElement(OverflowMenu, {
    pos: menuPos,
    onPick: action => {
      if (action === 'share') setShareTarget(menuTarget);else if (action === 'public') setPublicTarget(menuTarget);else if (action === 'delete') setDeleteTarget(menuTarget);
      setMenuTarget(null);
    }
  }), document.body), shareTarget && /*#__PURE__*/React.createElement(ShareDialog, {
    item: resolveItem(shareTarget),
    noun: entityName(shareTarget),
    onClose: () => setShareTarget(null)
  }), publicTarget && /*#__PURE__*/React.createElement(PublicDialog, {
    item: resolveItem(publicTarget),
    noun: entityName(publicTarget),
    onClose: () => setPublicTarget(null)
  }), deleteTarget && /*#__PURE__*/React.createElement(DeleteConfirm, {
    item: resolveItem(deleteTarget),
    noun: entityName(deleteTarget),
    onCancel: () => setDeleteTarget(null),
    onConfirm: () => {
      const t = deleteTarget;
      setDeleted(s => {
        const n = new Set(s);
        n.add(k(t.type, t.idx));
        return n;
      });
      setDeleteTarget(null);
    }
  }));
}

// ───────────────────────────────────────────────────────────────
// Cards
// ───────────────────────────────────────────────────────────────

function NoteCard({
  note,
  isFav,
  onToggleFav,
  onMenu
}) {
  const {
    Card
  } = window.TempoDesignSystem_e112f2;
  return /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    padding: "none",
    style: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      color: 'var(--text-tertiary)',
      fontSize: 11.5,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 13,
    color: "var(--danger)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap'
    }
  }, "PDF \xB7 ", note.pages, " pages")), /*#__PURE__*/React.createElement(CardActions, {
    isFav: isFav,
    onToggleFav: onToggleFav,
    onMenu: onMenu
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 14.5,
      fontWeight: 600,
      lineHeight: 1.3,
      margin: '2px 0 0',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, note.title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 12,
      lineHeight: 1.45,
      margin: 0,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, note.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 8,
      color: 'var(--text-tertiary)',
      fontSize: 11
    }
  }, "Edited ", note.edited)));
}
function FlashcardCard({
  card,
  isFav,
  onToggleFav,
  onMenu
}) {
  const {
    Card,
    Badge,
    Avatar
  } = window.TempoDesignSystem_e112f2;
  const tone = FC_TONES[card.tone] || FC_TONES.violet;
  const statusTone = STATUS_TONE[card.status] || 'neutral';
  const hasProgress = card.studied > 0;
  return /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    padding: "none",
    style: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: '0 0 36px',
      borderRadius: 'var(--radius-md)',
      background: tone.bg,
      color: tone.fg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: card.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      flex: 1,
      color: 'var(--text-primary)',
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.25,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      wordBreak: 'break-word'
    }
  }, card.title), /*#__PURE__*/React.createElement(CardActions, {
    isFav: isFav,
    onToggleFav: onToggleFav,
    onMenu: onMenu,
    compact: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 12.5
    }
  }, card.cards, " cards", hasProgress && /*#__PURE__*/React.createElement("span", null, " \xB7 ", card.studied, "% studied")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: 'var(--surface-3)',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.max(card.studied, 0)}%`,
      height: '100%',
      background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-400))',
      transition: 'width var(--dur-slower) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: statusTone,
    uppercase: true,
    size: "sm",
    icon: card.status === 'Studying' ? /*#__PURE__*/React.createElement(Icon, {
      name: "flame",
      size: 10
    }) : null
  }, card.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 11.5
    }
  }, card.when), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: card.author,
    size: "xs"
  })))));
}
function CardActions({
  isFav,
  onToggleFav,
  onMenu,
  compact = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-menu-root": true,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      marginRight: -4,
      marginTop: -2,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onToggleFav();
    },
    title: isFav ? 'Unfavorite' : 'Favorite',
    className: isFav ? 'tempo-star-fav' : '',
    style: {
      width: compact ? 22 : 24,
      height: compact ? 22 : 24,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      color: isFav ? 'var(--warning)' : 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 14
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onMenu,
    title: "More",
    style: {
      width: compact ? 22 : 24,
      height: compact ? 22 : 24,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "more-vertical",
    size: 14
  })));
}
function SpacesPlaceholder() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-xl)',
      background: 'rgba(139,92,246,0.14)',
      color: 'var(--violet-300)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "library",
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-h3)',
      color: 'var(--text-secondary)'
    }
  }, "Study Spaces"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13
    }
  }, "Use the Analytics view for a richer Study Spaces overview."));
}

// ───────────────────────────────────────────────────────────────
// Overflow menu + dialogs
// ───────────────────────────────────────────────────────────────

function OverflowMenu({
  pos,
  onPick
}) {
  const items = [{
    id: 'rename',
    icon: 'pencil',
    label: 'Rename'
  }, {
    id: 'duplicate',
    icon: 'copy',
    label: 'Duplicate'
  }, {
    id: 'move',
    icon: 'folder-input',
    label: 'Move to Collection'
  }, {
    id: 'share',
    icon: 'share-2',
    label: 'Share'
  }, {
    id: 'public',
    icon: 'globe',
    label: 'Public'
  }];
  const rowStyle = danger => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: danger ? 'var(--danger-text)' : 'var(--text-primary)',
    fontSize: 13,
    fontWeight: danger ? 700 : 500,
    cursor: 'pointer',
    textAlign: 'left'
  });
  return /*#__PURE__*/React.createElement("div", {
    "data-menu-root": true,
    role: "menu",
    style: {
      position: 'fixed',
      top: pos.top,
      right: pos.right,
      zIndex: 200,
      width: 210,
      padding: 6,
      background: 'var(--surface-2)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)'
    }
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onMouseDown: e => e.stopPropagation(),
    onClick: e => {
      e.stopPropagation();
      onPick(it.id);
    },
    style: rowStyle(false),
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-3)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 15,
    color: "var(--text-secondary)"
  }), it.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border)',
      margin: '6px 4px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onMouseDown: e => e.stopPropagation(),
    onClick: e => {
      e.stopPropagation();
      onPick('delete');
    },
    style: rowStyle(true),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(240,88,79,0.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 15,
    color: "var(--danger-text)"
  }), "Delete"));
}
function ShareDialog({
  item,
  noun,
  onClose
}) {
  const {
    Button,
    Input,
    Switch
  } = window.TempoDesignSystem_e112f2;
  const [emails, setEmails] = React.useState('');
  const [withDoc, setWithDoc] = React.useState(true);
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(4,6,11,0.65)',
      backdropFilter: 'var(--blur-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onMouseDown: e => e.stopPropagation(),
    style: {
      width: 420,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 18,
      color: 'var(--text-primary)'
    }
  }, "Share ", noun), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 13,
      marginTop: 4,
      lineHeight: 1.4
    }
  }, item.title)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 28,
      height: 28,
      background: 'transparent',
      border: 'none',
      borderRadius: 6,
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      color: 'var(--text-secondary)',
      fontSize: 12.5,
      fontWeight: 600,
      margin: '16px 0 6px'
    }
  }, "Add people by email"), /*#__PURE__*/React.createElement(Input, {
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 15
    }),
    placeholder: "name@example.com, \u2026",
    value: emails,
    onChange: e => setEmails(e.target.value)
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: withDoc,
    onChange: setWithDoc
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 13.5,
      fontWeight: 500
    }
  }, "Share with document")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 12,
      margin: '6px 0 0 52px',
      lineHeight: 1.45
    }
  }, "Recipients can open the original document in addition to your ", noun, "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 15
    }),
    onClick: onClose
  }, "Share"))));
}
function PublicDialog({
  item,
  noun,
  onClose
}) {
  const {
    Button
  } = window.TempoDesignSystem_e112f2;
  const [pick, setPick] = React.useState('with-doc');
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const Option = ({
    id,
    icon,
    title,
    desc
  }) => {
    const on = pick === id;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => setPick(id),
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        width: '100%',
        padding: 14,
        textAlign: 'left',
        cursor: 'pointer',
        background: on ? 'rgba(139,92,246,0.10)' : 'var(--surface-2)',
        border: `1px solid ${on ? 'var(--violet-500)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: on ? 'var(--glow-violet-sm)' : 'none',
        transition: 'var(--t-colors)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 34,
        height: 34,
        flex: '0 0 34px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        background: on ? 'rgba(139,92,246,0.20)' : 'var(--surface-3)',
        color: on ? 'var(--violet-300)' : 'var(--text-secondary)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-primary)',
        fontSize: 13.5,
        fontWeight: 600
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 12,
        marginTop: 3,
        lineHeight: 1.45
      }
    }, desc)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        height: 16,
        flex: '0 0 16px',
        borderRadius: '50%',
        border: `1.5px solid ${on ? 'var(--violet-400)' : 'var(--border-strong)'}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2
      }
    }, on && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--violet-400)'
      }
    })));
  };
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(4,6,11,0.65)',
      backdropFilter: 'var(--blur-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onMouseDown: e => e.stopPropagation(),
    style: {
      width: 460,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 18,
      color: 'var(--text-primary)'
    }
  }, "Make public"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 13,
      marginTop: 4,
      lineHeight: 1.4
    }
  }, item.title)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 28,
      height: 28,
      background: 'transparent',
      border: 'none',
      borderRadius: 6,
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Option, {
    id: "with-doc",
    icon: "globe",
    title: "Public with document",
    desc: "Anyone with the link can access and view the entire document."
  }), /*#__PURE__*/React.createElement(Option, {
    id: "note-only",
    icon: "file-lock",
    title: `Only public ${noun}`,
    desc: `The ${noun} is publicly visible and discoverable, but the document content stays restricted. Users must request access before viewing the document.`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 15
    }),
    onClick: onClose
  }, "Make public"))));
}
function DeleteConfirm({
  item,
  noun,
  onCancel,
  onConfirm
}) {
  const {
    Button
  } = window.TempoDesignSystem_e112f2;
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: onCancel,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(4,6,11,0.7)',
      backdropFilter: 'var(--blur-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onMouseDown: e => e.stopPropagation(),
    role: "alertdialog",
    style: {
      width: 400,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      flex: '0 0 38px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--danger-soft)',
      color: 'var(--danger-text)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      fontSize: 17,
      color: 'var(--text-primary)'
    }
  }, "Delete this ", noun, "?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 13,
      marginTop: 6,
      lineHeight: 1.45
    }
  }, "\"", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)'
    }
  }, item.title), "\" will be permanently removed. This action cannot be undone."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2",
      size: 15
    }),
    onClick: onConfirm
  }, "Delete"))));
}
Object.assign(window, {
  LibraryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/LibraryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/Sidebar.jsx
try { (() => {
// Tempo UI kit — workspace Sidebar (collapsible)
function Sidebar({
  active,
  onNavigate
}) {
  const {
    NavItem,
    Button,
    Avatar
  } = window.TempoDesignSystem_e112f2;
  const [collapsed, setCollapsed] = React.useState(false);
  const W = collapsed ? 76 : 240;

  // Inline collapse toggle — sits on the same row as logo + wordmark.
  // Using chevrons-left/right (always available in Lucide 0.460) and a plain
  // styled button instead of IconButton to keep this row self-contained.
  const Toggle = /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar',
    title: collapsed ? 'Expand sidebar' : 'Collapse sidebar',
    onClick: () => setCollapsed(c => !c),
    className: "tempo-sidebar-toggle",
    style: {
      width: 28,
      height: 28,
      flex: '0 0 28px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: 8,
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      transition: 'var(--t-colors)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: collapsed ? 'chevrons-right' : 'chevrons-left',
    size: 14
  }));
  const sectionLabel = t => collapsed ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-eyebrow)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wider)',
      color: 'var(--text-tertiary)',
      padding: '0 12px',
      margin: '18px 0 8px'
    }
  }, t);
  const navRow = n => collapsed ? /*#__PURE__*/React.createElement("button", {
    key: n.id,
    title: n.label,
    onClick: () => onNavigate(n.id),
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 40,
      margin: '0 auto',
      background: active === n.id ? 'rgba(139,92,246,0.14)' : 'transparent',
      border: '1px solid',
      borderColor: active === n.id ? 'var(--border-violet)' : 'transparent',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: active === n.id ? 'var(--violet-300)' : 'var(--text-tertiary)',
      transition: 'var(--t-colors)'
    }
  }, active === n.id && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -1,
      top: 8,
      bottom: 8,
      width: 3,
      borderRadius: 2,
      background: 'var(--grad-cta)'
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 18
  })) : /*#__PURE__*/React.createElement(NavItem, {
    key: n.id,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: n.icon
    }),
    label: n.label,
    active: active === n.id,
    onClick: () => onNavigate(n.id)
  });
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: W,
      flex: `0 0 ${W}px`,
      height: '100%',
      background: 'var(--bg-sunken)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: collapsed ? '18px 12px' : '20px 14px',
      overflow: 'hidden',
      transition: 'width var(--dur-base) var(--ease-standard), padding var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: collapsed ? 6 : 10,
      padding: '0 2px 6px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    alt: "",
    style: {
      width: collapsed ? 30 : 30,
      height: collapsed ? 30 : 30,
      borderRadius: 8,
      flex: '0 0 auto'
    }
  }), !collapsed && /*#__PURE__*/React.createElement("span", {
    className: "tempo-wordmark",
    style: {
      fontSize: 22,
      flex: 1,
      minWidth: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }
  }, "Tempo"), Toggle), sectionLabel('Workspace'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginTop: collapsed ? 8 : 0
    }
  }, window.NAV_MAIN.map(navRow)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), collapsed ? /*#__PURE__*/React.createElement("button", {
    title: "Upgrade to Pro",
    style: {
      width: 44,
      height: 44,
      margin: '0 auto 10px',
      background: 'linear-gradient(165deg, rgba(139,92,246,0.22), rgba(99,102,241,0.08))',
      border: '1px solid var(--border-violet)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--violet-300)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 18
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(165deg, rgba(139,92,246,0.18), rgba(99,102,241,0.06))',
      border: '1px solid var(--border-violet)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      color: 'var(--violet-300)',
      fontWeight: 700,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 15
  }), " Upgrade to Pro"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 12,
      margin: '8px 0 12px',
      lineHeight: 1.4
    }
  }, "Unlock unlimited notes, AI tutor & more."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    fullWidth: true
  }, "Upgrade Now")), /*#__PURE__*/React.createElement("button", {
    title: "Minh Nguyen \u2014 Pro Plan",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      background: 'transparent',
      border: '1px solid transparent',
      borderRadius: 'var(--radius-md)',
      padding: collapsed ? '4px' : '8px',
      cursor: 'pointer',
      textAlign: 'left',
      justifyContent: collapsed ? 'center' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Minh Nguyen",
    size: "md",
    ring: true
  }), !collapsed && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "Minh Nguyen"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 11.5
    }
  }, "Pro Plan")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--text-tertiary)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginTop: 8,
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 10
    }
  }, navRow({
    id: 'settings',
    icon: 'settings',
    label: 'Settings'
  }), navRow({
    id: 'help',
    icon: 'life-buoy',
    label: 'Help & Support'
  })));
}

// Hover style for the toggle
if (typeof document !== 'undefined' && !document.getElementById('tempo-sidebar-toggle-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-sidebar-toggle-css';
  s.textContent = `.tempo-sidebar-toggle:hover { background: var(--surface-2); color: var(--text-primary); border-color: var(--border-strong); }`;
  document.head.appendChild(s);
}
Object.assign(window, {
  Sidebar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/TopBar.jsx
try { (() => {
// Tempo UI kit — top bar (search + contextual actions)
function TopBar({
  placeholder = 'Search study spaces, notes, flashcards…',
  actions
}) {
  const {
    Input,
    IconButton
  } = window.TempoDesignSystem_e112f2;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '14px 28px',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 5,
      background: 'rgba(10,12,19,0.82)',
      backdropFilter: 'var(--blur-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement(Input, {
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 16
    }),
    placeholder: placeholder,
    iconRight: /*#__PURE__*/React.createElement("kbd", {
      style: {
        font: 'var(--text-caption)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 5,
        padding: '1px 6px'
      }
    }, "/")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    variant: "ghost"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 15,
      height: 15,
      borderRadius: 999,
      background: 'var(--violet-500)',
      color: '#fff',
      fontSize: 9,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid var(--bg-base)'
    }
  }, "3")), actions));
}
Object.assign(window, {
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/data.jsx
try { (() => {
// Tempo UI kit — shared mock data
const AVATARS = [{
  name: 'Minh Nguyen'
}, {
  name: 'Emily Johnson'
}, {
  name: 'Alex Chen'
}, {
  name: 'Sarah Lee'
}, {
  name: 'David Park'
}, {
  name: 'Nina Patel'
}, {
  name: 'Kevin Tran'
}, {
  name: 'Julia Kim'
}, {
  name: 'Andrew Ng'
}];
const NAV_MAIN = [{
  id: 'learn',
  label: 'Learn',
  icon: 'graduation-cap'
}, {
  id: 'library',
  label: 'Library',
  icon: 'library'
}, {
  id: 'explore',
  label: 'Explore',
  icon: 'compass'
}, {
  id: 'groups',
  label: 'Groups',
  icon: 'users'
}, {
  id: 'analytics',
  label: 'Analytics',
  icon: 'bar-chart-3'
}];
const NAV_AI = [{
  id: 'tempo-ai',
  label: 'Tempo AI',
  icon: 'sparkles'
}, {
  id: 'exam-gen',
  label: 'Exam Generator',
  icon: 'file-check-2'
}, {
  id: 'import',
  label: 'Import Quizlet',
  icon: 'download'
}];
const STATS = [{
  label: 'Total Study Time',
  value: '128h 45m',
  delta: '18%',
  caption: 'vs May 5 – May 18',
  icon: 'clock',
  tone: 'violet'
}, {
  label: 'Cards Reviewed',
  value: '3,842',
  delta: '22%',
  caption: 'vs May 5 – May 18',
  icon: 'layers',
  tone: 'blue'
}, {
  label: 'Notes Created',
  value: '96',
  delta: '15%',
  caption: 'vs May 5 – May 18',
  icon: 'file-text',
  tone: 'green'
}, {
  label: 'Exams Taken',
  value: '24',
  delta: '33%',
  caption: 'vs May 5 – May 18',
  icon: 'clipboard-list',
  tone: 'amber'
}, {
  label: 'Average Mastery',
  value: '68%',
  delta: '12%',
  caption: 'vs May 5 – May 18',
  icon: 'target',
  tone: 'violet'
}];
const WEAK_TOPICS = [{
  name: 'Thermodynamics',
  pct: 42
}, {
  name: 'Backpropagation',
  pct: 48
}, {
  name: 'Linear Algebra',
  pct: 55
}, {
  name: 'Operating Systems',
  pct: 61
}, {
  name: 'Data Structures',
  pct: 67
}];
const STUDY_BY_TYPE = [{
  name: 'Flashcards',
  pct: 52,
  color: 'var(--chart-1)'
}, {
  name: 'Notes',
  pct: 24,
  color: 'var(--chart-2)'
}, {
  name: 'Exams',
  pct: 16,
  color: 'var(--chart-3)'
}, {
  name: 'AI Chat (Tutor)',
  pct: 8,
  color: 'var(--chart-4)'
}];
const LEADERS = [{
  rank: 1,
  name: 'Emily Johnson',
  time: '142h 30m',
  verified: true
}, {
  rank: 2,
  name: 'Minh Nguyen (You)',
  time: '128h 45m',
  you: true
}, {
  rank: 3,
  name: 'David Park',
  time: '115h 20m'
}, {
  rank: 4,
  name: 'Sarah Lee',
  time: '98h 10m'
}, {
  rank: 5,
  name: 'Alex Chen',
  time: '87h 40m'
}];
const SPACES = [{
  name: 'Deep Learning',
  subject: 'Computer Science',
  tone: 'cs',
  mastery: 72,
  notes: 12,
  cards: 240,
  exams: 5,
  members: 4,
  due: 18,
  pinned: true
}, {
  name: 'Operating Systems',
  subject: 'Computer Science',
  tone: 'cs',
  mastery: 65,
  notes: 8,
  cards: 168,
  exams: 3,
  members: 6,
  due: 12,
  pinned: true
}, {
  name: 'Database Systems',
  subject: 'Computer Science',
  tone: 'cs',
  mastery: 58,
  notes: 7,
  cards: 132,
  exams: 2,
  members: 5,
  due: 6,
  pinned: true
}, {
  name: 'Linear Algebra',
  subject: 'Mathematics',
  tone: 'math',
  mastery: 80,
  notes: 10,
  cards: 200,
  exams: 4,
  members: 3,
  due: 8
}, {
  name: 'Thermodynamics',
  subject: 'Physics',
  tone: 'physics',
  mastery: 40,
  notes: 5,
  cards: 86,
  exams: 1,
  members: 2,
  due: 32
}, {
  name: 'Chemistry Basics',
  subject: 'Science',
  tone: 'science',
  mastery: 55,
  notes: 6,
  cards: 110,
  exams: 2,
  members: 3,
  due: 20
}];
const NOTES = [{
  title: 'Quantum Mechanics Comprehensive Notes',
  level: 'Detailed',
  tone: 'violet',
  desc: 'Complete notes covering wave mechanics, Schrödinger equation, operators…',
  pages: 32,
  read: 100,
  edited: '2 days ago',
  fav: true
}, {
  title: 'Neural Networks Basics',
  level: 'Normal',
  tone: 'blue',
  desc: 'Key concepts of neural networks, backpropagation, activation functions, and training…',
  pages: 18,
  read: 76,
  edited: '4 days ago'
}, {
  title: 'Calculus II Summary',
  level: 'Basic',
  tone: 'green',
  desc: 'Limits, derivatives, integrals, and applications summary.',
  pages: 12,
  read: 100,
  edited: '1 week ago'
}, {
  title: 'Deep Learning Advanced Concepts',
  level: 'Detailed',
  tone: 'violet',
  desc: 'CNN, RNN, Transformer, Attention mechanism and modern architectures.',
  pages: 45,
  read: 45,
  edited: '1 week ago',
  fav: true
}, {
  title: 'Operating Systems Notes',
  level: 'Normal',
  tone: 'blue',
  desc: 'Processes, threads, memory management, CPU scheduling, file systems…',
  pages: 26,
  read: 32,
  edited: '2 weeks ago'
}, {
  title: 'English Grammar Essentials',
  level: 'Basic',
  tone: 'green',
  desc: 'Tenses, sentence structure, parts of speech and common rules.',
  pages: 10,
  read: 100,
  edited: '2 weeks ago'
}, {
  title: 'Data Structures & Algorithms',
  level: 'Detailed',
  tone: 'violet',
  desc: 'Arrays, linked lists, trees, graphs, sorting and searching algorithms.',
  pages: 38,
  read: 60,
  edited: '3 weeks ago'
}, {
  title: 'Thermodynamics Overview',
  level: 'Normal',
  tone: 'blue',
  desc: 'Laws of thermodynamics, cycles, entropy and applications.',
  pages: 20,
  read: 85,
  edited: '3 weeks ago'
}, {
  title: 'Linear Algebra Cheat Sheet',
  level: 'Basic',
  tone: 'green',
  desc: 'Vectors, matrices, eigenvalues, transformations quick reference.',
  pages: 8,
  read: 100,
  edited: '1 month ago'
}];
const TRENDING = [{
  rank: 1,
  name: 'Deep Learning Mastery',
  author: 'Julia Kim',
  notes: 12,
  cards: 450,
  exams: 5,
  learners: '2.3k',
  rating: '4.9',
  mastery: '+18%'
}, {
  rank: 2,
  name: 'Operating Systems Complete Guide',
  author: 'Alex Chen',
  notes: 9,
  cards: 320,
  exams: 4,
  learners: '1.8k',
  rating: '4.8',
  mastery: '+16%'
}, {
  rank: 3,
  name: 'Data Structures & Algorithms',
  author: 'Sarah Lee',
  notes: 15,
  cards: 600,
  exams: 6,
  learners: '3.1k',
  rating: '4.9',
  mastery: '+22%'
}, {
  rank: 4,
  name: 'Linear Algebra Essentials',
  author: 'David Park',
  notes: 8,
  cards: 250,
  exams: 3,
  learners: '1.2k',
  rating: '4.8',
  mastery: '+15%'
}];
const GROUPS = [{
  name: 'Deep Learning Squad',
  tone: 'cs',
  members: 12,
  desc: 'Master deep learning concepts and build AI models together.',
  resources: 24,
  notes: 8,
  cards: 356,
  next: 'Next session in 2h 30m',
  pro: true
}, {
  name: 'Algorithms Club',
  tone: 'science',
  members: 8,
  desc: 'Discuss and practice algorithms for coding interviews.',
  resources: 18,
  notes: 6,
  cards: 220,
  next: 'Next session tomorrow'
}, {
  name: 'Chemistry 101 Study Group',
  tone: 'math',
  members: 15,
  desc: 'Ace our chemistry exams with shared notes and questions.',
  resources: 32,
  notes: 14,
  cards: 512,
  next: 'Next session in 1d'
}, {
  name: 'Calculus Study Circle',
  tone: 'lang',
  members: 6,
  desc: 'Master calculus step by step with practice and discussions.',
  resources: 10,
  notes: 5,
  cards: 180,
  next: 'No upcoming session'
}];
const EXPLORE_GROUPS = [{
  name: 'System Design Community',
  desc: 'Learn system design and architecture together.',
  icon: 'code-xml',
  tone: 'cs',
  members: '+28',
  docs: 48,
  notes: 23,
  cards: 420,
  activity: 'Active now',
  active: true,
  hub: true
}, {
  name: 'Biology Students Hub',
  desc: 'Share notes, quizzes and study for exams.',
  icon: 'dna',
  tone: 'science',
  members: '+16',
  docs: 31,
  notes: 12,
  cards: 305,
  activity: '2h ago'
}, {
  name: 'English Literature Lovers',
  desc: 'Explore books, summaries and critical analysis.',
  icon: 'book-open',
  tone: 'lang',
  members: '+12',
  docs: 25,
  notes: 18,
  cards: 210,
  activity: 'Today'
}, {
  name: 'Data Science Learners',
  desc: 'From data analysis to ML, learn together.',
  icon: 'bar-chart-3',
  tone: 'math',
  members: '+35',
  docs: 56,
  notes: 30,
  cards: 615,
  activity: 'Active now',
  active: true
}, {
  name: 'Physics Problem Solvers',
  desc: 'Solve problems, discuss concepts, succeed.',
  icon: 'atom',
  tone: 'physics',
  members: '+9',
  docs: 19,
  notes: 7,
  cards: 142,
  activity: '1d ago'
}];
const AI_INSIGHTS = [{
  icon: 'trending-up',
  tone: 'green',
  title: "You're improving!",
  body: 'Your mastery score increased 12% this month.'
}, {
  icon: 'calendar-x',
  tone: 'red',
  title: 'Review overdue',
  body: '142 cards are overdue. Review them to boost retention.'
}, {
  icon: 'target',
  tone: 'amber',
  title: 'Weak topics detected',
  body: 'Thermodynamics, Backpropagation, and Linear Algebra need more practice.'
}, {
  icon: 'clock',
  tone: 'violet',
  title: 'Best time to study',
  body: "You're most productive between 7PM – 10PM."
}];
const FLASHCARDS = [{
  title: 'MLN111',
  icon: 'brain',
  tone: 'violet',
  cards: 10,
  studied: 80,
  status: 'Public',
  when: '3 days ago',
  author: 'Alice Nguyen',
  fav: true
}, {
  title: 'Evaluating scientific claims',
  icon: 'flask-conical',
  tone: 'violet',
  cards: 10,
  studied: 45,
  status: 'Public',
  when: '4 days ago',
  author: 'Alice Nguyen'
}, {
  title: 'Quantum Mechanics Intro',
  icon: 'atom',
  tone: 'blue',
  cards: 15,
  studied: 0,
  status: 'Private',
  when: '6/1/2026',
  author: 'Alice Nguyen'
}, {
  title: 'Linear Algebra Review',
  icon: 'sigma',
  tone: 'red',
  cards: 24,
  studied: 10,
  status: 'Public',
  when: '1 week ago',
  author: 'Alice Nguyen'
}, {
  title: 'Deep Learning Basics',
  icon: 'network',
  tone: 'green',
  cards: 32,
  studied: 65,
  status: 'Studying',
  when: '2 weeks ago',
  author: 'Alice Nguyen',
  fav: true
}, {
  title: 'Statistics Formulas',
  icon: 'bar-chart-3',
  tone: 'amber',
  cards: 18,
  studied: 30,
  status: 'Private',
  when: '2 weeks ago',
  author: 'Alice Nguyen'
}, {
  title: 'Thermodynamics',
  icon: 'flame',
  tone: 'amber',
  cards: 20,
  studied: 0,
  status: 'Shared',
  when: '3 weeks ago',
  author: 'Alice Nguyen'
}, {
  title: 'Data Structures',
  icon: 'layers',
  tone: 'teal',
  cards: 25,
  studied: 90,
  status: 'Public',
  when: '1 month ago',
  author: 'Alice Nguyen'
}, {
  title: 'Calculus 2',
  icon: 'function-square',
  tone: 'violet',
  cards: 28,
  studied: 55,
  status: 'Private',
  when: '1 month ago',
  author: 'Alice Nguyen',
  fav: true
}, {
  title: 'Operating Systems',
  icon: 'cpu',
  tone: 'blue',
  cards: 22,
  studied: 70,
  status: 'Studying',
  when: '1 month ago',
  author: 'Alice Nguyen'
}, {
  title: 'Computer Networks',
  icon: 'wifi',
  tone: 'blue',
  cards: 16,
  studied: 15,
  status: 'Shared',
  when: '2 months ago',
  author: 'Alice Nguyen'
}, {
  title: 'Database Systems',
  icon: 'database',
  tone: 'teal',
  cards: 26,
  studied: 40,
  status: 'Public',
  when: '2 months ago',
  author: 'Alice Nguyen'
}];
Object.assign(window, {
  AVATARS,
  NAV_MAIN,
  NAV_AI,
  STATS,
  WEAK_TOPICS,
  STUDY_BY_TYPE,
  LEADERS,
  SPACES,
  NOTES,
  FLASHCARDS,
  TRENDING,
  GROUPS,
  EXPLORE_GROUPS,
  AI_INSIGHTS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tempo-app/helpers.jsx
try { (() => {
// Tempo UI kit — shared helpers (icons, subject tones, decorative backdrops)

// Lucide icon wrapper. Renders an <i data-lucide>; App calls lucide.createIcons()
// after every commit so these hydrate into SVGs.
function Icon({
  name,
  size = 18,
  color,
  style
}) {
  return /*#__PURE__*/React.createElement("i", {
    "data-lucide": name,
    style: {
      width: size,
      height: size,
      color,
      display: 'inline-flex',
      ...style
    }
  });
}
const SUBJECT = {
  cs: {
    color: 'var(--subject-cs)',
    soft: 'rgba(139,92,246,0.16)'
  },
  math: {
    color: 'var(--subject-math)',
    soft: 'rgba(91,157,248,0.16)'
  },
  science: {
    color: 'var(--subject-science)',
    soft: 'rgba(63,209,128,0.16)'
  },
  lang: {
    color: 'var(--subject-lang)',
    soft: 'rgba(246,178,60,0.16)'
  },
  bio: {
    color: 'var(--subject-bio)',
    soft: 'rgba(45,212,191,0.16)'
  },
  physics: {
    color: 'var(--subject-physics)',
    soft: 'rgba(240,88,79,0.16)'
  }
};

// Stylized "constellation" backdrop used on study-space / group banners,
// tinted to the subject color (stand-in for the product's decorative art).
function subjectBackdrop(tone) {
  const c = (SUBJECT[tone] || SUBJECT.cs).color;
  return {
    background: `
      radial-gradient(120px 80px at 22% 30%, ${(SUBJECT[tone] || SUBJECT.cs).soft}, transparent 70%),
      radial-gradient(140px 90px at 78% 60%, ${(SUBJECT[tone] || SUBJECT.cs).soft}, transparent 70%),
      linear-gradient(160deg, var(--surface-2), var(--surface-1))`,
    position: 'relative',
    overflow: 'hidden'
  };
}

// SVG dotted network overlay for banners
function Constellation({
  tone = 'cs',
  opacity = 0.5
}) {
  const c = (SUBJECT[tone] || SUBJECT.cs).color;
  const pts = [[20, 30], [55, 18], [80, 40], [110, 22], [140, 48], [40, 60], [95, 68], [150, 72], [125, 90], [65, 88]];
  const lines = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [2, 6], [6, 8], [5, 9], [9, 6]];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 170 110",
    preserveAspectRatio: "xMidYMid slice",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity
    }
  }, lines.map(([a, b], i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: pts[a][0],
    y1: pts[a][1],
    x2: pts[b][0],
    y2: pts[b][1],
    stroke: c,
    strokeWidth: "0.5",
    opacity: "0.4"
  })), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: i % 3 === 0 ? 2.2 : 1.4,
    fill: c,
    opacity: i % 2 ? 0.9 : 0.6
  })));
}

// Donut chart from [{pct,color}] segments
function Donut({
  segments,
  size = 150,
  thickness = 22,
  centerTop,
  centerBottom
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-3)",
    strokeWidth: thickness
  }), segments.map((s, i) => {
    const len = s.pct / 100 * c;
    const el = /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      stroke: s.color,
      strokeWidth: thickness,
      strokeDasharray: `${len} ${c - len}`,
      strokeDashoffset: -offset
    });
    offset += len;
    return el;
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.16,
      color: 'var(--text-primary)',
      lineHeight: 1.05
    }
  }, centerTop), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.09,
      color: 'var(--text-tertiary)'
    }
  }, centerBottom)));
}
Object.assign(window, {
  Icon,
  SUBJECT,
  subjectBackdrop,
  Constellation,
  Donut
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tempo-app/helpers.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.ProgressRing = __ds_scope.ProgressRing;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
