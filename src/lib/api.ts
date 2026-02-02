import { getGatewayUrl, getToken } from './storage'

export type ApiErrorKind = 'offline' | 'unauthorized' | 'error'

export interface ApiError {
  kind: ApiErrorKind
  message: string
  status?: number
}

const AUTH_REQUIRED_MSG = 'Authentication required. Set your token in Settings.'

function normalizeError(err: unknown, status?: number): ApiError {
  if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as Error).message === 'string') {
    const msg = (err as Error).message
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
      return { kind: 'offline', message: 'Gateway unreachable', status }
    }
  }
  if (status === 401) return { kind: 'unauthorized', message: AUTH_REQUIRED_MSG, status }
  if (status && status >= 500) return { kind: 'error', message: `Server error (${status})`, status }
  if (status && status >= 400) return { kind: 'error', message: `Request failed (${status})`, status }
  return { kind: 'error', message: err instanceof Error ? err.message : String(err), status }
}

/** Re-reads token from localStorage at call time. Throws only if missing; backend validates. */
function authHeaders(): Record<string, string> {
  const raw = getToken()
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error(AUTH_REQUIRED_MSG)
  }
  return {
    'Content-Type': 'application/json',
    'X-EDON-TOKEN': raw.trim(),
  }
}

export async function apiGet<T>(path: string): Promise<{ data: T } | { error: ApiError }> {
  const base = getGatewayUrl()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  try {
    const res = await fetch(url, { method: 'GET', headers: authHeaders() })
    const text = await res.text()
    let data: T
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T)
    } catch {
      return { error: normalizeError(new Error(res.statusText || text), res.status) }
    }
    if (!res.ok) return { error: normalizeError(new Error((data as { detail?: string }).detail || res.statusText), res.status) }
    return { data }
  } catch (e) {
    if (e instanceof Error && e.message === AUTH_REQUIRED_MSG) {
      return { error: { kind: 'unauthorized', message: AUTH_REQUIRED_MSG } }
    }
    return { error: normalizeError(e) }
  }
}

export async function apiPost<T>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<{ data: T } | { error: ApiError }> {
  try {
    const h = { ...authHeaders(), ...extraHeaders } as Record<string, string>
    const base = getGatewayUrl()
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
    const res = await fetch(url, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(body ?? {}),
    })
    const text = await res.text()
    let data: T
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T)
    } catch {
      return { error: normalizeError(new Error(res.statusText || text), res.status) }
    }
    if (!res.ok) return { error: normalizeError(new Error((data as { detail?: string }).detail || res.statusText), res.status) }
    return { data }
  } catch (e) {
    if (e instanceof Error && e.message === AUTH_REQUIRED_MSG) {
      return { error: { kind: 'unauthorized', message: AUTH_REQUIRED_MSG } }
    }
    return { error: normalizeError(e) }
  }
}

export async function apiPatch<T>(path: string, body: unknown): Promise<{ data: T } | { error: ApiError }> {
  try {
    const h = { ...authHeaders() } as Record<string, string>
    const base = getGatewayUrl()
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify(body ?? {}),
    })
    const text = await res.text()
    let data: T
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T)
    } catch {
      return { error: normalizeError(new Error(res.statusText || text), res.status) }
    }
    if (!res.ok) return { error: normalizeError(new Error((data as { detail?: string }).detail || res.statusText), res.status) }
    return { data }
  } catch (e) {
    if (e instanceof Error && e.message === AUTH_REQUIRED_MSG) {
      return { error: { kind: 'unauthorized', message: AUTH_REQUIRED_MSG } }
    }
    return { error: normalizeError(e) }
  }
}

export async function getIntegrationsStatus() {
  return apiGet('/integrations/account/integrations')
}

export async function connectClawdbot(body: unknown) {
  return apiPost('/integrations/clawdbot/connect', body)
}

export async function listAgents() {
  return apiGet('/agents/integrations')
}

export async function connectAgent(body: unknown) {
  return apiPost('/agents/integrations/connect', body)
}

export async function invokeAgent(agentId: string, body: unknown) {
  return apiPost(`/agents/${agentId}/invoke`, body)
}

export async function listSupportTickets() {
  return apiGet('/support/tickets')
}

export async function createSupportTicket(body: unknown) {
  return apiPost('/support/tickets', body)
}

export async function updateSupportTicket(ticketId: string, body: unknown) {
  return apiPatch(`/support/tickets/${ticketId}`, body)
}
