// Tempo landing — pricing with Free / Pro

function PricingSection({ onSignup }) {
  const [yearly, setYearly] = React.useState(true);

  const toggleStyle = (on) => ({
    padding: '7px 18px', borderRadius: 'var(--radius-pill)',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none',
    fontFamily: 'var(--font-sans)',
    background: on ? 'var(--violet-500)' : 'transparent',
    color: on ? '#fff' : 'var(--text-secondary)',
    transition: 'var(--t-colors)',
  });

  return (
    <section id="pricing" style={{ padding: '100px 24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{
          fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 'var(--ls-wider)', color: 'var(--violet-400)', marginBottom: 14,
        }}>Pricing</p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1,
          letterSpacing: '-0.02em', color: 'var(--text-primary)',
          margin: '0 0 16px', textWrap: 'balance',
        }}>Simple, transparent pricing</h2>
        <p style={{ font: 'var(--text-body-lg)', color: 'var(--text-secondary)', fontSize: 17, margin: '0 0 28px' }}>
          Start free. Upgrade when you're ready for unlimited power.
        </p>
        {/* Toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)', padding: 3,
        }}>
          <button onClick={() => setYearly(false)} style={toggleStyle(!yearly)}>Monthly</button>
          <button onClick={() => setYearly(true)} style={toggleStyle(yearly)}>
            Yearly
            <span style={{
              marginLeft: 6, padding: '2px 8px',
              background: 'rgba(63,209,128,0.18)', color: 'var(--success-text)',
              borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700,
            }}>−29%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
        <PricingCard
          name="Free"
          desc="Perfect for getting started"
          price="0"
          unit="/month"
          cta="Get started"
          ctaVariant="outline"
          onCta={onSignup}
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
        <PricingCard
          name="Pro"
          desc="For serious students"
          price={yearly ? '25,000' : '35,000'}
          unit="đ/month"
          yearlyNote={yearly ? 'Billed 300,000đ/year' : null}
          originalPrice={yearly ? '35,000' : null}
          popular
          cta="Upgrade to Pro"
          ctaVariant="gradient"
          onCta={onSignup}
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
    </section>
  );
}

function PricingCard({ name, desc, price, unit, yearlyNote, originalPrice, popular, cta, ctaVariant, onCta, features }) {
  const isGradient = ctaVariant === 'gradient';
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

      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24,
        color: 'var(--text-primary)', marginBottom: 4,
      }}>{name}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{desc}</p>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        {originalPrice && (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24,
            color: 'var(--text-tertiary)', textDecoration: 'line-through',
          }}>{originalPrice}</span>
        )}
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48,
          color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1,
        }}>{price}</span>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-tertiary)' }}>{unit}</span>
      </div>
      {yearlyNote && (
        <p style={{ fontSize: 13, color: 'var(--violet-300)', fontWeight: 500, margin: '4px 0 0' }}>{yearlyNote}</p>
      )}

      {/* CTA */}
      <button onClick={onCta} style={{
        width: '100%', height: 48, marginTop: 24, marginBottom: 28,
        background: isGradient ? 'var(--grad-brand)' : 'transparent',
        color: isGradient ? '#fff' : 'var(--text-primary)',
        border: isGradient ? 'none' : '1.5px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15,
        cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: isGradient ? '0 8px 28px -6px rgba(139,92,246,0.45)' : 'none',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          if (isGradient) e.currentTarget.style.boxShadow = '0 12px 36px -6px rgba(139,92,246,0.6)';
          else e.currentTarget.style.borderColor = 'var(--violet-500)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          if (isGradient) e.currentTarget.style.boxShadow = '0 8px 28px -6px rgba(139,92,246,0.45)';
          else e.currentTarget.style.borderColor = 'var(--border-strong)';
        }}>
        {cta}
      </button>

      {/* Features list */}
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

Object.assign(window, { PricingSection });
