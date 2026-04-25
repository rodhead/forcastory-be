// src/features/layout/components/Sidebar.tsx
import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  LayoutGrid, BarChart2, Folder, HelpCircle, Settings, ShieldCheck,
  ChevronRight, ChevronsLeft, ChevronsRight,
  LogOut, User, Sliders, UserCheck, AlertTriangle, BookOpen, Search, X,
} from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react'
import { cn } from '@/utils/cn'
import { useLayoutStore } from '../store/layout.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { useProjects } from '@/features/projects/queries/projects.queries'
import { Modal, ModalActions } from '@/components/shared/Modal'
import { useToast } from '../store/toast.hook'
import { MOCK_USERS } from '@/mock/data'
import { STATIC_NAV_CONFIG, canAccess, type NavConfig } from '../config/nav.config'
import type { Role } from '@/types/common'

const ICONS: Record<string, React.ElementType> = {
  LayoutGrid, BarChart2, Folder, HelpCircle, Settings, ShieldCheck, BookOpen,
}

// Returns the TENANT company name from the URL subdomain.
// organisation is used as fallback (set on the user record at login).
// Never falls back to "HKS Inc." — that is the platform owner, not a tenant.
function getCompanyName(organisation?: string): string {
  const host = window.location.hostname
  const parts = host.split('.')
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }
  return organisation ?? 'My Organisation'
}

