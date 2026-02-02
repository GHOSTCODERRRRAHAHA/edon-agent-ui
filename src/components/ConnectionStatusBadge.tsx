import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../lib/api'
import type { HealthResponse } from '../types/gateway'

export type ConnectionState = 'idle' | 'connected' | 'unauthorized' | 'offline'

interface ConnectionStatusBadgeProps {
  onOpenSettings: () => void
  pollIntervalMs?: number
  /** Increment when settings saved so we re-poll immediately */
  settingsVersion?: number
}

export function useConnectionStatus(pollIntervalMs = 10_000, deps: unknown[] = []) {
  const [state, setState] = useState<ConnectionState>('idle')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const check = useCallback(async () => {
    const result = await apiGet<HealthResponse>('/health')
    setLastChecked(new Date())
    if ('error' in result) {
      if (result.error.kind === 'unauthorized') setState('unauthorized')
      else if (result.error.kind === 'offline') setState('offline')
      else setState('offline')
      return
    }
    setState('connected')
  }, [])

  useEffect(() => {
    check()
    const t = setInterval(check, pollIntervalMs)
    return () => clearInterval(t)
  }, [check, pollIntervalMs, ...deps])

  return { state, lastChecked, refresh: check }
}

export default function ConnectionStatusBadge({ onOpenSettings, pollIntervalMs = 10_000, settingsVersion = 0 }: ConnectionStatusBadgeProps) {
  const { state, lastChecked, refresh } = useConnectionStatus(pollIntervalMs, [settingsVersion])

  const label =
    state === 'connected'
      ? 'Connected'
      : state === 'unauthorized'
        ? 'Paste token'
        : state === 'offline'
          ? 'Gateway unreachable'
          : 'Checking…'

  const color =
    state === 'connected' ? '#22c55e' : state === 'unauthorized' ? '#eab308' : state === 'offline' ? '#ef4444' : '#6b7280'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 13,
          background: `${color}22`,
          color,
          border: `1px solid ${color}`,
        }}
      >
        {label}
      </span>
      {(state === 'unauthorized' || state === 'offline') && (
        <button
          type="button"
          onClick={onOpenSettings}
          style={{ padding: '4px 10px', fontSize: 13, background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}
        >
          Settings
        </button>
      )}
      <button type="button" onClick={refresh} style={{ padding: '4px 8px', fontSize: 12, background: 'transparent', border: '1px solid #444', borderRadius: 4, color: '#9ca3af', cursor: 'pointer' }} title="Refresh">
        ↻
      </button>
      {lastChecked && (
        <span style={{ fontSize: 11, color: '#6b7280' }}>Checked {lastChecked.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
