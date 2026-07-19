// Tempo landing — FAQ section with accordion

const FAQ_ITEMS = [
  {
    q: 'What file formats does Tempo support?',
    a: 'Free users can upload DOCX files up to 3 MB. Pro users can upload DOCX, PDF, and PPTX files up to 10 MB each. We are continuously working to support more formats.',
  },
  {
    q: 'How does the AI generate flashcards and notes?',
    a: 'Tempo uses advanced AI to analyze your documents, identify key concepts, definitions, and relationships, then automatically generates structured flashcards and comprehensive notes. You can review and edit everything before studying.',
  },
  {
    q: 'Can I share my study materials with others?',
    a: 'Yes! You can share flashcard decks and notes with classmates via email. You can also make your materials public so anyone can discover and study from them. Pro users get full collaboration features including study groups.',
  },
  {
    q: 'What is the Tempo Assistant?',
    a: 'The Tempo Assistant is your AI-powered study buddy. Ask it questions about your documents, get explanations of difficult concepts, quiz yourself, and get personalized study recommendations. Free users get 10 uses; Pro users get unlimited access.',
  },
  {
    q: 'Can I cancel my Pro subscription anytime?',
    a: 'Absolutely. You can cancel your Pro subscription at any time from your account settings. Your Pro features will remain active until the end of your current billing period. No cancellation fees.',
  },
  {
    q: 'Is my data secure?',
    a: 'We take data security seriously. All documents are encrypted in transit and at rest. We never share your personal data or study materials with third parties. You can delete your data at any time.',
  },
  {
    q: 'How does the yearly billing work?',
    a: 'The yearly plan is billed as a single payment of 299,000đ per year (equivalent to ~25,000đ/month). This saves you 29% compared to the monthly plan at 35,000đ/month.',
  },
  {
    q: 'Do I need to create an account to try Tempo?',
    a: 'You can explore the landing page freely, but you\'ll need a free account to start uploading documents and generating study materials. Sign up takes less than 30 seconds — just use your Google account or email.',
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ padding: '100px 24px', maxWidth: 780, margin: '0 auto' }}>
      {/* Frosted background panel */}
      <div style={{
        background: 'rgba(10,12,19,0.72)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        border: '1px solid rgba(38,44,59,0.5)',
        borderRadius: 'var(--radius-2xl)',
        padding: '48px 40px',
      }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <p style={{
          fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 'var(--ls-wider)', color: 'var(--violet-400)', marginBottom: 14,
        }}>FAQ</p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1,
          letterSpacing: '-0.02em', color: 'var(--text-primary)',
          margin: '0 0 16px', textWrap: 'balance',
        }}>Frequently asked questions</h2>
        <p style={{ font: 'var(--text-body-lg)', color: 'var(--text-secondary)', fontSize: 17 }}>
          Everything you need to know about Tempo.
        </p>
      </div>

      {/* Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {FAQ_ITEMS.map((item, i) => (
          <FAQItem key={i} item={item} isOpen={openIdx === i} onToggle={() => toggle(i)} isLast={i === FAQ_ITEMS.length - 1} />
        ))}
      </div>

      {/* Still have questions? */}
      <div style={{
        marginTop: 48, padding: '32px 28px', textAlign: 'center',
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(139,92,246,0.14)', color: 'var(--violet-400)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <i data-lucide="message-circle" style={{ width: 22, height: 22 }}></i>
        </div>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>
          Still have questions?
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Can't find the answer you're looking for? Reach out to our friendly support team.
        </p>
        <a href="#" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 42, padding: '0 24px',
          background: 'var(--surface-2)', color: 'var(--text-primary)',
          border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
          textDecoration: 'none', transition: 'var(--t-colors), transform 0.12s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet-500)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          <i data-lucide="mail" style={{ width: 15, height: 15 }}></i>
          Contact support
        </a>
      </div>
      </div>
    </section>
  );
}

function FAQItem({ item, isOpen, onToggle, isLast }) {
  const contentRef = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '20px 4px', background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15.5,
          color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'color 0.2s ease', lineHeight: 1.4,
        }}>{item.q}</span>
        <span style={{
          width: 28, height: 28, flex: '0 0 28px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          background: isOpen ? 'rgba(139,92,246,0.15)' : 'var(--surface-2)',
          color: isOpen ? 'var(--violet-400)' : 'var(--text-tertiary)',
          transition: 'all 0.25s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>
          <i data-lucide="plus" style={{ width: 15, height: 15 }}></i>
        </span>
      </button>
      <div style={{
        overflow: 'hidden',
        maxHeight: isOpen ? height : 0,
        transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div ref={contentRef} style={{
          padding: '0 4px 20px',
          color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.65,
        }}>
          {item.a}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FAQSection });
