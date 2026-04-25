// src/features/layout/components/Topbar.tsx
import { useEffect, useState, useRef } from 'react'
import { Bell, Settings, X, CheckCircle, AlertTriangle, Info, FlaskConical, LogOut, User, Sliders, BookOpen } from 'lucide-react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { cn } from '@/utils/cn'
import { useLayoutStore } from '../store/layout.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { BREADCRUMB_MAP } from '../config/nav.config'
import { ROUTES } from '@/config/constants'
import { useLocaleStore } from '@/features/locale/store/locale.store'

/* ── Breadcrumb ─────────────────────────────────────────── */
function Breadcrumb({ pathname, activeTab }: { pathname: string; activeTab?: string }) {
  const navigate = useNavigate()
  const { setProjectsTab } = useLayoutStore()

  const breadcrumbKey = (() => {
    if (pathname === ROUTES.PROJECTS && activeTab && activeTab !== 'overview') {
      return `${ROUTES.PROJECTS}#${activeTab}`
    }
    return pathname
  })()

  const segments = BREADCRUMB_MAP[breadcrumbKey] ?? BREADCRUMB_MAP[pathname] ?? [{ label: 'Dashboard' }]

  function handleSegmentClick(to: string) {
    if (to === ROUTES.PROJECTS) setProjectsTab('overview')
    navigate({ to: to as never })
  }

  return (
    <nav className="flex items-center gap-1 text-[12px]">
      <span
        className="text-[var(--t3)] font-medium cursor-pointer hover:text-[var(--a1)] transition-colors"
        onClick={() => { setProjectsTab('overview'); navigate({ to: '/dashboard/projects' as never }) }}
      >
        Forecastory
      </span>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            <span className="text-[var(--t4)] text-[10px] select-none mx-0.5">/</span>
            {!isLast && seg.to ? (
              <span
                className="text-[var(--t3)] font-medium cursor-pointer hover:text-[var(--a1)] transition-colors"
                onClick={() => handleSegmentClick(seg.to!)}
              >
                {seg.label}
              </span>
            ) : (
              <span className={cn('font-semibold', isLast ? 'text-[var(--t1)]' : 'text-[var(--t3)]')}>
                {seg.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

/* ── Notifications panel ────────────────────────────────── */
interface Notification { id: string; type: 'success' | 'warn' | 'info'; title: string; body: string; time: string; read: boolean }
const INIT_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'success', title: 'Experiment complete', body: 'Exp_002_With_Features finished. Best MAPE: 10.4%', time: '8 min ago', read: false },
  { id: 'n2', type: 'warn',    title: 'Data quality alert',  body: '2,041 missing values detected in Retail_Demand_Q2_2024', time: '1h ago', read: false },
  { id: 'n3', type: 'info',    title: 'New ticket assigned',  body: '#TKT-005 "Add LGBM model" assigned to you', time: '3h ago', read: true },
]
const N_ICONS  = { success: CheckCircle, warn: AlertTriangle, info: Info }
const N_COLORS = {
  success: 'text-[var(--ok)] bg-[var(--ok-t)]',
  warn:    'text-[var(--wa)] bg-[var(--wa-t)]',
  info:    'text-[var(--in)] bg-[var(--in-t)]',
}

function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Notification[]>(INIT_NOTIFICATIONS)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const unread = items.filter(i => !i.read).length

  if (!open) return null

  return (
    <div ref={ref} className="absolute top-11 right-0 w-[340px] z-50 bg-[var(--s1)] border border-[var(--s4)] rounded-xl shadow-[var(--d4)] overflow-hidden animate-[modalIn_.15s_ease]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--s3)]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[var(--t1)]">Notifications</span>
          {unread > 0 && <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-[var(--er)] text-white">{unread}</span>}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && <button onClick={() => setItems(p => p.map(i => ({ ...i, read: true })))} className="text-[11px] text-[var(--a1)] hover:underline font-medium">Mark all read</button>}
          <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--t3)] hover:bg-[var(--s3)] hover:text-[var(--t1)] transition-colors"><X size={13} /></button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-[var(--t4)]">No notifications</div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto">
          {items.map(n => {
            const Icon = N_ICONS[n.type]
            return (
              <div key={n.id} onClick={() => setItems(p => p.map(i => i.id === n.id ? { ...i, read: true } : i))}
                className={cn('flex items-start gap-3 px-4 py-3 border-b border-[var(--s3)] last:border-b-0 cursor-pointer transition-colors', n.read ? 'hover:bg-[var(--s2)]' : 'bg-[var(--a3)] hover:bg-[var(--a3)]')}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', N_COLORS[n.type])}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn('text-[12px] font-semibold truncate', n.read ? 'text-[var(--t2)]' : 'text-[var(--t1)]')}>{n.title}</div>
                    <button onClick={e => { e.stopPropagation(); setItems(p => p.filter(i => i.id !== n.id)) }} className="text-[var(--t4)] hover:text-[var(--er)] transition-colors flex-shrink-0 mt-0.5"><X size={11} /></button>
                  </div>
                  <div className="text-[11px] text-[var(--t3)] mt-0.5 leading-relaxed">{n.body}</div>
                  <div className="text-[10px] text-[var(--t4)] mt-1 font-medium">{n.time}</div>
                </div>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--a1)] flex-shrink-0 mt-2" />}
              </div>
            )
          })}
        </div>
      )}
      <div className="px-4 py-2.5 border-t border-[var(--s3)] text-center">
        <button className="text-[11px] text-[var(--a1)] hover:underline font-medium">View all notifications</button>
      </div>
    </div>
  )
}

