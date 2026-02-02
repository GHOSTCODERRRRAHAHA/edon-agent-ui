import { useCallback, useEffect, useState } from 'react'
import { connectClawdbot, getIntegrationsStatus } from '../lib/api'
import type { ClawdbotConnectBody, ClawdbotConnectResponse, IntegrationsStatusResponse } from '../types/gateway'
import { useConnectionStatus } from '../components/ConnectionStatusBadge'

const defaultForm: ClawdbotConnectBody = {
  base_url: 'http://127.0.0.1:18789',
  auth_mode: 'password',
  secret: '',
  credential_id: 'clawdbot_gateway',
  probe: true,
}

export default function IntegrationsPage() {
  const { state } = useConnectionStatus(10_000)
  const [status, setStatus] = useState<IntegrationsStatusResponse | null>(null)
  const [form, setForm] = useState<ClawdbotConnectBody>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getIntegrationsStatus()
    if ('data' in res) {
      setStatus(res.data as IntegrationsStatusResponse)
      const clawdbot = (res.data as IntegrationsStatusResponse).clawdbot
      setForm((prev) => ({
        ...prev,
        base_url: clawdbot?.base_url || prev.base_url,
        auth_mode: (clawdbot?.auth_mode as ClawdbotConnectBody['auth_mode']) || prev.auth_mode,
      }))
    } else {
      setStatus(null)
      setError(res.error.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (state === 'connected') loadStatus()
  }, [state, loadStatus])

  const onSubmit = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    const res = await connectClawdbot(form)
    if ('data' in res) {
      const data = res.data as ClawdbotConnectResponse
      setMessage(data.message || 'Clawdbot connected successfully.')
      await loadStatus()
    } else {
      setError(res.error.message)
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>Integrations</h1>
      <p style={{ color: '#9ca3af' }}>
        Connect your Clawdbot Gateway to enable live execution and policy enforcement.
      </p>

      {state === 'unauthorized' && (
        <p style={{ color: '#f59e0b' }}>Authentication required. Paste your token in Settings.</p>
      )}
      {state === 'offline' && <p style={{ color: '#ef4444' }}>Gateway unreachable.</p>}

      <section style={{ marginTop: 20, padding: 16, background: '#111116', borderRadius: 10, border: '1px solid #222' }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Clawdbot Gateway</h2>
        {loading && <p>Loading status…</p>}
        {!loading && status && (
          <div style={{ fontSize: 13, color: '#d1d5db', marginBottom: 12 }}>
            <div>Connected: <strong>{status.clawdbot?.connected ? 'Yes' : 'No'}</strong></div>
            <div>Base URL: {status.clawdbot?.base_url || '—'}</div>
            <div>Auth Mode: {status.clawdbot?.auth_mode || '—'}</div>
            <div>Last OK: {status.clawdbot?.last_ok_at || '—'}</div>
            <div>Last Error: {status.clawdbot?.last_error || '—'}</div>
            <div>Network Gating: {status.clawdbot?.network_gating_enabled ? 'Enabled' : 'Disabled'}</div>
            <div>Reachability: {status.clawdbot?.clawdbot_reachability || '—'}</div>
            <div>Bypass Risk: {status.clawdbot?.bypass_risk || '—'}</div>
            {status.clawdbot?.recommendation && (
              <div style={{ color: '#f59e0b' }}>Recommendation: {status.clawdbot.recommendation}</div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Base URL
            <input
              value={form.base_url}
              onChange={(e) => setForm((prev) => ({ ...prev, base_url: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Auth Mode
            <select
              value={form.auth_mode}
              onChange={(e) => setForm((prev) => ({ ...prev, auth_mode: e.target.value as ClawdbotConnectBody['auth_mode'] }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            >
              <option value="password">password</option>
              <option value="token">token</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Secret
            <input
              type="password"
              value={form.secret}
              onChange={(e) => setForm((prev) => ({ ...prev, secret: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Credential ID
            <input
              value={form.credential_id || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, credential_id: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={Boolean(form.probe)}
              onChange={(e) => setForm((prev) => ({ ...prev, probe: e.target.checked }))}
            />
            Validate connection before saving
          </label>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || state !== 'connected'}
            style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}
          >
            {saving ? 'Saving…' : 'Connect'}
          </button>
          <button
            type="button"
            onClick={loadStatus}
            disabled={loading}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#e5e7eb', cursor: 'pointer' }}
          >
            Refresh Status
          </button>
        </div>

        {message && <p style={{ color: '#22c55e', marginTop: 12 }}>{message}</p>}
        {error && <p style={{ color: '#ef4444', marginTop: 12 }}>{error}</p>}
      </section>
    </div>
  )
}