/* ═══════════════════════════════════════════════════════════
   PROJECT SWITCHER
═══════════════════════════════════════════════════════════ */
function ProjectSwitcher({ collapsed }: { collapsed: boolean }) {
  const navigate    = useNavigate()
  const toast       = useToast()
  const { data: projects = [], isLoading } = useProjects()
  const { activeProjectId, setActiveProjectId, setCreateProjectOpen } = useLayoutStore()
  const active = projects.find(p => p.id === activeProjectId)
  const [open, setOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    search.trim()
      ? projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.industry.toLowerCase().includes(search.toLowerCase()))
      : projects,
    [projects, search]
  )

  function requestSwitch(id: string) {
    if (id === activeProjectId) { setOpen(false); return }
    setPendingId(id); setOpen(false)
  }

  function confirmSwitch() {
    if (!pendingId) return
    setActiveProjectId(pendingId)
    toast.success('Project switched', `"${projects.find(p => p.id === pendingId)?.name ?? ''}" is now active.`)
    setPendingId(null)
  }

  const pending = projects.find(p => p.id === pendingId)

  return (
    <>
      <Modal open={!!pendingId} onClose={() => setPendingId(null)} size="sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[var(--wa-t)] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-[var(--wa)]" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[var(--t1)]">Switch project?</h3>
            <p className="text-[12px] text-[var(--t2)] mt-1 leading-relaxed">
              You have unsaved changes. Switching to <strong>"{pending?.name}"</strong> will discard them.
            </p>
          </div>
        </div>
        <ModalActions>
          <button onClick={() => setPendingId(null)} className="px-3 h-8 rounded-md border border-[var(--s4)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Cancel</button>
          <button onClick={confirmSwitch} className="px-3 h-8 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors">Switch anyway</button>
        </ModalActions>
      </Modal>

      {collapsed ? (
        <div className="px-2 py-2.5 border-b border-[var(--s3)] flex-shrink-0">
          <div
            className="w-8 h-8 mx-auto rounded-lg bg-[var(--a3)] border border-[var(--a4)]/40 flex items-center justify-center cursor-pointer hover:bg-[var(--a3)] transition-colors"
            onClick={() => navigate({ to: '/dashboard/projects' as never })}
            title={active?.name ?? 'Projects'}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--a1)]" />
          </div>
        </div>
      ) : (
        <div className="px-3 py-2.5 border-b border-[var(--s3)] flex-shrink-0 relative">
          <div className="text-[9px] font-bold text-[var(--t4)] uppercase tracking-[.10em] mb-1.5">Active project</div>
          <button
            onClick={() => setOpen(p => !p)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--s2)] border border-[var(--s4)] hover:bg-[var(--s3)] hover:border-[var(--s5)] transition-all text-left group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--a1)] flex-shrink-0 shadow-[0_0_6px_var(--a1)]" />
            <span className="text-[12px] font-semibold text-[var(--t1)] truncate flex-1 min-w-0">
              {isLoading ? 'Loading…' : (active?.name ?? '—')}
            </span>
            <ChevronRight size={12} className={cn('text-[var(--t3)] flex-shrink-0 transition-transform', open && 'rotate-90')} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch('') }} />
              <div className="absolute left-3 right-3 top-full mt-1.5 z-50 bg-[var(--s1)] border border-[var(--s4)] rounded-xl shadow-[var(--d4)] overflow-hidden">
                {/* header */}
                <div className="px-2.5 py-2 border-b border-[var(--s3)]">
                  <span className="text-[10px] font-bold text-[var(--t3)] uppercase tracking-wider">Switch project</span>
                </div>
                {/* search */}
                <div className="px-2.5 py-2 border-b border-[var(--s3)]">
                  <div className="relative flex items-center">
                    <Search size={11} className="absolute left-2.5 text-[var(--t4)] pointer-events-none" />
                    <input
                      autoFocus
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search projects…"
                      className="w-full h-7 pl-7 pr-7 text-[11px] rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none focus:border-[var(--a1)] transition-colors"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2 text-[var(--t4)] hover:text-[var(--t2)] transition-colors">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
                {/* project list */}
                <div className="max-h-[200px] overflow-y-auto">
                  {isLoading
                    ? <div className="px-3 py-3 text-[11px] text-[var(--t3)]">Loading…</div>
                    : filtered.length === 0
                    ? <div className="px-3 py-4 text-center text-[11px] text-[var(--t4)]">No projects match "{search}"</div>
                    : filtered.map(p => {
                      const isAct = p.id === activeProjectId
                      return (
                        <div key={p.id} onClick={() => { requestSwitch(p.id); setSearch('') }} className={cn('flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all border-b border-[var(--s3)] last:border-b-0', isAct ? 'bg-[var(--a3)]' : 'hover:bg-[var(--s2)]')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5', isAct ? 'bg-[var(--a1)]' : 'bg-[var(--s5)]')} />
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-[11.5px] font-semibold truncate', isAct ? 'text-[var(--a1)]' : 'text-[var(--t1)]')}>{p.name}</div>
                            <div className="text-[10px] text-[var(--t3)] capitalize">{p.industry} · {p.granularity} · {p.recordCount.toLocaleString('en-IN')} rows</div>
                          </div>
                          {isAct && <span className="text-[var(--a1)] text-[11px] font-bold flex-shrink-0">✓</span>}
                        </div>
                      )
                    })}
                </div>
                {/* footer */}
                <div className="p-2.5 border-t border-[var(--s3)] flex gap-2">
                  <button
                    onClick={() => { setOpen(false); setSearch(''); navigate({ to: '/dashboard/projects' as never }) }}
                    className="flex-1 h-7 rounded-lg border border-[var(--s5)] text-[var(--t2)] text-[11px] font-semibold hover:bg-[var(--s2)] transition-colors"
                  >
                    All projects
                  </button>
                  <button
                    onClick={() => { setOpen(false); setSearch(''); navigate({ to: '/dashboard/projects' as never }); setCreateProjectOpen(true) }}
                    className="flex-1 h-7 rounded-lg bg-[var(--a1)] text-black text-[11px] font-bold hover:bg-[var(--a2)] transition-colors"
                  >
                    + New
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   SUB-RAIL
═══════════════════════════════════════════════════════════ */
function SubRail({ item }: { item: NavConfig }) {
  const router   = useRouterState()
  const navigate = useNavigate()
  const pathname = router.location.pathname
  if (!item.children) return null

  return (
    <div className="mx-2 mb-1 overflow-hidden">
      <div className="ml-5 border-l border-[var(--s4)] pl-2 flex flex-col gap-0.5 py-0.5">
        {item.children.map(child => {
          const isActive = pathname === child.to
          const isDone   = child.workflowState === 'done'
          return (
            <div
              key={child.id}
              onClick={() => navigate({ to: child.to as never })}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 cursor-pointer transition-all text-[11.5px] rounded-md',
                'border',
                isActive
                  ? 'border-[var(--a1)] text-[var(--a1)] font-semibold'
                  : isDone
                  ? 'border-transparent text-[var(--t2)] hover:bg-[var(--s2)] hover:text-[var(--t1)]'
                  : 'border-transparent text-[var(--t3)] hover:bg-[var(--s2)] hover:text-[var(--t2)]'
              )}
            >
              <span className={cn(
                'w-1.5 h-1.5 rounded-full border flex-shrink-0 transition-all',
                isActive ? 'bg-[var(--a1)] border-[var(--a1)]' :
                isDone   ? 'bg-[var(--t3)] border-[var(--t3)]' :
                           'bg-transparent border-[var(--s5)]'
              )} />
              <span className="flex-1 truncate">{child.label}</span>
              {child.meta && <span className={cn('text-[9px] font-medium shrink-0', isActive ? 'text-[var(--a1)]/70' : 'text-[var(--t4)]')}>{child.meta}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   NAV ITEM ROW
═══════════════════════════════════════════════════════════ */
function NavRow({ item, collapsed, expanded, onToggle }: { item: NavConfig; collapsed: boolean; expanded: boolean; onToggle: () => void }) {
  const router   = useRouterState()
  const navigate = useNavigate()
  const pathname = router.location.pathname
  const Icon = ICONS[item.iconName] ?? Settings
  const isActive = item.to
    ? pathname === item.to || pathname.startsWith((item.to ?? '') + '/')
    : (item.children?.some(c => pathname === c.to) ?? false)

  const handleClick = useCallback(() => {
    if (item.to && !item.children) {
      navigate({ to: item.to as never })
    } else {
      const opening = !expanded
      onToggle()
      if (opening && item.children?.[0]?.to) {
        navigate({ to: item.children[0].to as never })
      }
    }
  }, [item, navigate, onToggle, expanded])

  return (
    <div
      onClick={handleClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 mx-1.5 cursor-pointer transition-all select-none',
        'text-[12.5px] font-medium group rounded-lg',
        'border',
        isActive
          ? 'border-[var(--a1)] text-[var(--a1)] font-semibold'
          : 'border-transparent text-[var(--t2)] hover:bg-[var(--s2)] hover:text-[var(--t1)]'
      )}
    >
      <Icon size={16} className={cn('flex-shrink-0 transition-colors', isActive ? 'text-[var(--a1)]' : 'text-[var(--t3)] group-hover:text-[var(--t2)]')} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.chip && (
            <span className={cn(
              'text-[9px] font-bold px-1.5 py-px rounded-full',
              item.chipVariant === 'red'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-[var(--a1)]/20 text-[var(--a1)]'
            )}>{item.chip}</span>
          )}
          {item.children && (
            <ChevronRight size={13} className={cn('flex-shrink-0 transition-transform', isActive ? 'text-[var(--a1)]/70' : 'text-[var(--t4)]', expanded && 'rotate-90')} />
          )}
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SPOOF MODAL
═══════════════════════════════════════════════════════════ */
function SpoofModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const { startSpoof } = useLayoutStore()
  const { user } = useAuthStore()
  const LABELS: Record<Role, string> = {
    admin:   'Full access — all features and settings',
    analyst: 'Read/write — run experiments, view results',
    viewer:  'Read-only — view projects and reports',
    manager: 'Approve & export — management view',
  }

  function doSpoof() {
    const target = MOCK_USERS.find(u => u.id === selected)
    if (!target || !user) return
    startSpoof(target, user)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Login as different role" size="sm">
      <p className="text-[12px] text-[var(--t2)] mb-3">Select a user to impersonate. Your session is preserved.</p>
      <div className="flex flex-col gap-2 mb-4">
        {MOCK_USERS.map(u => (
          <div key={u.id} onClick={() => setSelected(u.id)} className={cn('px-3 py-2.5 rounded-lg border cursor-pointer transition-all', selected === u.id ? 'border-[var(--a1)] bg-[var(--a3)]' : 'border-[var(--s4)] hover:border-[var(--a4)] hover:bg-[var(--s2)]')}>
            <div className="text-[12.5px] font-bold text-[var(--t1)] capitalize">{u.role} · {u.name}</div>
            <div className="text-[11px] text-[var(--t3)] mt-0.5">{LABELS[u.role]}</div>
          </div>
        ))}
      </div>
      <ModalActions>
        <button onClick={onClose} className="px-3 h-8 rounded-lg border border-[var(--s4)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Cancel</button>
        <button onClick={doSpoof} disabled={!selected} className="px-3 h-8 rounded-lg bg-[var(--a1)] text-black text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--a2)] transition-colors">Re-login as selected</button>
      </ModalActions>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, spoofSession, expandedNav, setExpandedNav } = useLayoutStore()
  const { user: authUser, clearAuth } = useAuthStore()
  const { logout: auth0Logout } = useAuth0()
  const navigate = useNavigate()

  const effectiveRole: Role = (spoofSession?.user.role ?? authUser?.role ?? 'viewer') as Role
  const companyName = getCompanyName(authUser?.organisation)
  const [footOpen, setFootOpen] = useState(false)
  const [spoofOpen, setSpoofOpen] = useState(false)

  const currentUser: { initials?: string; name: string; role: string; picture?: string } =
    spoofSession?.user ?? authUser ?? { initials: 'H', name: 'Admin', role: 'admin' }

  const mainItems   = STATIC_NAV_CONFIG.filter(i => i.section === 'main'   && canAccess(i, effectiveRole))
  const configItems = STATIC_NAV_CONFIG.filter(i => i.section === 'config' && canAccess(i, effectiveRole))

  return (
    <>
      <SpoofModal open={spoofOpen} onClose={() => setSpoofOpen(false)} />

      <nav className={cn(
        'relative flex flex-col flex-shrink-0 h-screen z-20',
        'bg-[var(--s1)] text-[var(--t1)]',
        'border-r border-[var(--s3)]',
        'shadow-[var(--d1)]',
        'transition-[width] duration-[200ms] ease-[cubic-bezier(.4,0,.2,1)]',
        sidebarCollapsed ? 'w-[52px]' : 'w-[240px]'
      )}>

        {/* ── Brand row + collapse toggle ── */}
        <div className="h-[52px] flex items-center border-b border-[var(--s3)] flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-3.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--a1)] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_var(--a1)]">
              <BarChart2 size={14} className="text-black" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden min-w-0">
                <div className="text-[13px] font-bold text-[var(--t1)] tracking-tight whitespace-nowrap">Forecastory</div>
                <div className="text-[9.5px] text-[var(--t4)] whitespace-nowrap flex items-center gap-1">
                  <span className="text-[var(--t4)]">Company:</span>
                  <span className="text-[var(--t3)] font-semibold">{companyName}</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer',
              'text-[var(--t4)] hover:text-[var(--t2)] hover:bg-[var(--s2)] transition-all',
              sidebarCollapsed ? 'mx-auto' : 'mr-2'
            )}
          >
            {sidebarCollapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
          </button>
        </div>

        {/* ── Project switcher ── */}
        <ProjectSwitcher collapsed={sidebarCollapsed} />

        {/* ── Nav ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {!sidebarCollapsed && (
            <div className="text-[9px] font-bold text-[var(--t4)] uppercase tracking-[.12em] px-4 pt-2 pb-1.5">Main</div>
          )}
          <div className="flex flex-col gap-0.5 px-1">
            {mainItems.map(item => (
              <div key={item.id}>
                <NavRow
                  item={item}
                  collapsed={sidebarCollapsed}
                  expanded={expandedNav === item.id}
                  onToggle={() => setExpandedNav(expandedNav === item.id ? null : item.id)}
                />
                {item.children && expandedNav === item.id && !sidebarCollapsed && (
                  <SubRail item={item} />
                )}
              </div>
            ))}
          </div>

          {configItems.length > 0 && (
            <>
              {!sidebarCollapsed && (
                <div className="text-[9px] font-bold text-[var(--t4)] uppercase tracking-[.12em] px-4 pt-4 pb-1.5">Config</div>
              )}
              <div className="flex flex-col gap-0.5 px-1">
                {configItems.map(item => (
                  <div key={item.id}>
                    <NavRow
                      item={item}
                      collapsed={sidebarCollapsed}
                      expanded={expandedNav === item.id}
                      onToggle={() => setExpandedNav(expandedNav === item.id ? null : item.id)}
                    />
                    {item.children && expandedNav === item.id && !sidebarCollapsed && (
                      <SubRail item={item} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-[var(--s3)] flex-shrink-0">
          {footOpen && !sidebarCollapsed && (
            <div className="bg-[var(--s2)] border-b border-[var(--s3)]">
              {[
                { icon: User,    label: 'Profile',     to: '/dashboard/profile'     },
                { icon: Sliders, label: 'Preferences', to: '/dashboard/preferences' },
              ].map(({ icon: Icon, label, to }) => (
                <div key={label} onClick={() => { navigate({ to: to as never }); setFootOpen(false) }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--s3)] transition-all cursor-pointer">
                  <Icon size={14} className="text-[var(--t4)]" />{label}
                </div>
              ))}
              <button onClick={() => { setSpoofOpen(true); setFootOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--s3)] transition-all">
                <UserCheck size={14} className="text-[var(--t4)]" />Spoof user
                {spoofSession && <span className="ml-auto text-[9px] font-bold px-1.5 py-px rounded-full bg-[var(--wa-t)] text-[var(--wa)]">Active</span>}
              </button>
              {spoofSession && (
                <button onClick={() => { useLayoutStore.getState().endSpoof(); setFootOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[var(--wa)] hover:bg-[var(--s3)] transition-all">
                  <UserCheck size={14} />Revert to {spoofSession.originalUser.name}
                </button>
              )}
              <button onClick={() => { clearAuth(); auth0Logout({ logoutParams: { returnTo: window.location.origin } }) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[var(--er)] hover:bg-[var(--s3)] transition-all">
                <LogOut size={14} />Logout
              </button>
            </div>
          )}

          <div onClick={() => setFootOpen(p => !p)} className="flex items-center gap-2.5 px-3 py-3 cursor-pointer hover:bg-[var(--s2)] transition-colors overflow-hidden">
            <UserAvatar
              picture={!spoofSession ? currentUser.picture : undefined}
              initials={currentUser.initials ?? currentUser.name[0]?.toUpperCase()}
              name={currentUser.name}
              className={cn(
                'w-8 h-8 rounded-full text-[12px] flex-shrink-0',
                spoofSession ? 'bg-[var(--wa)] text-black' : 'bg-[var(--a1)] text-black'
              )}
            />
            {!sidebarCollapsed && (
              <>
                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--t1)] truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[var(--t3)] capitalize flex items-center gap-1">
                    {currentUser.role}
                    {spoofSession && <span className="text-[8px] font-bold px-1 rounded bg-[var(--wa-t)] text-[var(--wa)]">spoofing</span>}
                  </div>
                </div>
                <ChevronRight size={12} className={cn('text-[var(--t4)] flex-shrink-0 transition-transform', footOpen && 'rotate-90')} />
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