/* ── Settings panel ─────────────────────────────────────── */
function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, toggleTheme } = useLayoutStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={ref} className="absolute top-11 right-0 w-[220px] z-50 bg-[var(--s1)] border border-[var(--s4)] rounded-xl shadow-[var(--d4)] overflow-hidden animate-[modalIn_.15s_ease]">
      <div className="px-3.5 py-2.5 text-[9px] font-bold text-[var(--t4)] uppercase tracking-[.09em] border-b border-[var(--s3)]">Quick settings</div>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--s3)]">
        <div>
          <div className="text-[12.5px] font-semibold text-[var(--t1)]">Dark mode</div>
          <div className="text-[10px] text-[var(--t3)]">Toggle theme</div>
        </div>
        <button
          onClick={() => { toggleTheme(); onClose() }}
          className={cn('w-9 h-5 rounded-full relative transition-colors', theme === 'dark' ? 'bg-[var(--a1)]' : 'bg-[var(--s5)]')}
        >
          <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-[left]', theme === 'dark' ? 'left-[19px]' : 'left-[2px]')} />
        </button>
      </div>
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="text-[12.5px] font-semibold text-[var(--t1)]">Version</div>
        <span className="font-mono text-[10.5px] text-[var(--t3)]">v2.1.0</span>
      </div>
    </div>
  )
}

