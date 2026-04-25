// src/components/shared/ChatPanel.tsx
import { useState, useRef, useEffect } from 'react'
import { X, Send, Paperclip, ChevronLeft, Plus, Clock, Wand2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLayoutStore } from '@/features/layout/store/layout.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { ENV } from '@/config/env'

const CHAT_API = `http://localhost:${ENV.apiPort}/v1/chat`

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'ai' | 'user'
  text: string
  time: string
  metrics?: { label: string; value: string }[]
  tags?: string[]
}

interface Conversation {
  id: string
  title: string
  preview: string
  time: string
  unread: number
  messages: Message[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Best model for my data?',
  'Explain MAPE vs WMAPE',
  'Why low accuracy on CZ SKUs?',
  'How to improve forecast?',
]

const AI_REPLIES: Record<string, { text: string; metrics?: { label: string; value: string }[]; tags?: string[] }> = {
  'Best model for my data?': {
    text: 'Based on your weekly retail data with **156 SKUs** and strong seasonality (0.74), **XGBoost with lag features** is your best starting point. It achieved 10.4% MAPE on your last run — top tier for retail demand.',
    metrics: [{ label: 'Best MAPE', value: '10.4%' }, { label: 'SKUs', value: '156' }, { label: 'Confidence', value: 'High' }],
    tags: ['XGBoost', 'Lag features', 'Retail'],
  },
  'Explain MAPE vs WMAPE': {
    text: '**MAPE** weights all SKUs equally — a single high-error SKU can skew the score. **WMAPE** weights by actual volume, so high-volume SKUs drive the result. For demand planning, WMAPE is usually more business-relevant.',
    tags: ['Accuracy', 'Metrics'],
  },
  'Why low accuracy on CZ SKUs?': {
    text: 'CZ SKUs have **low volume + lumpy demand** — inherently hard to forecast with standard models. Recommended: use **Croston** for intermittent demand, or apply safety stock rules instead of point forecasts.',
    metrics: [{ label: 'Intermittency', value: '18.4%' }, { label: 'Recommended', value: 'Croston' }],
    tags: ['CZ segment', 'Intermittent demand'],
  },
  'How to improve forecast?': {
    text: 'Three steps to lift accuracy: **(1)** Fix data quality — fill missing values and smooth outliers. **(2)** Add external features like promotions and holidays. **(3)** Try **ensemble methods** combining XGBoost + Prophet for 1–2% MAPE gain.',
    tags: ['Data quality', 'External features', 'Ensemble'],
  },
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

let _id = 0
const uid = () => String(++_id)

function mkAi(text: string, metrics?: { label: string; value: string }[], tags?: string[]): Message {
  return { id: uid(), role: 'ai', text, time: now(), metrics, tags }
}
function mkUser(text: string): Message {
  return { id: uid(), role: 'user', text, time: now() }
}

const INIT_MSGS: Message[] = [
  mkAi("Hi! I'm your **HKS AI Bot** assistant. I can help with data quality, model selection, and accuracy analysis. What would you like to explore?"),
  mkAi('I noticed **2,041 missing values** in your active project. Want me to recommend a filling strategy?', [
    { label: 'Missing', value: '2,041' }, { label: 'Affected SKUs', value: '23' },
  ], ['Data quality']),
]

const PAST_CONVOS: Conversation[] = [
  {
    id: 'c1', title: 'Retail Q2 Analysis', time: '2h ago', unread: 0,
    preview: 'XGBoost with lag features is your best bet...',
    messages: [mkUser('Best model for my data?'), mkAi(AI_REPLIES['Best model for my data?'].text, AI_REPLIES['Best model for my data?'].metrics, AI_REPLIES['Best model for my data?'].tags)],
  },
  {
    id: 'c2', title: 'CZ SKU Deep Dive', time: '1d ago', unread: 0,
    preview: 'CZ SKUs have low volume + lumpy demand...',
    messages: [mkUser('Why low accuracy on CZ SKUs?'), mkAi(AI_REPLIES['Why low accuracy on CZ SKUs?'].text, AI_REPLIES['Why low accuracy on CZ SKUs?'].metrics, AI_REPLIES['Why low accuracy on CZ SKUs?'].tags)],
  },
  {
    id: 'c3', title: 'Metrics Explained', time: '3d ago', unread: 0,
    preview: 'MAPE weights all SKUs equally...',
    messages: [mkUser('Explain MAPE vs WMAPE'), mkAi(AI_REPLIES['Explain MAPE vs WMAPE'].text, undefined, AI_REPLIES['Explain MAPE vs WMAPE'].tags)],
  },
  {
    id: 'c4', title: 'Accuracy Improvement', time: '5d ago', unread: 0,
    preview: 'Three steps to lift accuracy...',
    messages: [mkUser('How to improve forecast?'), mkAi(AI_REPLIES['How to improve forecast?'].text, undefined, AI_REPLIES['How to improve forecast?'].tags)],
  },
]

// ─── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMd(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

// ─── Theme palette ─────────────────────────────────────────────────────────────
function useChatTheme(isDark: boolean) {
  return {
    panelBg:      isDark ? '#080d18'   : '#ffffff',
    panelBorder:  isDark ? '#1a2236'   : '#e2e8f0',
    headerGrad:   isDark ? 'linear-gradient(135deg,#0f1a30 0%,#0a1020 100%)' : 'linear-gradient(135deg,#f8fafc 0%,#ffffff 100%)',
    headerBorder: isDark ? '#1a2236'   : '#e2e8f0',
    msgAiBg:      isDark ? '#0d1220'   : '#f8fafc',
    msgAiBorder:  isDark ? '#1a2236'   : '#e2e8f0',
    msgAiShadow:  isDark ? '0 2px 12px rgba(0,0,0,.3)' : '0 1px 4px rgba(0,0,0,.06)',
    msgUserFrom:  isDark ? '#1a2845'   : '#eff6ff',
    msgUserTo:    isDark ? '#0f1a30'   : '#dbeafe',
    msgUserBorder:isDark ? '#2a3a5a'   : '#bfdbfe',
    inputBg:      isDark ? '#0f1520'   : '#f8fafc',
    inputBorder:  isDark ? '#1a2236'   : '#e2e8f0',
    inputFocus:   '#ca8a04',
    quickBg:      isDark ? '#0f1520'   : '#f1f5f9',
    quickBorder:  isDark ? '#1a2236'   : '#e2e8f0',
    quickText:    isDark ? '#3a5070'   : '#64748b',
    textPrimary:  isDark ? '#c8d4e8'   : '#1e293b',
    textSecondary:isDark ? '#4a6080'   : '#64748b',
    textMuted:    isDark ? '#2a3a52'   : '#94a3b8',
    metricBg:     isDark ? '#0a0f1a'   : '#f0f4f8',
    metricBorder: isDark ? '#1a2a40'   : '#dbeafe',
    tagBg:        isDark ? '#1a2236'   : '#e2e8f0',
    tagBorder:    isDark ? '#1e2a45'   : '#cbd5e1',
    tagText:      isDark ? '#4a6080'   : '#64748b',
    convoHover:   isDark ? '#0f1520'   : '#f8fafc',
    convoActive:  isDark ? '#1a2845'   : '#eff6ff',
    convoDiv:     isDark ? '#0f1520'   : '#f1f5f9',
    listBg:       isDark ? '#080d18'   : '#ffffff',
    userAvBg:     isDark ? '#1e2a45'   : '#dbeafe',
    userAvBorder: isDark ? '#2a3a5a'   : '#bfdbfe',
    userAvText:   isDark ? '#7a9abf'   : '#3b82f6',
    thinkBg:      isDark ? '#161b2e'   : '#f0f4f8',
    thinkBorder:  isDark ? '#1e2a45'   : '#e2e8f0',
    pulseBg:      isDark ? '#161b2e'   : '#e2e8f0',
    timestamp:    isDark ? '#2a3a52'   : '#94a3b8',
    scrollbar:    isDark ? '#1a2236'   : '#e2e8f0',
    divLine:      isDark ? '#0f1520'   : '#f1f5f9',
    separator:    isDark ? '#1a2236'   : '#e2e8f0',
    btnIcon:      isDark ? '#3a5070'   : '#94a3b8',
    btnHoverBg:   isDark ? '#1a2236'   : '#f1f5f9',
    btnHoverIcon: '#ca8a04',
    closeHover:   isDark ? '#e8d48a'   : '#1e293b',
    titleColor:   isDark ? '#e8d48a'   : '#ca8a04',
    onlineDot:    '#4ade80',
    onlineLabel:  isDark ? '#3a5070'   : '#94a3b8',
    accent:       '#ca8a04',
    accentHover:  '#a16207',
  }
}

// ─── Loading indicator ─────────────────────────────────────────────────────────
function ThinkingIndicator({ C }: { C: ReturnType<typeof useChatTheme> }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#ca8a04] to-[#a16207] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(202,138,4,.35)]">
        <Wand2 size={13} className="text-black" />
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-tl-sm" style={{ background: C.thinkBg, border: `1px solid ${C.thinkBorder}` }}>
          <div className="flex gap-1 items-center">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-1 rounded-full bg-[#ca8a04]"
                style={{ height: '12px', animation: `waveBar 1s ease-in-out ${i * 0.12}s infinite` }}
              />
            ))}
          </div>
          <span className="text-[10.5px] font-medium ml-1" style={{ color: C.textSecondary }}>Analysing…</span>
        </div>
        <div className="flex gap-1.5 ml-1">
          <div className="h-2 w-16 rounded animate-pulse" style={{ background: C.pulseBg }} />
          <div className="h-2 w-10 rounded animate-pulse" style={{ background: C.pulseBg, animationDelay: '0.1s' }} />
        </div>
      </div>
    </div>
  )
}

