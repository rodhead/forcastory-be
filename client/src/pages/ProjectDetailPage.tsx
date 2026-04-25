// src/pages/ProjectDetailPage.tsx
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BarChart2, Database, FlaskConical, Folder, Calendar, Clock, TrendingUp, CheckCircle2, AlertCircle, Circle, Play, Download, Edit, Trash2, Activity, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { DashboardLayout } from '@/features/layout/components/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/features/layout/store/toast.hook'
import { MOCK_PROJECTS, MOCK_EXPERIMENTS, MOCK_FILES, MOCK_QUALITY } from '@/mock/data'
import { ROUTES } from '@/config/constants'

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)] relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--rl)]', accent ? 'bg-[var(--a1)]' : 'bg-[var(--s4)]')} />
      <div className="text-[9.5px] font-bold text-[var(--t4)] uppercase tracking-[.09em] mb-1.5">{label}</div>
      <div className="text-[22px] font-bold text-[var(--t1)] leading-none tracking-tight">{value}</div>
      {sub && <div className="text-[10.5px] text-[var(--t3)] mt-1">{sub}</div>}
    </div>
  )
}

const STATUS_EXP: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  running: { icon: Activity,      color: 'text-[var(--in)]',  label: 'Running'  },
  done:    { icon: CheckCircle2,  color: 'text-[var(--ok)]',  label: 'Complete' },
  failed:  { icon: AlertCircle,   color: 'text-[var(--er)]',  label: 'Failed'   },
  queued:  { icon: Circle,        color: 'text-[var(--t4)]',  label: 'Queued'   },
}

