// Tempo landing — features grid

const FEATURES = [
  {
    icon: 'file-up',
    title: 'Upload anything',
    desc: 'Drop in PDFs, DOCX, or PPTX files. Tempo reads and understands your material in seconds.',
    accent: 'var(--violet-500)',
  },
  {
    icon: 'sparkles',
    title: 'AI-powered generation',
    desc: 'Our assistant analyzes your documents and generates comprehensive flashcards and notes automatically.',
    accent: 'var(--indigo-400)',
  },
  {
    icon: 'brain',
    title: 'Smart study sessions',
    desc: 'Spaced-repetition algorithms adapt to your performance and focus on your weakest topics.',
    accent: 'var(--success)',
  },
  {
    icon: 'bar-chart-3',
    title: 'Track your progress',
    desc: 'Detailed analytics show your study patterns, strengths, and areas that need more attention.',
    accent: 'var(--info)',
  },
  {
    icon: 'users',
    title: 'Study groups',
    desc: 'Collaborate with classmates, share flashcard decks, and compete on leaderboards.',
    accent: 'var(--warning)',
  },
  {
    icon: 'bot',
    title: 'Tempo Assistant',
    desc: 'Ask questions, get explanations, and dive deeper into any concept with our AI chat.',
    accent: 'var(--violet-400)',
  },
];

function FeaturesSection() {
  return (
    <section id="features" style={{
      padding: '100px 24px',
      maxWidth: 1200, margin: '0 auto',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{
          fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 'var(--ls-wider)', color: 'var(--violet-400)',
          marginBottom: 14,
        }}>Features</p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1,
          letterSpacing: '-0.02em', color: 'var(--text-primary)',
          margin: '0 0 16px', textWrap: 'balance',
        }}>Everything you need to study effectively</h2>
        <p style={{ font: 'var(--text-body-lg)', color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', fontSize: 17 }}>
          From document upload to exam day — Tempo covers the entire study workflow.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, accent }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: 28,
        background: hov ? 'var(--surface-2)' : 'var(--surface-1)',
        border: `1px solid ${hov ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? '0 12px 40px -12px rgba(139,92,246,0.2)' : 'var(--shadow-sm)',
        cursor: 'default',
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: `color-mix(in oklch, ${accent} 14%, transparent)`,
        color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
      }}>
        <i data-lucide={icon} style={{ width: 24, height: 24 }}></i>
      </div>
      <h3 style={{
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 18,
        color: 'var(--text-primary)', marginBottom: 10,
      }}>{title}</h3>
      <p style={{
        font: 'var(--text-body-md)', color: 'var(--text-secondary)',
        lineHeight: 1.55, margin: 0,
      }}>{desc}</p>
    </div>
  );
}

Object.assign(window, { FeaturesSection });
