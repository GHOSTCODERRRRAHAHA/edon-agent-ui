import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { getIntentId, setIntentId } from '../lib/storage'
import type {
  ClawdbotConnectBody,
  ClawdbotConnectResponse,
  ApplyPolicyResponse,
  ClawdbotInvokeResponse,
  PolicyPacksResponse,
} from '../types/gateway'

export default function OnboardingWizard() {
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:18789')
  const [authMode] = useState<'password' | 'token'>('password')
  const [secret, setSecret] = useState('')
  const [connectResult, setConnectResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [applyResult, setApplyResult] = useState<{ ok: boolean; intentId?: string; message: string } | null>(null)
  const [invokeResult, setInvokeResult] = useState<ClawdbotInvokeResponse | null>(null)
  const [invokeError, setInvokeError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [policyPacks, setPolicyPacks] = useState<PolicyPacksResponse | null>(null)
  const [selectedPack, setSelectedPack] = useState('casual_user')
  const [policyError, setPolicyError] = useState<string | null>(null)
  const [autoApplied, setAutoApplied] = useState(false)

  useEffect(() => {
    let active = true
    const loadPacks = async () => {
      const result = await apiGet<PolicyPacksResponse>('/policy-packs')
      if (!active) return
      if ('error' in result) {
        setPolicyError(result.error.kind === 'unauthorized' ? 'Unauthorized — paste token in Settings' : result.error.message)
        return
      }
      setPolicyPacks(result.data)
      setPolicyError(null)
      if (result.data.default) {
        setSelectedPack(result.data.default)
      }
    }
    loadPacks()
    return () => {
      active = false
    }
  }, [])

  const applyPolicy = async (packName?: string, isAuto?: boolean) => {
    setApplyResult(null)
    setLoading(true)
    const pack = packName || selectedPack || 'casual_user'
    const result = await apiPost<ApplyPolicyResponse>(`/policy-packs/${pack}/apply`, {})
    setLoading(false)
    if ('error' in result) {
      setApplyResult({ ok: false, message: result.error.kind === 'unauthorized' ? 'Unauthorized — paste token in Settings' : result.error.kind === 'offline' ? 'Gateway unreachable' : result.error.message })
      return false
    }
    const id = result.data.intent_id
    setIntentId(id)
    setApplyResult({ ok: true, intentId: id, message: isAuto ? 'Default policy applied.' : 'Policy applied.' })
    if (isAuto) setAutoApplied(true)
    return true
  }

  const handleConnect = async () => {
    setConnectResult(null)
    setLoading(true)
    const result = await apiPost<ClawdbotConnectResponse>('/integrations/clawdbot/connect', {
      base_url: baseUrl,
      auth_mode: authMode,
      secret: secret || 'placeholder',
      probe: false,
    } as ClawdbotConnectBody)
    setLoading(false)
    if ('error' in result) {
      setConnectResult({ ok: false, message: result.error.kind === 'unauthorized' ? 'Unauthorized — paste token in Settings' : result.error.kind === 'offline' ? 'Gateway unreachable' : result.error.message })
      return
    }
    setConnectResult({ ok: true, message: result.data.message || 'Connected.' })
    const existingIntentId = getIntentId()
    if (!existingIntentId) {
      await applyPolicy('casual_user', true)
      return
    }
  }

  const handleApply = async () => {
    await applyPolicy()
  }

  const handleInvoke = async () => {
    const id = getIntentId()
    if (!id) {
      setInvokeError('Apply policy pack first to get intent_id.')
      return
    }
    setInvokeResult(null)
    setInvokeError(null)
    setLoading(true)
    const result = await apiPost<ClawdbotInvokeResponse>(
      '/clawdbot/invoke',
      { tool: 'sessions_list', action: 'json', args: {}, sessionKey: 'main' },
      { 'X-Intent-ID': id, 'X-Agent-ID': 'edon-agent-ui' }
    )
    setLoading(false)
    if ('error' in result) {
      setInvokeError(result.error.kind === 'unauthorized' ? 'Unauthorized — paste token in Settings' : result.error.kind === 'offline' ? 'Gateway unreachable' : result.error.message)
      setInvokeResult(null)
      return
    }
    setInvokeResult(result.data)
    if (result.data.error) setInvokeError(result.data.error)
  }

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1 style={{ marginTop: 0 }}>Onboarding</h1>
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>Connect Clawdbot → Apply policy → Test invoke</p>
      {autoApplied && (
        <p style={{ marginBottom: 24, color: '#22c55e', fontSize: 14 }}>
          Default policy applied automatically on first connection.
        </p>
      )}

      {/* Step A: Connect Clawdbot */}
      <section style={{ marginBottom: 32, padding: 16, background: '#1a1a1e', borderRadius: 8 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Step A: Connect Clawdbot</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Clawdbot base URL</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            style={{ width: '100%', padding: 8, background: '#0f0f12', border: '1px solid #333', borderRadius: 4, color: '#e4e4e7' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Secret (password or token)</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Clawdbot secret"
            autoComplete="off"
            style={{ width: '100%', padding: 8, background: '#0f0f12', border: '1px solid #333', borderRadius: 4, color: '#e4e4e7' }}
          />
        </div>
        <button type="button" onClick={handleConnect} disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving…' : 'Save Connection'}
        </button>
        {connectResult && (
          <p style={{ marginTop: 12, color: connectResult.ok ? '#22c55e' : '#ef4444', fontSize: 14 }}>{connectResult.message}</p>
        )}
      </section>

      {/* Step B: Apply policy pack */}
      <section style={{ marginBottom: 32, padding: 16, background: '#1a1a1e', borderRadius: 8 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Step B: Apply policy pack</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Preset</label>
          <select
            value={selectedPack}
            onChange={(e) => setSelectedPack(e.target.value)}
            style={{ width: '100%', padding: 8, background: '#0f0f12', border: '1px solid #333', borderRadius: 4, color: '#e4e4e7' }}
          >
            {(policyPacks?.packs ?? []).length === 0 && (
              <option value={selectedPack}>{selectedPack}</option>
            )}
            {(policyPacks?.packs ?? []).map((pack) => (
              <option key={pack.name} value={pack.name}>
                {pack.name} {policyPacks?.default === pack.name ? '(default)' : ''}
              </option>
            ))}
          </select>
          {policyError && <p style={{ marginTop: 8, color: '#ef4444', fontSize: 13 }}>{policyError}</p>}
          {!policyPacks && !policyError && <p style={{ marginTop: 8, color: '#9ca3af', fontSize: 13 }}>Loading presets…</p>}
          {policyPacks?.packs && (
            <p style={{ marginTop: 8, color: '#9ca3af', fontSize: 13 }}>
              {policyPacks.packs.find((p) => p.name === selectedPack)?.description || 'Select a preset that matches your workflow.'}
            </p>
          )}
        </div>
        <button type="button" onClick={handleApply} disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Applying…' : `Apply ${selectedPack}`}
        </button>
        {applyResult && (
          <div style={{ marginTop: 12, fontSize: 14 }}>
            <p style={{ color: applyResult.ok ? '#22c55e' : '#ef4444' }}>{applyResult.message}</p>
            {applyResult.intentId && <p style={{ color: '#9ca3af', wordBreak: 'break-all' }}>intent_id: {applyResult.intentId}</p>}
          </div>
        )}
      </section>

      {/* Step C: Test invoke */}
      <section style={{ marginBottom: 32, padding: 16, background: '#1a1a1e', borderRadius: 8 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Step C: Test invoke</h2>
        <button type="button" onClick={handleInvoke} disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Running…' : 'Run sessions_list'}
        </button>
        {invokeError && <p style={{ marginTop: 12, color: '#ef4444', fontSize: 14 }}>{invokeError}</p>}
        {invokeResult && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 14, marginBottom: 8 }}>
              {invokeResult.edon_verdict && <span>edon_verdict: <strong>{invokeResult.edon_verdict}</strong> </span>}
              {invokeResult.edon_explanation && <span>edon_explanation: {invokeResult.edon_explanation}</span>}
            </p>
            <pre style={{ background: '#0f0f12', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 12 }}>
              {JSON.stringify(invokeResult, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