export function ProjectDetailPage() {
  const { projectId } = useParams({ strict: false }) as { projectId: string }
  const navigate = useNavigate()
  const toast    = useToast()

  const project     = MOCK_PROJECTS.find(p => p.id === projectId)
  const experiments = MOCK_EXPERIMENTS.filter(e => e.projectId === projectId)
  const files       = MOCK_FILES.filter(f => f.projectId === projectId)
  const quality     = (MOCK_QUALITY as Record<string, typeof MOCK_QUALITY.p1>)[projectId]

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-4">
            <AlertCircle size={20} className="text-[var(--t4)]" />
          </div>
          <div className="text-[15px] font-bold text-[var(--t2)] mb-1">Project not found</div>
          <div className="text-[12px] text-[var(--t3)] mb-5">The project you're looking for doesn't exist or was deleted.</div>
          <button
            onClick={() => navigate({ to: ROUTES.PROJECTS as never })}
            className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors"
          >
            <ArrowLeft size={13} /> Back to projects
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const fmt = (n: number) => n.toLocaleString('en-IN')
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const fmtSize = (b: number) => b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`
  const bestExp = experiments.filter(e => e.status === 'done' && e.bestMape != null).sort((a, b) => (a.bestMape ?? 99) - (b.bestMape ?? 99))[0]

  const STATUS_BADGE: Record<string, 'blue' | 'warn' | 'gray'> = { active: 'blue', idle: 'warn', archived: 'gray' }

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="mb-5">
        <button
          onClick={() => navigate({ to: ROUTES.PROJECTS as never })}
          className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--t3)] hover:text-[var(--a1)] transition-colors mb-3"
        >
          <ArrowLeft size={13} /> All projects
        </button>

        <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rxl)] shadow-[var(--d1)]" style={{ overflow: 'visible' }}>
          {/* gradient banner — avatar straddles the bottom edge */}
          <div className="h-[80px] relative rounded-t-[var(--rxl)]" style={{ background: 'linear-gradient(135deg, var(--a3) 0%, var(--s2) 60%, var(--s3) 100%)' }}>
            <div className="absolute inset-0 rounded-t-[var(--rxl)] overflow-hidden opacity-[0.04]">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="absolute w-px bg-[var(--t1)] top-0 bottom-0" style={{ left: `${i * 6.5}%` }} />
              ))}
            </div>
            {/* project avatar — half in banner, half below */}
            <div className="absolute bottom-0 left-6 translate-y-1/2 z-10 w-[60px] h-[60px] rounded-2xl bg-[var(--a1)] border-[4px] border-[var(--s1)] flex items-center justify-center shadow-[var(--d3)] flex-shrink-0">
              <BarChart2 size={24} className="text-black" />
            </div>
          </div>

          {/* content below banner */}
          <div className="px-6 pt-10 pb-5 rounded-b-[var(--rxl)] bg-[var(--s1)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">{project.name}</h1>
                  <Badge variant={STATUS_BADGE[project.status] ?? 'gray'} className="capitalize">{project.status}</Badge>
                </div>
                <p className="text-[12px] text-[var(--t2)] mt-1">{project.description}</p>
                {/* created by / date row */}
                <div className="flex items-center gap-3 mt-2">
                  {project.createdBy && (
                    <span className="flex items-center gap-1 text-[10.5px] text-[var(--t3)]">
                      <User size={10} className="text-[var(--t4)]" />
                      Created by <strong className="text-[var(--t2)] ml-0.5">{project.createdBy}</strong>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10.5px] text-[var(--t3)]">
                    <Calendar size={10} className="text-[var(--t4)]" />
                    {fmtDate(project.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 pt-1">
                <button onClick={() => toast.info('Edit', 'Opening project editor.')} className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--s5)] bg-[var(--s1)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] shadow-[var(--d1)] transition-colors">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => navigate({ to: ROUTES.QUALITY as never })} className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] shadow-[var(--d1)] transition-colors">
                  <Play size={12} /> Run forecast
                </button>
              </div>
            </div>

            {/* meta pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Database,   text: project.industry       },
                { icon: TrendingUp, text: project.purpose        },
                { icon: Clock,      text: `${project.granularity} granularity` },
                { icon: Calendar,   text: `Updated ${fmtDate(project.updatedAt)}` },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-[var(--s2)] border border-[var(--s4)] text-[11px] font-medium text-[var(--t2)]">
                  <Icon size={10} className="text-[var(--t4)]" />{text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total records"  value={fmt(project.recordCount)}   sub="rows in dataset"      accent />
        <StatCard label="Combinations"   value={fmt(project.combinations)}  sub="unique SKU / locations" />
        <StatCard label="Best MAPE"      value={bestExp ? `${bestExp.bestMape}%` : '—'} sub={bestExp ? bestExp.name : 'No experiments yet'} accent={!!bestExp} />
        <StatCard label="Data quality"   value={quality ? `${quality.overall}%` : '—'} sub={quality ? `${quality.issueCount} issues detected` : 'Not evaluated'} />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-4">

          {/* Experiments */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
              <div className="flex items-center gap-2">
                <FlaskConical size={13} className="text-[var(--a1)]" />
                <span className="text-[12px] font-bold text-[var(--t1)]">Experiments</span>
                <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-[var(--s3)] text-[var(--t3)]">{experiments.length}</span>
              </div>
              <button onClick={() => navigate({ to: ROUTES.FORECAST as never })} className="text-[11px] font-semibold text-[var(--a1)] hover:underline">
                + New experiment
              </button>
            </div>
            {experiments.length === 0 ? (
              <div className="py-10 text-center text-[12px] text-[var(--t3)]">No experiments yet</div>
            ) : (
              experiments.map(exp => {
                const st = STATUS_EXP[exp.status] ?? STATUS_EXP.queued
                const Icon = st.icon
                const dur = exp.durationMs ? `${Math.round(exp.durationMs / 1000)}s` : null
                return (
                  <div key={exp.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--s3)] last:border-b-0 hover:bg-[var(--s2)] transition-colors">
                    <Icon size={14} className={cn('flex-shrink-0', st.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-[var(--t1)] truncate">{exp.name}</div>
                      <div className="text-[10.5px] text-[var(--t3)]">
                        {exp.models.join(' · ')}
                        {dur && <span className="ml-1.5">· {dur}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {exp.bestMape != null ? (
                        <>
                          <div className="text-[13px] font-bold text-[var(--a1)]">{exp.bestMape}% MAPE</div>
                          <div className="text-[10px] text-[var(--t3)]">{exp.bestWmape}% wMAPE</div>
                        </>
                      ) : (
                        <span className={cn('text-[11px] font-semibold capitalize', st.color)}>{st.label}</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Files */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
              <div className="flex items-center gap-2">
                <Folder size={13} className="text-[var(--a1)]" />
                <span className="text-[12px] font-bold text-[var(--t1)]">Files</span>
                <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-[var(--s3)] text-[var(--t3)]">{files.length}</span>
              </div>
              <button onClick={() => navigate({ to: ROUTES.FILES as never })} className="text-[11px] font-semibold text-[var(--a1)] hover:underline">
                Open file manager
              </button>
            </div>
            {files.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--s3)] last:border-b-0 hover:bg-[var(--s2)] transition-colors">
                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0',
                  f.type === 'csv' ? 'bg-[var(--in-t)]' : f.type === 'json' ? 'bg-[var(--wa-t)]' : 'bg-[var(--a3)]'
                )}>
                  <Folder size={10} className={f.type === 'folder' ? 'text-[var(--a1)]' : f.type === 'csv' ? 'text-[var(--in)]' : 'text-[var(--wa)]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--t1)] truncate">{f.name}</div>
                  <div className="text-[10.5px] text-[var(--t3)]">
                    {f.type.toUpperCase()}
                    {f.sizeBytes > 0 && ` · ${fmtSize(f.sizeBytes)}`}
                    {f.rowCount && ` · ${fmt(f.rowCount)} rows`}
                  </div>
                </div>
                {f.protected && <span className="text-[9px] font-bold px-1.5 py-px rounded bg-[var(--wa-t)] text-[var(--wa)]">protected</span>}
                <button onClick={() => toast.success('Downloaded', `${f.name} saved.`)} className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--t4)] hover:text-[var(--t2)] hover:bg-[var(--s3)] transition-colors">
                  <Download size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">

          {/* Project config */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
            <div className="px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
              <span className="text-[12px] font-bold text-[var(--t1)]">Configuration</span>
            </div>
            {([
              ['Industry',     project.industry],
              ['Purpose',      project.purpose],
              ['Granularity',  project.granularity],
              ['Records',      fmt(project.recordCount)],
              ['Combinations', fmt(project.combinations)],
              ...(project.createdBy ? [['Created by', project.createdBy]] : []),
              ['Created',      fmtDate(project.createdAt)],
              ['Last updated', fmtDate(project.updatedAt)],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--s3)] last:border-b-0">
                <span className="text-[11.5px] text-[var(--t3)]">{l}</span>
                <span className="text-[11.5px] font-semibold text-[var(--t1)] capitalize">{v}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
            <div className="px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
              <span className="text-[12px] font-bold text-[var(--t1)]">Quick actions</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {[
                { label: 'View data quality',   icon: Activity,     action: () => navigate({ to: ROUTES.QUALITY as never }),    variant: 'secondary' },
                { label: 'Run new experiment',  icon: FlaskConical, action: () => navigate({ to: ROUTES.FORECAST as never }),   variant: 'primary'   },
                { label: 'Open file manager',   icon: Folder,       action: () => navigate({ to: ROUTES.FILES as never }),     variant: 'secondary' },
                { label: 'Export results',      icon: Download,     action: () => toast.info('Export', 'Preparing export.'),   variant: 'secondary' },
              ].map(({ label, icon: Icon, action, variant }) => (
                <button
                  key={label}
                  onClick={action}
                  className={cn(
                    'flex items-center gap-2.5 h-8 px-3.5 rounded-lg text-[12px] font-semibold transition-all border',
                    variant === 'primary'
                      ? 'bg-[var(--a1)] border-[var(--a1)] text-black hover:bg-[var(--a2)]'
                      : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:bg-[var(--s3)] hover:border-[var(--s5)]'
                  )}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-[var(--s1)] border border-[var(--er-b)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
            <div className="px-4 py-3 border-b border-[var(--er-b)] bg-[var(--er-t)]">
              <span className="text-[12px] font-bold text-[var(--er)]">Danger zone</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <button onClick={() => toast.info('Archive', 'Project archived.')} className="flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-semibold text-[var(--wa)] border border-[var(--wa-b)] bg-[var(--wa-t)] hover:opacity-80 transition-opacity">
                Archive project
              </button>
              <button onClick={() => toast.error('Delete', 'Confirm in the projects list.')} className="flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-semibold text-[var(--er)] border border-[var(--er-b)] bg-[var(--er-t)] hover:opacity-80 transition-opacity">
                <Trash2 size={12} /> Delete project
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