/* ── User menu ──────────────────────────────────────────── */
function UserMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate  = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const { logout: auth0Logout } = useAuth0()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  const ROLE_COLOR: Record<string, string> = {
    admin:   'text-[var(--a1)] bg-[var(--a3)]',
    analyst: 'text-[var(--in)] bg-[var(--in-t)]',
    manager: 'text-[var(--wa)] bg-[var(--wa-t)]',
    viewer:  'text-[var(--t3)] bg-[var(--s3)]',
  }

  return (
    <div ref={ref} className="absolute top-11 right-0 w-[220px] z-50 bg-[var(--s1)] border border-[var(--s4)] rounded-xl shadow-[var(--d4)] overflow-hidden animate-[modalIn_.15s_ease]">
      {/* profile header */}
      <div className="px-4 py-3 border-b border-[var(--s3)]">
        <div className="flex items-center gap-3">
          <UserAvatar
            picture={user?.picture}
            initials={user?.initials}
            name={user?.name}
            className="w-9 h-9 rounded-xl bg-[var(--a1)] text-[13px] text-black flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold text-[var(--t1)] truncate">{user?.name ?? 'User'}</div>
            <div className="text-[10.5px] text-[var(--t3)] truncate">{user?.email ?? ''}</div>
          </div>
        </div>
        <div className={cn('mt-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full w-fit capitalize', ROLE_COLOR[user?.role ?? 'viewer'])}>
          {user?.role}
        </div>
      </div>

      {/* menu items */}
      <div className="py-1">
        {[
          { icon: User,    label: 'Profile',     to: '/dashboard/profile'      },
          { icon: Sliders, label: 'Preferences',  to: '/dashboard/preferences'  },
          { icon: Settings,label: 'Settings',    to: '/dashboard/settings'     },
        ].map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => { navigate({ to: item.to as never }); onClose() }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[var(--t2)] hover:bg-[var(--s2)] hover:text-[var(--t1)] transition-colors text-left"
            >
              <Icon size={13} className="text-[var(--t4)]" />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* logout */}
      <div className="border-t border-[var(--s3)] py-1">
        <button
          onClick={() => { clearAuth(); auth0Logout({ logoutParams: { returnTo: window.location.origin } }); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-semibold text-[var(--er)] hover:bg-[var(--er-t)] transition-colors text-left"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  )
}

/* ── Topbar ─────────────────────────────────────────────── */
export function Topbar({ activeTab }: { activeTab?: string }) {
  const router   = useRouterState()
  const navigate = useNavigate()
  const pathname = router.location.pathname
  const { spoofSession } = useLayoutStore()
  const { user }  = useAuthStore()

  const [notifOpen, setNotifOpen] = useState(false)
  const [settOpen,  setSettOpen]  = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)
  const [unreadCount] = useState(2)

  const isPlayground = pathname === ROUTES.WORKSPACE
  const { locale, setLocale } = useLocaleStore()

  function closeAll() { setNotifOpen(false); setSettOpen(false); setUserOpen(false) }

  return (
    <>
      {spoofSession && (
        <div className="flex items-center gap-2 px-5 py-1 bg-[var(--wa-t)] border-b border-[var(--wa-b)] text-[11px] font-semibold text-[var(--wa)] flex-shrink-0">
          <AlertTriangle size={12} />
          Viewing as <strong>{spoofSession.user.name}</strong> ({spoofSession.user.role}) — originally signed in as <strong>{spoofSession.originalUser.name}</strong>
          <button onClick={() => useLayoutStore.getState().endSpoof()} className="ml-auto px-2.5 h-5 rounded-md text-[10.5px] font-bold bg-[var(--wa-t)] border border-[var(--wa-b)] hover:opacity-80 transition-opacity">
            Revert to {spoofSession.originalUser.name}
          </button>
        </div>
      )}

      <div className="h-[50px] bg-[var(--s1)] border-b border-[var(--s4)] flex items-center px-5 gap-3 flex-shrink-0 shadow-[var(--d1)] z-10">
        <Breadcrumb pathname={pathname} activeTab={activeTab} />

        <div className="ml-auto flex items-center gap-2">
          {/* Timezone pill */}
          <div className="px-2.5 py-1 rounded-lg bg-[var(--s2)] border border-[var(--s4)] text-[11px] text-[var(--t3)] font-medium shadow-[var(--di)]">
            IST
          </div>

          {/* Language toggle */}
          <div className="flex items-center rounded-lg border border-[var(--s4)] bg-[var(--s2)] shadow-[var(--di)] overflow-hidden">
            {(['en', 'ar'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={cn(
                  'h-7 px-2.5 text-[11px] font-bold transition-all',
                  locale === lang
                    ? 'bg-[var(--a1)] text-black'
                    : 'text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--s3)]'
                )}
              >
                {lang === 'en' ? 'EN' : 'عر'}
              </button>
            ))}
          </div>

          {/* Learning button */}
          <button
            onClick={() => navigate({ to: ROUTES.LEARNING as never })}
            className={cn(
              'flex items-center gap-1.5 h-7 px-3 rounded-lg border text-[11.5px] font-semibold transition-all shadow-[var(--d1)]',
              pathname === ROUTES.LEARNING
                ? 'bg-[var(--a1)] border-[var(--a1)] text-black'
                : 'bg-[var(--s1)] border-[var(--s4)] text-[var(--t2)] hover:bg-[var(--s2)] hover:border-[var(--s5)]'
            )}
          >
            <BookOpen size={13} />
            Learning
          </button>

          {/* Playground button */}
          <button
            onClick={() => navigate({ to: ROUTES.WORKSPACE as never })}
            className={cn(
              'flex items-center gap-1.5 h-7 px-3 rounded-lg border text-[11.5px] font-semibold transition-all shadow-[var(--d1)]',
              isPlayground
                ? 'bg-[var(--a1)] border-[var(--a1)] text-black'
                : 'bg-[var(--s1)] border-[var(--s4)] text-[var(--t2)] hover:bg-[var(--s2)] hover:border-[var(--s5)]'
            )}
          >
            <FlaskConical size={13} />
            Playground
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(p => !p); setSettOpen(false); setUserOpen(false) }}
              className={cn(
                'relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all shadow-[var(--d1)]',
                notifOpen
                  ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)]'
                  : 'bg-[var(--s1)] border-[var(--s4)] text-[var(--t3)] hover:text-[var(--t2)] hover:bg-[var(--s2)]'
              )}
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--er)] text-white text-[8px] font-bold flex items-center justify-center border-2 border-[var(--s1)]">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => { setSettOpen(p => !p); setNotifOpen(false); setUserOpen(false) }}
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center transition-all shadow-[var(--d1)]',
                settOpen
                  ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)]'
                  : 'bg-[var(--s1)] border-[var(--s4)] text-[var(--t3)] hover:text-[var(--t2)] hover:bg-[var(--s2)]'
              )}
            >
              <Settings size={14} />
            </button>
            <SettingsPanel open={settOpen} onClose={() => setSettOpen(false)} />
          </div>

          {/* User avatar */}
          <div className="relative">
            <button
              onClick={() => { setUserOpen(p => !p); setNotifOpen(false); setSettOpen(false) }}
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center text-[11px] font-bold transition-all shadow-[var(--d1)]',
                userOpen
                  ? 'bg-[var(--a1)] border-[var(--a1)] text-black'
                  : 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)] hover:bg-[var(--a1)] hover:text-black'
              )}
              title={user?.name}
            >
              <UserAvatar
                picture={user?.picture}
                initials={user?.initials}
                name={user?.name}
                className="w-full h-full rounded-lg"
              />
            </button>
            <UserMenu open={userOpen} onClose={() => setUserOpen(false)} />
          </div>

        </div>
      </div>
    </>
  )
}
