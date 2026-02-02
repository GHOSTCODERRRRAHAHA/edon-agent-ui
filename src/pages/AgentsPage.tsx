import { useCallback, useEffect, useMemo, useState } from 'react'
import { connectAgent, invokeAgent, listAgents } from '../lib/api'
import type { AgentIntegration, AgentIntegrationCreate, AgentInvokeBody, AgentInvokeResponse } from '../types/gateway'
import { useConnectionStatus } from '../components/ConnectionStatusBadge'

const defaultAgent: AgentIntegrationCreate = {
  agent_id: '',
  name: '',
  base_url: '',
  auth_type: 'bearer',
  auth_token: '',
  auth_header: '',
  default_endpoint: '',
  metadata: {},
}

export default function AgentsPage() {
  const { state } = useConnectionStatus(10_000)
  const [agents, setAgents] = useState<AgentIntegration[]>([])
  const [form, setForm] = useState<AgentIntegrationCreate>(defaultAgent)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testAgentId, setTestAgentId] = useState<string>('')
  const [testPayload, setTestPayload] = useState<string>('{"ping":"hello"}')
  const [testResult, setTestResult] = useState<AgentInvokeResponse | null>(null)

  const loadAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await listAgents()
    if ('data' in res) {
      setAgents((res.data as { agents: AgentIntegration[] }).agents || [])
    } else {
      setAgents([])
      setError(res.error.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (state === 'connected') loadAgents()
  }, [state, loadAgents])

  const onSubmit = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    const res = await connectAgent(form)
    if ('data' in res) {
      setMessage('Agent integration saved.')
      setForm(defaultAgent)
      await loadAgents()
    } else {
      setError(res.error.message)
    }
    setSaving(false)
  }

  const onTest = async () => {
    setError(null)
    setTestResult(null)
    try {
      const parsed = JSON.parse(testPayload || '{}')
      const body: AgentInvokeBody = { payload: parsed }
      const res = await invokeAgent(testAgentId, body)
      if ('data' in res) {
        setTestResult(res.data as AgentInvokeResponse)
      } else {
        setError(res.error.message)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const authHint = useMemo(() => {
    switch (form.auth_type) {
      case 'bearer':
        return 'Adds Authorization: Bearer <token>'
      case 'api_key':
        return 'Adds X-API-KEY header (or auth_header)'
      case 'header':
        return 'Adds custom header with token'
      default:
        return 'No auth headers sent'
    }
  }, [form.auth_type])

  return (
    <div style={{ padding: 24, maxWidth: 860 }}>
      <h1 style={{ marginTop: 0 }}>Universal Agents</h1>
      <p style={{ color: '#9ca3af' }}>
        Connect any AI agent API with bearer tokens, API keys, or custom headers.
      </p>

      {state === 'unauthorized' && (
        <p style={{ color: '#f59e0b' }}>Authentication required. Paste your token in Settings.</p>
      )}
      {state === 'offline' && <p style={{ color: '#ef4444' }}>Gateway unreachable.</p>}

      <section style={{ marginTop: 20, padding: 16, background: '#111116', borderRadius: 10, border: '1px solid #222' }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Connect Agent</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Agent ID
            <input
              value={form.agent_id}
              onChange={(e) => setForm((prev) => ({ ...prev, agent_id: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Base URL
            <input
              value={form.base_url}
              onChange={(e) => setForm((prev) => ({ ...prev, base_url: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Auth Type
            <select
              value={form.auth_type}
              onChange={(e) => setForm((prev) => ({ ...prev, auth_type: e.target.value as AgentIntegrationCreate['auth_type'] }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            >
              <option value="none">none</option>
              <option value="bearer">bearer</option>
              <option value="api_key">api_key</option>
              <option value="header">header</option>
            </select>
          </label>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>{authHint}</p>
          {form.auth_type !== 'none' && (
            <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
              Auth Token
              <input
                type="password"
                value={form.auth_token || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, auth_token: e.target.value }))}
                style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
              />
            </label>
          )}
          {(form.auth_type === 'api_key' || form.auth_type === 'header') && (
            <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
              Auth Header (optional)
              <input
                value={form.auth_header || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, auth_header: e.target.value }))}
                placeholder={form.auth_type === 'api_key' ? 'X-API-KEY' : 'X-My-Header'}
                style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
              />
            </label>
          )}
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Default Endpoint
            <input
              value={form.default_endpoint || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, default_endpoint: e.target.value }))}
              placeholder="/v1/chat/completions"
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || state !== 'connected'}
            style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}
          >
            {saving ? 'Saving…' : 'Save Agent'}
          </button>
          <button
            type="button"
            onClick={loadAgents}
            disabled={loading}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#e5e7eb', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>

        {message && <p style={{ color: '#22c55e', marginTop: 12 }}>{message}</p>}
        {error && <p style={{ color: '#ef4444', marginTop: 12 }}>{error}</p>}
      </section>

      <section style={{ marginTop: 24, padding: 16, background: '#111116', borderRadius: 10, border: '1px solid #222' }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Saved Agents</h2>
        {loading && <p>Loading…</p>}
        {!loading && agents.length === 0 && <p style={{ color: '#9ca3af' }}>No agents yet.</p>}
        {!loading && agents.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {agents.map((agent) => (
              <div key={agent.agent_id} style={{ padding: 12, borderRadius: 8, border: '1px solid #1f2937', background: '#0f0f12' }}>
                <div style={{ fontWeight: 600 }}>{agent.name || agent.agent_id}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{agent.base_url}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Auth: {agent.auth_type || 'none'}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, background: '#111116', borderRadius: 10, border: '1px solid #222' }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Quick Invoke</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Agent ID
            <input
              value={testAgentId}
              onChange={(e) => setTestAgentId(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Payload (JSON)
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={4}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={onTest}
            disabled={!testAgentId || state !== 'connected'}
            style={{ padding: '8px 16px', background: '#22c55e', border: 'none', borderRadius: 6, color: '#111', cursor: 'pointer' }}
          >
            Invoke
          </button>
        </div>
        {testResult && (
          <pre style={{ marginTop: 12, background: '#0b0b0f', padding: 12, borderRadius: 8, color: '#d1d5db', fontSize: 12 }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}
