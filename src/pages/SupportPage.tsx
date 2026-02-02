import { useCallback, useEffect, useState } from 'react'
import { createSupportTicket, listSupportTickets, updateSupportTicket } from '../lib/api'
import type { SupportTicket, SupportTicketCreateBody, SupportTicketUpdateBody } from '../types/gateway'
import { useConnectionStatus } from '../components/ConnectionStatusBadge'

const defaultTicket: SupportTicketCreateBody = {
  email: '',
  subject: '',
  message: '',
  priority: 'medium',
  tags: [],
}

export default function SupportPage() {
  const { state } = useConnectionStatus(10_000)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [form, setForm] = useState<SupportTicketCreateBody>(defaultTicket)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await listSupportTickets()
    if ('data' in res) {
      setTickets(res.data as SupportTicket[])
    } else {
      setTickets([])
      setError(res.error.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (state === 'connected') loadTickets()
  }, [state, loadTickets])

  const onSubmit = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    const payload = { ...form, tags: (form.tags || []).filter(Boolean) }
    const res = await createSupportTicket(payload)
    if ('data' in res) {
      setMessage('Ticket created.')
      setForm(defaultTicket)
      await loadTickets()
    } else {
      setError(res.error.message)
    }
    setSaving(false)
  }

  const onUpdate = async (ticketId: string, body: SupportTicketUpdateBody) => {
    const res = await updateSupportTicket(ticketId, body)
    if ('data' in res) {
      await loadTickets()
    } else {
      setError(res.error.message)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>Support Tickets</h1>
      <p style={{ color: '#9ca3af' }}>
        Create and manage support tickets. Tickets are scoped to the current tenant.
      </p>

      {state === 'unauthorized' && (
        <p style={{ color: '#f59e0b' }}>Authentication required. Paste your token in Settings.</p>
      )}
      {state === 'offline' && <p style={{ color: '#ef4444' }}>Gateway unreachable.</p>}

      <section style={{ marginTop: 20, padding: 16, background: '#111116', borderRadius: 10, border: '1px solid #222' }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>New Ticket</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Contact Email
            <input
              value={form.email || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Subject
            <input
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Message
            <textarea
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={4}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            Tags (comma-separated)
            <input
              value={(form.tags || []).join(', ')}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#0f0f12', color: '#e5e7eb' }}
            />
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || state !== 'connected'}
            style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}
          >
            {saving ? 'Saving…' : 'Create Ticket'}
          </button>
        </div>

        {message && <p style={{ color: '#22c55e', marginTop: 12 }}>{message}</p>}
        {error && <p style={{ color: '#ef4444', marginTop: 12 }}>{error}</p>}
      </section>

      <section style={{ marginTop: 24, padding: 16, background: '#111116', borderRadius: 10, border: '1px solid #222' }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Tickets</h2>
        {loading && <p>Loading…</p>}
        {!loading && tickets.length === 0 && <p style={{ color: '#9ca3af' }}>No tickets yet.</p>}
        {!loading && tickets.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} style={{ padding: 12, borderRadius: 8, border: '1px solid #1f2937', background: '#0f0f12' }}>
                <div style={{ fontWeight: 600 }}>{ticket.subject}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{ticket.ticket_id}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Priority: {ticket.priority} · Status: {ticket.status}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Created: {ticket.created_at}</div>
                <p style={{ marginTop: 8, fontSize: 13 }}>{ticket.message}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => onUpdate(ticket.ticket_id, { status: 'pending' })}
                    style={{ padding: '6px 10px', background: '#f59e0b', border: 'none', borderRadius: 6, color: '#111', cursor: 'pointer' }}
                  >
                    Mark Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate(ticket.ticket_id, { status: 'resolved' })}
                    style={{ padding: '6px 10px', background: '#22c55e', border: 'none', borderRadius: 6, color: '#111', cursor: 'pointer' }}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
