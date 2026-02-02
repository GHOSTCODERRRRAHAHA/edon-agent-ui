import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../lib/api'
import type { HealthResponse, VersionResponse } from '../types/gateway'
import { useConnectionStatus } from '../components/ConnectionStatusBadge'

export default function StatusPage() {
  const { state, lastChecked, refresh } = useConnectionStatus(10_000)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [version, setVersion] = useState<VersionResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [h, v] = await Promise.all([
      apiGet<HealthResponse>('/health'),
      apiGet<VersionResponse>('/version'),
    ])
    if ('data' in h) setHealth(h.data)
    else setHealth(null)
    if ('data' in v) setVersion(v.data)
    else setVersion(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (state === 'connected') load()
    else {
      setHealth(null)
      setVersion(null)
      setLoading(false)
    }
  }, [state, load])

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1 style={{ marginTop: 0 }}>Status</h1>
      <p>
        Connection: <strong>{state === 'connected' ? 'Connected' : state === 'unauthorized' ? 'Unauthorized' : state === 'offline' ? 'Offline' : 'Checking…'}</strong>
      </p>
      {lastChecked && <p style={{ fontSize: 14, color: '#6b7280' }}>Last checked: {lastChecked.toLocaleString()}</p>}
      <button type="button" onClick={() => { refresh(); load(); }} style={{ marginBottom: 16, padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}>
        Refresh
      </button>
      {loading && state === 'connected' && <p>Loading…</p>}
      {state === 'connected' && !loading && (
        <>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Health</h2>
            <pre style={{ background: '#1a1a1e', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13 }}>
              {health ? JSON.stringify(health, null, 2) : '—'}
            </pre>
          </section>
          <section>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Version</h2>
            <pre style={{ background: '#1a1a1e', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13 }}>
              {version ? JSON.stringify(version, null, 2) : '—'}
            </pre>
          </section>
        </>
      )}
    </div>
  )
}
