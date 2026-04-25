// src/pages/TicketDetailPage.tsx
import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import {
  ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle,
  User, Paperclip, Lock, Send, ChevronRight, Tag, Calendar,
  FolderOpen, UserCheck, ZapOff, Zap, RotateCcw,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { MOCK_TICKET_DETAILS } from '@/mock/data'
import { ROUTES } from '@/config/constants'
import type { TicketDetail, TicketEvent } from '@/types/common'

// ─── helpers ─────────────────────────────────────────────────────────────────
const STATUS_FLOW = ['open', 'in-progress', 'resolved'] as const
type Status = typeof STATUS_FLOW[number]

const STATUS_LABEL: Record<Status, string> = {
  'open':        'Open',
  'in-progress': 'In Progress',
  'resolved':    'Resolved',
}

const PRIORITY_COLOR: Record<string, string> = {
  low:      'bg-[var(--s3)] text-[var(--t3)] border-[var(--s5)]',
  medium:   'bg-[#2a2200] text-[var(--a1)] border-[var(--a4)]',
  high:     'bg-[#2a1200] text-[#f97316] border-[#7c3a00]',
  critical: 'bg-[#2a0a0a] text-[var(--er)] border-[#7c1a1a]',
}

const STATUS_COLOR: Record<Status, string> = {
  'open':        'bg-[#0d1f3c] text-[var(--in)] border-[#1e3a6e]',
  'in-progress': 'bg-[#2a2200] text-[var(--a1)] border-[var(--a4)]',
  'resolved':    'bg-[#0d2a18] text-[var(--ok)] border-[#1a5c33]',
}

const TYPE_COLOR: Record<string, string> = {
  'Bug Fix':              'bg-[#2a0a0a] text-[var(--er)] border-[#7c1a1a]',
  'Enhancement Request':  'bg-[#0d1f3c] text-[var(--in)] border-[#1e3a6e]',
  'Application Error':    'bg-[#2a1200] text-[#f97316] border-[#7c3a00]',
}

function EventIcon({ type }: { type: TicketEvent['type'] }) {
  const cls = 'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border'
  switch (type) {
    case 'created':          return <div className={`${cls} bg-[var(--s2)] border-[var(--s5)] text-[var(--t3)]`}><Circle size={12} /></div>
    case 'status_changed':   return <div className={`${cls} bg-[#0d1f3c] border-[#1e3a6e] text-[var(--in)]`}><Clock size={12} /></div>
    case 'assigned':         return <div className={`${cls} bg-[var(--s2)] border-[var(--s5)] text-[var(--t3)]`}><UserCheck size={12} /></div>
    case 'priority_changed': return <div className={`${cls} bg-[#2a1200] border-[#7c3a00] text-[#f97316]`}><AlertTriangle size={12} /></div>
    case 'resolved':         return <div className={`${cls} bg-[#0d2a18] border-[#1a5c33] text-[var(--ok)]`}><CheckCircle2 size={12} /></div>
    case 'escalated':        return <div className={`${cls} bg-[#2a0a0a] border-[#7c1a1a] text-[var(--er)]`}><Zap size={12} /></div>
    case 'reopened':         return <div className={`${cls} bg-[#2a2200] border-[var(--a4)] text-[var(--a1)]`}><RotateCcw size={12} /></div>
    case 'comment':          return <div className={`${cls} bg-[var(--s2)] border-[var(--s5)] text-[var(--t3)]`}><User size={12} /></div>
    default:                 return <div className={`${cls} bg-[var(--s2)] border-[var(--s5)] text-[var(--t3)]`}><Circle size={12} /></div>
  }
}

// ─── status flow bar ──────────────────────────────────────────────────────────
function StatusFlowBar({ status }: { status: string }) {
  const current = STATUS_FLOW.indexOf(status as Status)
  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_FLOW.map((s, i) => {
        const done    = i < current
        const active  = i === current
        const isLast  = i === STATUS_FLOW.length - 1
        return (
          <div key={s} className="flex items-center flex-1 min-w-0">
            {/* node */}
            <div className={`
              flex flex-col items-center flex-shrink-0
              ${active ? 'opacity-100' : done ? 'opacity-100' : 'opacity-40'}
            `}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${done   ? 'bg-[var(--ok)] border-[var(--ok)] text-white' : ''}
                ${active ? 'bg-[var(--a1)] border-[var(--a1)] text-black' : ''}
                ${!done && !active ? 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t4)]' : ''}
              `}>
                {done
                  ? <CheckCircle2 size={14} />
                  : active
                    ? <div className="w-2.5 h-2.5 rounded-full bg-black" />
                    : <div className="w-2.5 h-2.5 rounded-full bg-[var(--t4)]" />
                }
              </div>
              <span className={`
                mt-1.5 text-[10.5px] font-semibold whitespace-nowrap
                ${active ? 'text-[var(--a1)]' : done ? 'text-[var(--ok)]' : 'text-[var(--t4)]'}
              `}>{STATUS_LABEL[s]}</span>
            </div>
            {/* connector */}
            {!isLast && (
              <div className={`
                flex-1 h-[2px] mx-2 rounded-full transition-all
                ${done ? 'bg-[var(--ok)]' : 'bg-[var(--s4)]'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── placeholder for unrecognised tickets ─────────────────────────────────────
function buildPlaceholder(id: string): TicketDetail {
  return {
    id,
    title: 'Ticket not found',
    type: 'Bug Fix',
    status: 'open',
    priority: 'low',
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: '—',
    createdByInitials: '?',
    description: 'No details available for this ticket.',
    events: [],
    comments: [],
  }
}

// ─── page ─────────────────────────────────────────────────────────────────────
export function TicketDetailPage() {
  const { ticketId } = useParams({ strict: false }) as { ticketId: string }
  const navigate = useNavigate()
  const ticket: TicketDetail = MOCK_TICKET_DETAILS[ticketId] ?? buildPlaceholder(ticketId)

  const [commentBody, setCommentBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  return (
    <div className="p-5 max-w-[1100px] mx-auto">

      {/* back + title header */}
      <div className="flex items-start gap-3 mb-5">
        <button
          onClick={() => navigate({ to: ROUTES.SUPPORT as never })}
          className="mt-0.5 w-7 h-7 rounded-lg border border-[var(--s4)] bg-[var(--s1)] flex items-center justify-center text-[var(--t3)] hover:text-[var(--a1)] hover:bg-[var(--a3)] hover:border-[var(--a4)] transition-all shadow-[var(--d1)]"
        >
          <ArrowLeft size={13} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[11px] text-[var(--t4)] bg-[var(--s2)] border border-[var(--s4)] px-2 py-0.5 rounded-md">
              #{ticket.id}
            </span>
            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${TYPE_COLOR[ticket.type] ?? 'bg-[var(--s2)] text-[var(--t3)] border-[var(--s5)]'}`}>
              {ticket.type}
            </span>
            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${PRIORITY_COLOR[ticket.priority]}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} priority
            </span>
            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${STATUS_COLOR[ticket.status as Status] ?? ''}`}>
              {STATUS_LABEL[ticket.status as Status] ?? ticket.status}
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[var(--t1)] leading-tight">{ticket.title}</h1>
          <p className="text-[11.5px] text-[var(--t3)] mt-0.5">
            Opened by <strong className="text-[var(--t2)]">{ticket.createdBy}</strong>
            {' · '}{ticket.createdAt}
            {ticket.assignee && <> · Assigned to <strong className="text-[var(--t2)]">{ticket.assignee}</strong></>}
          </p>
        </div>
      </div>

      {/* status flow */}
      <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-5 mb-5 shadow-[var(--d1)]">
        <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-4">Ticket progress</div>
        <StatusFlowBar status={ticket.status} />
      </div>

      {/* body */}
      <div className="grid grid-cols-[1fr_280px] gap-4 items-start">

        {/* ── left column ── */}
        <div className="flex flex-col gap-4">

          {/* description */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-4 shadow-[var(--d1)]">
            <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-3">Description</div>
            <p className="text-[13px] text-[var(--t2)] leading-relaxed">{ticket.description}</p>
          </div>

          {/* timeline */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-4 shadow-[var(--d1)]">
            <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-4">Activity timeline</div>
            {ticket.events.length === 0
              ? <p className="text-[12px] text-[var(--t4)] italic">No activity yet.</p>
              : (
                <div className="relative">
                  {/* vertical line */}
                  <div className="absolute left-[13px] top-0 bottom-0 w-px bg-[var(--s4)]" />
                  <div className="flex flex-col gap-4">
                    {ticket.events.map((ev, idx) => (
                      <div key={ev.id} className="flex items-start gap-3 relative">
                        <div className="z-10"><EventIcon type={ev.type} /></div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <span className="text-[12px] text-[var(--t2)]">{ev.detail}</span>
                          <div className="text-[10.5px] text-[var(--t4)] mt-0.5 flex items-center gap-1">
                            <span className="font-medium text-[var(--t3)]">{ev.actor}</span>
                            <span>·</span>
                            <span>{ev.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </div>

          {/* comments */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-4 shadow-[var(--d1)]">
            <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-4">
              Comments {ticket.comments.length > 0 && <span className="ml-1 text-[var(--t4)]">({ticket.comments.length})</span>}
            </div>

            {ticket.comments.length === 0
              ? <p className="text-[12px] text-[var(--t4)] italic mb-4">No comments yet. Be the first to comment.</p>
              : (
                <div className="flex flex-col gap-3 mb-4">
                  {ticket.comments.map(c => (
                    <div
                      key={c.id}
                      className={`rounded-xl border p-3.5 ${c.isInternal
                        ? 'bg-[#1a1500] border-[var(--a4)]'
                        : 'bg-[var(--s2)] border-[var(--s4)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--a1)] flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0">
                          {c.authorInitials}
                        </div>
                        <span className="text-[12px] font-semibold text-[var(--t1)]">{c.author}</span>
                        <span className="text-[10.5px] text-[var(--t4)]">{c.authorRole}</span>
                        {c.isInternal && (
                          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[var(--a1)] bg-[#2a2200] border border-[var(--a4)] px-2 py-0.5 rounded-md">
                            <Lock size={9} /> Internal note
                          </span>
                        )}
                        <span className={`text-[10.5px] text-[var(--t4)] ${c.isInternal ? '' : 'ml-auto'}`}>{c.createdAt}</span>
                      </div>
                      <p className="text-[12.5px] text-[var(--t2)] leading-relaxed whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))}
                </div>
              )
            }

            {/* comment input */}
            <div className={`rounded-xl border overflow-hidden ${isInternal ? 'border-[var(--a4)]' : 'border-[var(--s4)]'}`}>
              <textarea
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                placeholder={isInternal ? 'Add an internal note (only visible to team members)…' : 'Add a comment…'}
                rows={3}
                className="w-full bg-[var(--s2)] px-3.5 py-2.5 text-[12.5px] text-[var(--t1)] placeholder:text-[var(--t4)] resize-none outline-none"
              />
              <div className={`flex items-center justify-between px-3.5 py-2 border-t ${isInternal ? 'border-[var(--a4)] bg-[#1a1500]' : 'border-[var(--s4)] bg-[var(--s2)]'}`}>
                <button
                  onClick={() => setIsInternal(v => !v)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${isInternal ? 'text-[var(--a1)]' : 'text-[var(--t3)] hover:text-[var(--t1)]'}`}
                >
                  <Lock size={11} />
                  {isInternal ? 'Internal note' : 'Mark as internal'}
                </button>
                <button
                  disabled={!commentBody.trim()}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-[var(--a1)] text-black text-[11.5px] font-bold disabled:opacity-30 hover:bg-[var(--a2)] transition-colors"
                >
                  <Send size={11} /> Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── right column: metadata + actions ── */}
        <div className="flex flex-col gap-3">

          {/* metadata */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-4 shadow-[var(--d1)]">
            <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-3">Details</div>
            <div className="flex flex-col gap-2.5">
              {[
                {
                  icon: <Tag size={11} />,
                  label: 'Type',
                  value: ticket.type,
                },
                {
                  icon: <AlertTriangle size={11} />,
                  label: 'Priority',
                  value: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
                },
                {
                  icon: <Clock size={11} />,
                  label: 'Status',
                  value: STATUS_LABEL[ticket.status as Status] ?? ticket.status,
                },
                {
                  icon: <User size={11} />,
                  label: 'Assignee',
                  value: ticket.assignee ?? 'Unassigned',
                },
                {
                  icon: <User size={11} />,
                  label: 'Created by',
                  value: ticket.createdBy,
                },
                {
                  icon: <Calendar size={11} />,
                  label: 'Created',
                  value: ticket.createdAt,
                },
                ...(ticket.projectRef ? [{
                  icon: <FolderOpen size={11} />,
                  label: 'Project',
                  value: ticket.projectRef,
                }] : []),
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--t3)] flex-shrink-0">
                    {row.icon} {row.label}
                  </span>
                  <span className="text-[11.5px] text-[var(--t1)] font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* quick actions */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-4 shadow-[var(--d1)]">
            <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-3">Actions</div>
            <div className="flex flex-col gap-2">
              {ticket.status !== 'resolved' && (
                <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--s4)] bg-[var(--s2)] text-[11.5px] font-semibold text-[var(--t2)] hover:text-[var(--ok)] hover:bg-[#0d2a18] hover:border-[#1a5c33] transition-all">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Mark resolved</span>
                  <ChevronRight size={11} className="text-[var(--t4)]" />
                </button>
              )}
              {ticket.status === 'resolved' && (
                <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--s4)] bg-[var(--s2)] text-[11.5px] font-semibold text-[var(--t2)] hover:text-[var(--a1)] hover:bg-[var(--a3)] hover:border-[var(--a4)] transition-all">
                  <span className="flex items-center gap-1.5"><RotateCcw size={12} /> Reopen ticket</span>
                  <ChevronRight size={11} className="text-[var(--t4)]" />
                </button>
              )}
              <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--s4)] bg-[var(--s2)] text-[11.5px] font-semibold text-[var(--t2)] hover:text-[#f97316] hover:bg-[#2a1200] hover:border-[#7c3a00] transition-all">
                <span className="flex items-center gap-1.5"><Zap size={12} /> Escalate</span>
                <ChevronRight size={11} className="text-[var(--t4)]" />
              </button>
              <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--s4)] bg-[var(--s2)] text-[11.5px] font-semibold text-[var(--t2)] hover:text-[var(--in)] hover:bg-[#0d1f3c] hover:border-[#1e3a6e] transition-all">
                <span className="flex items-center gap-1.5"><UserCheck size={12} /> Assign to me</span>
                <ChevronRight size={11} className="text-[var(--t4)]" />
              </button>
              {ticket.status !== 'resolved' && (
                <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--s4)] bg-[var(--s2)] text-[11.5px] font-semibold text-[var(--t2)] hover:text-[var(--er)] hover:bg-[#2a0a0a] hover:border-[#7c1a1a] transition-all">
                  <span className="flex items-center gap-1.5"><ZapOff size={12} /> Close ticket</span>
                  <ChevronRight size={11} className="text-[var(--t4)]" />
                </button>
              )}
            </div>
          </div>

          {/* attachments placeholder */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-4 shadow-[var(--d1)]">
            <div className="text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider mb-3">Attachments</div>
            <button className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-dashed border-[var(--s5)] text-[11.5px] text-[var(--t4)] hover:border-[var(--a4)] hover:text-[var(--a1)] transition-all">
              <Paperclip size={12} /> Attach file
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