// ─── AI message ───────────────────────────────────────────────────────────────
function AiMessage({ msg, C }: { msg: Message; C: ReturnType<typeof useChatTheme> }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#ca8a04] to-[#a16207] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(202,138,4,.3)] mt-0.5">
        <Wand2 size={13} className="text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-tl-sm px-3.5 py-3" style={{ background: C.msgAiBg, border: `1px solid ${C.msgAiBorder}`, boxShadow: C.msgAiShadow }}>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: C.textPrimary }}
            dangerouslySetInnerHTML={{
              __html: renderMd(msg.text)
                .replace(/<strong>/g, `<strong style="color:#e8d48a;font-weight:600">`)
                .replace(/<em>/g, `<em style="color:#7aa2d4;font-style:normal;font-weight:500">`)
            }}
          />
          {msg.metrics && msg.metrics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.separator}` }}>
              {msg.metrics.map(m => (
                <div key={m.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: C.metricBg, border: `1px solid ${C.metricBorder}` }}>
                  <span className="text-[9.5px] font-medium uppercase tracking-[.06em]" style={{ color: C.textSecondary }}>{m.label}</span>
                  <span className="text-[11px] font-bold font-mono text-[#ca8a04]">{m.value}</span>
                </div>
              ))}
            </div>
          )}
          {msg.tags && msg.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {msg.tags.map(t => (
                <span key={t} className="text-[9.5px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.tagBg, color: C.tagText, border: `1px solid ${C.tagBorder}` }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-[9px] font-medium mt-1 ml-1" style={{ color: C.timestamp }}>{msg.time}</div>
      </div>
    </div>
  )
}

// ─── User message ──────────────────────────────────────────────────────────────
function UserMessage({ msg, C }: { msg: Message; C: ReturnType<typeof useChatTheme> }) {
  const { user } = useAuthStore()
  return (
    <div className="flex gap-2.5 items-start flex-row-reverse">
      <UserAvatar
        picture={user?.picture}
        initials={user?.initials}
        name={user?.name}
        className="w-7 h-7 rounded-xl flex-shrink-0 text-[10px] mt-0.5"
        style={{ background: C.userAvBg, border: `1px solid ${C.userAvBorder}`, color: C.userAvText }}
      />
      <div className="flex-1 min-w-0 flex flex-col items-end">
        <div className="rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%]" style={{ background: `linear-gradient(135deg,${C.msgUserFrom},${C.msgUserTo})`, border: `1px solid ${C.msgUserBorder}` }}>
          <p className="text-[12px] leading-relaxed" style={{ color: C.textPrimary }}>{msg.text}</p>
        </div>
        <div className="text-[9px] font-medium mt-1 mr-1" style={{ color: C.timestamp }}>{msg.time}</div>
      </div>
    </div>
  )
}

// ─── Conversation list ────────────────────────────────────────────────────────
function ConversationList({
  convos, activeId, onSelect, onNew, onClose, C,
}: {
  convos: Conversation[]; activeId: string; onSelect: (id: string) => void; onNew: () => void; onClose: () => void
  C: ReturnType<typeof useChatTheme>
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: C.listBg }}>
      <div className="flex items-center gap-2 px-4 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.separator}` }}>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ background: C.thinkBg, color: C.btnIcon }} onMouseEnter={e => (e.currentTarget.style.color = '#ca8a04')} onMouseLeave={e => (e.currentTarget.style.color = C.btnIcon)}>
          <ChevronLeft size={15} />
        </button>
        <span className="text-[13px] font-bold flex-1" style={{ color: C.textPrimary }}>Conversations</span>
        <button onClick={onNew} className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-black text-[11px] font-bold transition-colors" style={{ background: '#ca8a04' }} onMouseEnter={e => (e.currentTarget.style.background = '#a16207')} onMouseLeave={e => (e.currentTarget.style.background = '#ca8a04')}>
          <Plus size={11} /> New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {convos.map(c => {
          const isActive = c.id === activeId
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full text-left px-4 py-3 transition-all"
              style={{ background: isActive ? C.convoActive : 'transparent', borderBottom: `1px solid ${C.convoDiv}` }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.convoHover }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[12.5px] font-semibold truncate flex-1 mr-2" style={{ color: isActive ? '#ca8a04' : C.textPrimary }}>{c.title}</span>
                <span className="text-[9.5px] font-medium flex items-center gap-1 flex-shrink-0" style={{ color: C.textMuted }}>
                  <Clock size={9} />{c.time}
                </span>
              </div>
              <p className="text-[10.5px] truncate leading-relaxed" style={{ color: C.textSecondary }}>{c.preview}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────
export function ChatPanel() {
  const { theme } = useLayoutStore()
  const isDark = theme === 'dark'
  const C = useChatTheme(isDark)

  const [open,       setOpen]       = useState(false)
  const [showList,   setShowList]   = useState(false)
  const [activeId,   setActiveId]   = useState('current')
  const [convos]                     = useState<Conversation[]>(PAST_CONVOS)
  const [messages,   setMessages]   = useState<Message[]>(INIT_MSGS)
  const [input,      setInput]      = useState('')
  const [thinking,   setThinking]   = useState(false)
  const [badgeCount, setBadgeCount] = useState(2)
  const [hovered,    setHovered]    = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  async function send(text: string) {
    if (!text.trim() || thinking) return
    setMessages(m => [...m, mkUser(text)])
    setInput('')
    setThinking(true)
    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-tenantId': 'default' },
        body: JSON.stringify({ message: text }),
        signal: AbortSignal.timeout(130_000),
      })
      const data = await res.json()
      const replyText = res.ok
        ? (data.response ?? 'No response received.')
        : `Error ${res.status}: ${data.error ?? res.statusText}`
      setMessages(m => [...m, mkAi(replyText)])
    } catch {
      setMessages(m => [...m, mkAi('**Connection error.** Make sure Kafka and the AI service are running.')])
    } finally {
      setThinking(false)
    }
  }

  function selectConvo(id: string) {
    const c = convos.find(x => x.id === id)
    if (c) { setMessages(c.messages); setActiveId(id) }
    setShowList(false)
  }

  function newConvo() {
    setMessages(INIT_MSGS)
    setActiveId('current')
    setShowList(false)
  }

  return (
    <>
      <style>{`
        @keyframes waveBar {
          0%,100% { transform: scaleY(0.3); opacity:.4; }
          50%      { transform: scaleY(1.0); opacity:1;  }
        }
        @keyframes chatSlide {
          from { opacity:0; transform: translateX(20px); }
          to   { opacity:1; transform: translateX(0);    }
        }
      `}</style>

      {/* ── Right-edge trigger button ── */}
      <button
        onClick={() => { setOpen(o => !o); setBadgeCount(0) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed right-0 bottom-[28%] z-[500] flex items-center gap-0 rounded-l-2xl cursor-pointer transition-all duration-300 overflow-hidden select-none"
        style={{
          background: open ? '#a16207' : 'linear-gradient(135deg,#ca8a04,#a16207)',
          boxShadow: '0 4px 20px rgba(202,138,4,.4), -2px 0 16px rgba(202,138,4,.15)',
          padding: hovered ? '14px 16px 14px 14px' : '14px 10px',
          maxWidth: hovered ? '180px' : '44px',
        }}
      >
        {/* AI icon */}
        <div className="relative flex-shrink-0">
          <Wand2 size={17} className="text-black" />
          {badgeCount > 0 && !open && (
            <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border border-[#ca8a04]">
              {badgeCount}
            </span>
          )}
        </div>

        {/* Expandable label */}
        <div
          className="flex flex-col items-start overflow-hidden transition-all duration-300"
          style={{ maxWidth: hovered ? '120px' : '0px', opacity: hovered ? 1 : 0, marginLeft: hovered ? '10px' : '0' }}
        >
          <span className="text-black text-[11px] font-bold whitespace-nowrap leading-tight">HKS AI Bot</span>
          <span className="text-black/60 text-[9px] whitespace-nowrap">Forecasting AI</span>
        </div>
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="fixed bottom-4 right-14 z-[499] w-[390px] flex flex-col overflow-hidden"
          style={{
            height: '560px',
            background: C.panelBg,
            border: `1px solid ${C.panelBorder}`,
            borderRadius: '20px',
            boxShadow: `0 24px 64px rgba(0,0,0,.${isDark ? 6 : 2}), 0 0 0 1px rgba(202,138,4,.08)`,
            animation: 'chatSlide .22s cubic-bezier(.34,1.4,.64,1)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
            style={{ background: C.headerGrad, borderBottom: `1px solid ${C.headerBorder}` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#ca8a04,#7a5000)', boxShadow: '0 0 16px rgba(202,138,4,.3)' }}
            >
              <Wand2 size={16} className="text-black" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold tracking-tight" style={{ color: C.titleColor }}>HKS AI Bot</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.onlineDot, boxShadow: `0 0 6px ${C.onlineDot}` }} />
                <span className="text-[10px] font-medium" style={{ color: C.onlineLabel }}>Online · Model v2.1</span>
              </div>
            </div>

            <button
              onClick={() => setShowList(s => !s)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: C.btnIcon }}
              onMouseEnter={e => { (e.currentTarget.style.color = C.btnHoverIcon); (e.currentTarget.style.background = C.btnHoverBg) }}
              onMouseLeave={e => { (e.currentTarget.style.color = C.btnIcon); (e.currentTarget.style.background = 'transparent') }}
              title="Conversations"
            >
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <rect x="0" y="0" width="14" height="1.5" rx="0.75" fill="currentColor"/>
                <rect x="0" y="4.5" width="10" height="1.5" rx="0.75" fill="currentColor"/>
                <rect x="0" y="9" width="6" height="1.5" rx="0.75" fill="currentColor"/>
              </svg>
            </button>

            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: C.btnIcon }}
              onMouseEnter={e => { (e.currentTarget.style.color = C.closeHover); (e.currentTarget.style.background = C.btnHoverBg) }}
              onMouseLeave={e => { (e.currentTarget.style.color = C.btnIcon); (e.currentTarget.style.background = 'transparent') }}
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Conversation list overlay ── */}
          <div className={cn(
            'absolute inset-x-0 top-[65px] bottom-0 z-20 transition-all duration-200',
            showList ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          )}>
            <ConversationList
              convos={convos}
              activeId={activeId}
              onSelect={selectConvo}
              onNew={newConvo}
              onClose={() => setShowList(false)}
              C={C}
            />
          </div>

          {/* ── Messages ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.scrollbar} transparent` }}
          >
            {messages.map(m =>
              m.role === 'ai'
                ? <AiMessage key={m.id} msg={m} C={C} />
                : <UserMessage key={m.id} msg={m} C={C} />
            )}
            {thinking && <ThinkingIndicator C={C} />}
          </div>

          {/* ── Quick prompts ── */}
          <div className="flex gap-1.5 px-4 py-2.5 flex-wrap flex-shrink-0" style={{ borderTop: `1px solid ${C.divLine}` }}>
            {QUICK_PROMPTS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap"
                style={{ background: C.quickBg, border: `1px solid ${C.quickBorder}`, color: C.quickText }}
                onMouseEnter={e => { (e.currentTarget.style.borderColor = '#ca8a04'); (e.currentTarget.style.color = '#ca8a04') }}
                onMouseLeave={e => { (e.currentTarget.style.borderColor = C.quickBorder); (e.currentTarget.style.color = C.quickText) }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* ── Input ── */}
          <div className="flex gap-2 items-end px-4 pb-4 pt-2.5 flex-shrink-0" style={{ borderTop: `1px solid ${C.separator}` }}>
            <button className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: C.inputBg, border: `1px solid ${C.inputBorder}`, color: C.btnIcon }}>
              <Paperclip size={13} />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Ask about your forecast…"
              rows={1}
              className="flex-1 px-3.5 py-2 text-[12px] outline-none resize-none max-h-20 min-h-[34px] leading-relaxed rounded-xl transition-all"
              style={{ background: C.inputBg, border: `1px solid ${C.inputBorder}`, color: C.textPrimary }}
              onFocus={e => (e.target.style.borderColor = '#ca8a04')}
              onBlur={e => (e.target.style.borderColor = C.inputBorder)}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg,#ca8a04,#a16207)', boxShadow: '0 2px 8px rgba(202,138,4,.3)' }}
            >
              <Send size={13} className="text-black" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
