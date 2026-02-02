export interface HealthResponse {
  ok?: boolean
  status?: string
  version?: string
  uptime_seconds?: number
  governor?: Record<string, unknown>
}

export interface VersionResponse {
  version: string
  git_sha: string
}

export interface ClawdbotConnectBody {
  base_url: string
  auth_mode: 'password' | 'token'
  secret: string
  probe?: boolean
  credential_id?: string
}

export interface ClawdbotConnectResponse {
  connected: boolean
  credential_id?: string
  base_url: string
  auth_mode: string
  message?: string
}

export interface ApplyPolicyResponse {
  intent_id: string
  policy_pack?: string
  intent?: unknown
  active_preset?: string
}

export interface ClawdbotInvokeResponse {
  ok: boolean
  result?: unknown
  error?: string
  edon_verdict?: string
  edon_explanation?: string
}

export interface ClawdbotIntegrationStatus {
  connected: boolean
  base_url?: string
  auth_mode?: string
  last_ok_at?: string
  last_error?: string
  active_policy_pack?: string
  default_intent_id?: string
  network_gating_enabled?: boolean
  clawdbot_reachability?: string
  bypass_risk?: string
  recommendation?: string | null
}

export interface IntegrationsStatusResponse {
  clawdbot: ClawdbotIntegrationStatus
}

export interface PolicyPackSummary {
  name: string
  description: string
  risk_level: string
  scope_summary: Record<string, number>
  constraints_summary: {
    allowed_tools: number
    blocked_tools: number
    confirm_required: boolean
  }
}

export interface PolicyPacksResponse {
  packs: PolicyPackSummary[]
  default: string
  active_preset?: { preset_name?: string; applied_at?: string }
}

export interface AgentIntegration {
  agent_id: string
  name?: string
  base_url?: string
  auth_type?: string
  auth_header?: string
  default_endpoint?: string
  metadata?: Record<string, unknown>
  updated_at?: string
}

export interface AgentIntegrationCreate {
  agent_id: string
  name: string
  base_url: string
  auth_type: 'none' | 'bearer' | 'api_key' | 'header'
  auth_token?: string
  auth_header?: string
  default_endpoint?: string
  metadata?: Record<string, unknown>
}

export interface AgentInvokeBody {
  endpoint?: string
  payload: Record<string, unknown>
  timeout?: number
}

export interface AgentInvokeResponse {
  ok: boolean
  status_code: number
  response?: Record<string, unknown>
  error?: string
}

export interface SupportTicket {
  ticket_id: string
  tenant_id?: string
  email?: string
  subject: string
  message: string
  status: string
  priority: string
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SupportTicketCreateBody {
  email?: string
  subject: string
  message: string
  priority?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface SupportTicketUpdateBody {
  status?: string
  priority?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}
