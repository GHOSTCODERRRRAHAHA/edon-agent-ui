import { Link } from 'react-router-dom'

const cardStyle: React.CSSProperties = {
  padding: 16,
  background: '#1a1a1e',
  borderRadius: 8,
  marginBottom: 16,
}

const stepTitleStyle: React.CSSProperties = {
  fontSize: 16,
  marginTop: 0,
  marginBottom: 8,
}

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#9ca3af',
  margin: 0,
}

export default function QuickstartPage() {
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>Quickstart</h1>
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>
        Get to a governed, auditable agent in minutes. Recommended preset: <strong style={{ color: '#e4e4e7' }}>Casual User</strong>.
      </p>

      <section style={cardStyle}>
        <h2 style={stepTitleStyle}>1) Connect your gateway</h2>
        <p style={bodyStyle}>
          Paste your EDON token in Settings, then connect Clawdbot with its base URL and secret.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={stepTitleStyle}>2) Pick a preset</h2>
        <p style={bodyStyle}>
          Choose a governance preset that matches your workflow (Casual User, Market Analyst, Ops Commander, Founder Mode, Helpdesk, Autonomy Mode).
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={stepTitleStyle}>3) Test a governed action</h2>
        <p style={bodyStyle}>
          Run a simple Clawdbot action to confirm EDON is evaluating and logging decisions.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={stepTitleStyle}>4) Monitor decisions</h2>
        <p style={bodyStyle}>
          Check Status and Support pages to confirm decisions, audits, and any policy blocks.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={stepTitleStyle}>What EDON blocks by default</h2>
        <p style={bodyStyle}>
          Outbound sends, destructive actions, shell execution, credential operations, and mass outbound tasks are blocked until you choose a more permissive preset.
        </p>
      </section>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link to="/onboarding" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 6 }}>
          Start onboarding
        </Link>
        <Link to="/support" style={{ padding: '8px 16px', border: '1px solid #333', color: '#e4e4e7', textDecoration: 'none', borderRadius: 6 }}>
          Contact support
        </Link>
      </div>
    </div>
  )
}
