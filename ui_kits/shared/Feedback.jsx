// Tempo Feedback primitives — Toast, Dialog, AlertDialog
// Anatomy, dismissal rules and a11y behaviour follow the Astryx design system
// (facebook/astryx). Styling uses Tempo's own design tokens, so there is no
// runtime dependency on Astryx and no build step is required.
//
// Exposed on window.TempoFeedback (this app loads plain <script type="text/babel">
// files, not ES modules).

(function () {
  // ─────────────────────────────────────────────────────────────
  // Toast — brief, non-blocking feedback. Replaces alert().
  // Astryx rules honoured:
  //  - info auto-hides (5s), error persists until dismissed
  //  - dismiss button always present
  //  - uniqueID de-duplicates repeated actions
  //  - stacked in a viewport, newest last, max 3 visible
  // ─────────────────────────────────────────────────────────────

  let toastSeq = 0;
  let toastListeners = [];
  let toastQueue = [];

  function emitToasts() {
    toastListeners.forEach((fn) => fn(toastQueue));
  }

  function toast(input) {
    const opts = typeof input === 'string' ? { body: input } : (input || {});
    const type = opts.type === 'error' ? 'error' : opts.type === 'success' ? 'success' : 'info';
    // Astryx: isAutoHide defaults true for info, false for error.
    const isAutoHide = opts.isAutoHide != null ? opts.isAutoHide : type !== 'error';
    const uniqueID = opts.uniqueID || null;

    if (uniqueID) {
      const existing = toastQueue.find((t) => t.uniqueID === uniqueID);
      if (existing) {
        if (opts.collisionBehavior === 'ignore') return existing.id;
        toastQueue = toastQueue.filter((t) => t.uniqueID !== uniqueID); // overwrite
      }
    }

    const item = {
      id: ++toastSeq,
      body: opts.body || '',
      type,
      isAutoHide,
      autoHideDuration: opts.autoHideDuration || 5000,
      endContent: opts.endContent || null,
      uniqueID,
      onHide: opts.onHide,
    };
    toastQueue = [...toastQueue, item];
    emitToasts();
    return item.id;
  }

  function dismissToast(id, reason) {
    const item = toastQueue.find((t) => t.id === id);
    toastQueue = toastQueue.filter((t) => t.id !== id);
    emitToasts();
    if (item && typeof item.onHide === 'function') item.onHide(reason || 'manual');
  }

  const TOAST_ACCENT = {
    info: 'var(--info)',
    success: 'var(--success)',
    error: 'var(--danger)',
  };
  const TOAST_ICON = { info: 'info', success: 'check-circle', error: 'alert-circle' };

  function ToastItem({ item }) {
    const [leaving, setLeaving] = React.useState(false);

    const close = React.useCallback((reason) => {
      setLeaving(true);
      setTimeout(() => dismissToast(item.id, reason), 160);
    }, [item.id]);

    React.useEffect(() => {
      if (!item.isAutoHide) return;
      const t = setTimeout(() => close('auto'), item.autoHideDuration);
      return () => clearTimeout(t);
    }, [item.isAutoHide, item.autoHideDuration, close]);

    return (
      <div
        // Astryx: errors are assertive, everything else polite.
        role={item.type === 'error' ? 'alert' : 'status'}
        aria-live={item.type === 'error' ? 'assertive' : 'polite'}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          width: 'min(400px, calc(100vw - 32px))',
          padding: '13px 14px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-strong)',
          borderLeft: `3px solid ${TOAST_ACCENT[item.type]}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-primary)',
          font: 'var(--text-body)',
          fontSize: 13.5,
          lineHeight: 1.45,
          pointerEvents: 'auto',
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateY(-6px) scale(0.98)' : 'translateY(0) scale(1)',
          transition: `opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-out)`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flex: '0 0 18px', width: 18, height: 18, marginTop: 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: TOAST_ACCENT[item.type],
          }}
        >
          <i data-lucide={TOAST_ICON[item.type]} style={{ width: 16, height: 16 }}></i>
        </span>

        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>{item.body}</div>

        {item.endContent && <div style={{ flex: '0 0 auto' }}>{item.endContent}</div>}

        <button
          type="button"
          onClick={() => close('manual')}
          aria-label="Đóng thông báo"
          style={{
            flex: '0 0 auto', width: 22, height: 22, marginTop: -1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            transition: 'var(--t-colors)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >
          <i data-lucide="x" style={{ width: 13, height: 13 }}></i>
        </button>
      </div>
    );
  }

  // Render once near the root of the app.
  function ToastHost({ position = 'topEnd', maxVisible = 3 }) {
    const [items, setItems] = React.useState(toastQueue);

    React.useEffect(() => {
      toastListeners.push(setItems);
      return () => { toastListeners = toastListeners.filter((f) => f !== setItems); };
    }, []);

    React.useEffect(() => {
      if (window.lucide) requestAnimationFrame(() => window.lucide.createIcons());
    }, [items]);

    if (!items.length) return null;

    const pos = {
      topEnd: { top: 16, right: 16, alignItems: 'flex-end' },
      topCenter: { top: 16, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
      bottomEnd: { bottom: 16, right: 16, alignItems: 'flex-end' },
    }[position] || { top: 16, right: 16, alignItems: 'flex-end' };

    return ReactDOM.createPortal(
      <div
        style={{
          position: 'fixed', zIndex: 400,
          display: 'flex', flexDirection: 'column', gap: 10,
          pointerEvents: 'none',
          ...pos,
        }}
      >
        {items.slice(-maxVisible).map((item) => (
          <ToastItem key={item.id} item={item} />
        ))}
      </div>,
      document.body
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Dialog — modal overlay. Astryx anatomy: Header (title + close),
  // Body, optional Footer, Backdrop.
  // purpose: 'info'     → Escape + backdrop click both dismiss
  //          'form'     → backdrop click disabled (don't lose input)
  //          'required' → neither dismisses; must use an action
  // ─────────────────────────────────────────────────────────────

  function useScrollLock(active) {
    React.useEffect(() => {
      if (!active) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [active]);
  }

  // Minimal focus trap: keeps Tab within the dialog and restores focus on close.
  function useFocusTrap(ref, active) {
    React.useEffect(() => {
      if (!active || !ref.current) return;
      const previouslyFocused = document.activeElement;
      const node = ref.current;

      const selector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusables = () => Array.from(node.querySelectorAll(selector)).filter((el) => el.offsetParent !== null);

      // Astryx: the title receives focus on open.
      const title = node.querySelector('[data-dialog-title]');
      (title || focusables()[0] || node).focus?.();

      const onKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      };

      node.addEventListener('keydown', onKeyDown);
      return () => {
        node.removeEventListener('keydown', onKeyDown);
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
      };
    }, [ref, active]);
  }

  function Dialog({
    isOpen,
    onOpenChange,
    children,
    width = 460,
    maxHeight = '85vh',
    purpose = 'info',
    labelledBy,
  }) {
    const panelRef = React.useRef(null);
    useScrollLock(isOpen);
    useFocusTrap(panelRef, isOpen);

    React.useEffect(() => {
      if (!isOpen || purpose === 'required') return;
      const onKey = (e) => { if (e.key === 'Escape') onOpenChange(false); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, purpose, onOpenChange]);

    React.useEffect(() => {
      if (isOpen && window.lucide) requestAnimationFrame(() => window.lucide.createIcons());
    }, [isOpen]);

    if (!isOpen) return null;

    const backdropDismissable = purpose === 'info';

    return ReactDOM.createPortal(
      <div
        onClick={() => { if (backdropDismissable) onOpenChange(false); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(4,6,11,0.72)', backdropFilter: 'var(--blur-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          animation: 'tempoFadeIn var(--dur-fast) var(--ease-standard)',
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: typeof width === 'number' ? `min(${width}px, 100%)` : width,
            maxHeight,
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            animation: 'tempoDialogIn var(--dur-base) var(--ease-out)',
          }}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }

  function DialogHeader({ title, subtitle, onOpenChange, id }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, padding: '20px 22px 16px',
      }}>
        <div style={{ minWidth: 0 }}>
          <h3
            id={id}
            data-dialog-title
            tabIndex={-1}
            style={{
              margin: 0, outline: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19,
              lineHeight: 1.3, color: 'var(--text-primary)',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {onOpenChange && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng"
            style={{
              flex: '0 0 auto', width: 30, height: 30,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid transparent',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)',
              cursor: 'pointer', transition: 'var(--t-colors)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <i data-lucide="x" style={{ width: 16, height: 16 }}></i>
          </button>
        )}
      </div>
    );
  }

  function DialogBody({ children, padding = '0 22px 4px' }) {
    return (
      <div style={{ padding, overflowY: 'auto', flex: 1, minHeight: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.55 }}>
        {children}
      </div>
    );
  }

  function DialogFooter({ children, hasDivider = true }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        padding: '16px 22px 20px', marginTop: 8,
        borderTop: hasDivider ? '1px solid var(--border-subtle)' : 'none',
      }}>
        {children}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // AlertDialog — confirm a destructive / irreversible action.
  // Astryx: cannot be dismissed by backdrop; requires an explicit choice.
  // ─────────────────────────────────────────────────────────────

  function AlertDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    onConfirm,
    isDestructive = true,
    isBusy = false,
  }) {
    const titleId = React.useMemo(() => `alert-title-${Math.random().toString(36).slice(2, 8)}`, []);

    return (
      <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={420} purpose="required" labelledBy={titleId}>
        <DialogHeader title={title} subtitle={description} id={titleId} />
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
            style={{
              height: 40, padding: '0 16px',
              background: 'transparent', color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
              cursor: isBusy ? 'not-allowed' : 'pointer', transition: 'var(--t-colors)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            style={{
              height: 40, padding: '0 16px',
              background: isDestructive ? 'var(--danger)' : 'var(--grad-brand)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.7 : 1,
              transition: 'var(--t-colors)',
            }}
          >
            {isBusy ? 'Đang xử lý...' : confirmLabel}
          </button>
        </DialogFooter>
      </Dialog>
    );
  }

  // Keyframes used by Dialog / Toast.
  if (typeof document !== 'undefined' && !document.getElementById('tempo-feedback-css')) {
    const style = document.createElement('style');
    style.id = 'tempo-feedback-css';
    style.textContent = `
      @keyframes tempoFadeIn { from { opacity: 0 } to { opacity: 1 } }
      @keyframes tempoDialogIn {
        from { opacity: 0; transform: translateY(8px) scale(0.98) }
        to   { opacity: 1; transform: translateY(0) scale(1) }
      }
      @media (prefers-reduced-motion: reduce) {
        @keyframes tempoDialogIn { from { opacity: 0 } to { opacity: 1 } }
      }
    `;
    document.head.appendChild(style);
  }

  window.TempoFeedback = {
    toast,
    dismissToast,
    ToastHost,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    AlertDialog,
  };
  // Convenience global so replacing alert() stays a one-line change.
  window.toast = toast;
})();
