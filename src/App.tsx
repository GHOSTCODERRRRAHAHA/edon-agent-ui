import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ConnectionStatusBadge from './components/ConnectionStatusBadge'
import SettingsModal from './components/SettingsModal'
import StatusPage from './pages/StatusPage'
import IntegrationsPage from './pages/IntegrationsPage'
import OnboardingWizard from './pages/OnboardingWizard'
import AgentsPage from './pages/AgentsPage'
import SupportPage from './pages/SupportPage'
import QuickstartPage from './pages/QuickstartPage'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsVersion, setSettingsVersion] = useState(0)

  const handleSettingsSave = () => {
    setSettingsVersion((v) => v + 1)
  }

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #222', background: '#0f0f12' }}>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/" style={{ color: '#e4e4e7', textDecoration: 'none', fontWeight: 600 }}>EDON Agent UI</Link>
          <Link to="/status" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Status</Link>
          <Link to="/quickstart" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Quickstart</Link>
          <Link to="/integrations" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Integrations</Link>
          <Link to="/agents" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Agents</Link>
          <Link to="/support" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Support</Link>
          <Link to="/onboarding" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Onboarding</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ConnectionStatusBadge onOpenSettings={() => setSettingsOpen(true)} settingsVersion={settingsVersion} />
          <button type="button" onClick={() => setSettingsOpen(true)} style={{ padding: '6px 12px', fontSize: 13, background: '#333', border: 'none', borderRadius: 6, color: '#e4e4e7', cursor: 'pointer' }}>Settings</button>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<StatusPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/quickstart" element={<QuickstartPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
        </Routes>
      </main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onSave={handleSettingsSave} />
    </>
  )
}
