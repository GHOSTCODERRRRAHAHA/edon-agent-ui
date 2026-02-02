import { useState, useEffect } from 'react'
import { getGatewayUrl, setGatewayUrl, getToken, setToken } from '../lib/storage'
import { apiGet } from '../lib/api'

const DEFAULT_GATEWAY_URL = 'http://127.0.0.1:8000'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
}

export default function SettingsModal({ open, onClose, onSave }: SettingsModalProps) {
  const [gatewayUrl, setGatewayUrlState] = useState('')
  const [token, setTokenState] = useState('')
  const [testMessage, setTestMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setGatewayUrlState(getGatewayUrl())
      setTokenState(getToken())
      setTestMessage(null)
    }
  }, [open])

  const handleSave = () => {
    setGatewayUrl(gatewayUrl?.trim() || DEFAULT_GATEWAY_URL)
    setToken(token)
    setGatewayUrlState(getGatewayUrl())
    setTokenState(getToken())
    onSave?.()
    onClose()
  }

  const handleTestConnection = async () => {
    setTestMessage(null)
    const health = await apiGet<unknown>('/health')
    if ('error' in health) {
      setTestMessage(health.error.message)
      return
    }
    const integrations = await apiGet<unknown>('/integrations/account/integrations')
    if ('error' in integrations) {
      setTestMessage(integrations.error.message)
      return
    }
    setTestMessage('Connected. Health and integrations OK.')
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1e', padding: 24, borderRadius: 8, minWidth: 360, maxWidth: '90vw' }}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Gateway URL</label>
          <input
            type="url"
            value={gatewayUrl}
            onChange={(e) => setGatewayUrlState(e.target.value)}
            placeholder={DEFAULT_GATEWAY_URL}
            style={{ width: '100%', padding: 8, background: '#0f0f12', border: '1px solid #333', borderRadius: 4, color: '#e4e4e7' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setTokenState(e.target.value)}
            placeholder="EDON token"
            autoComplete="off"
            style={{ width: '100%', padding: 8, background: '#0f0f12', border: '1px solid #333', borderRadius: 4, color: '#e4e4e7' }}
          />
        </div>
        {testMessage !== null && (
          <div style={{ marginBottom: 16, padding: 10, borderRadius: 4, background: testMessage.startsWith('Connected') ? '#16653422' : '#991b1b22', color: testMessage.startsWith('Connected') ? '#22c55e' : '#ef4444', fontSize: 13 }}>
            {testMessage}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleTestConnection} style={{ padding: '8px 16px', background: '#333', border: 'none', borderRadius: 4, color: '#e4e4e7', cursor: 'pointer' }}>Test connection</button>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#333', border: 'none', borderRadius: 4, color: '#e4e4e7', cursor: 'pointer' }}>Cancel</button>
          <button type="button" onClick={handleSave} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  )
}
