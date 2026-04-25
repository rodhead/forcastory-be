// src/pages/ForecastingPages.tsx
// All four forecasting sub-pages in one file — each is a named export.
import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceDot,
} from 'recharts'
import { PageLoading } from '@/components/shared/Loading'
import { DashboardLayout } from '@/features/layout/components/DashboardLayout'
import { useLayoutStore } from '@/features/layout/store/layout.store'
import { useToast } from '@/features/layout/store/toast.hook'
import { useQuality } from '@/features/forecasting/queries/forecasting.queries'
import { useExperiments, useCreateExperiment, useModels } from '@/features/forecasting/queries/forecasting.queries'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

// ─── Chart data ───────────────────────────────────────────────────────────────
const DEMAND_DATA = [
  { w:'W1',v:820},{w:'W2',v:870},{w:'W3',v:910},{w:'W4',v:880},{w:'W5',v:950},
  {w:'W6',v:930},{w:'W7',v:890},{w:'W8',v:870},{w:'W9',v:1480},{w:'W10',v:860},
  {w:'W11',v:920},{w:'W12',v:980},{w:'W13',v:960},{w:'W14',v:940},{w:'W15',v:900},
  {w:'W16',v:950},{w:'W17',v:1010},{w:'W18',v:1470},{w:'W19',v:980},{w:'W20',v:960},
  {w:'W21',v:1020},{w:'W22',v:1060},{w:'W23',v:1090},{w:'W24',v:1080},{w:'W25',v:1120},
  {w:'W26',v:1100},
]

const FORECAST_DATA = [
  {w:'W1',actual:820,forecast:835},{w:'W2',actual:870,forecast:860},{w:'W3',actual:910,forecast:900},
  {w:'W4',actual:880,forecast:890},{w:'W5',actual:950,forecast:940},{w:'W6',actual:930,forecast:945},
  {w:'W7',actual:890,forecast:900},{w:'W8',actual:870,forecast:880},{w:'W9',actual:920,forecast:930},
  {w:'W10',actual:860,forecast:870},{w:'W11',actual:920,forecast:910},{w:'W12',actual:980,forecast:970},
  {w:'W13',actual:960,forecast:955},{w:'W14',actual:940,forecast:948},{w:'W15',actual:900,forecast:912},
  {w:'W16',actual:950,forecast:943},{w:'W17',actual:1010,forecast:1000},{w:'W18',actual:980,forecast:992},
  {w:'W19',actual:960,forecast:968},{w:'W20',actual:1020,forecast:1008},{w:'W21',actual:1060,forecast:1048},
  {w:'W22',actual:1090,forecast:1075},{w:'W23',actual:1080,forecast:1088},{w:'W24',actual:1120,forecast:1105},
  {w:'W25',actual:null,forecast:1130},{w:'W26',actual:null,forecast:1155},
]

const MODEL_BAR_DATA = [
  { name:'XGBoost', mape:10.4, wmape:8.9 },
  { name:'Ensemble',mape:10.1, wmape:8.7 },
  { name:'Prophet', mape:12.6, wmape:10.2 },
  { name:'RF',      mape:14.1, wmape:12.3 },
]

function ChartTooltipStyle() {
  return (
    <style>{`
      .recharts-tooltip-wrapper .custom-tooltip {
        background: var(--s1);
        border: 1px solid var(--s4);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 11.5px;
      }
    `}</style>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">{title}</h1>
        {sub && <p className="text-[12px] text-[var(--t2)] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-bold text-[var(--t1)] mb-3">{children}</div>
}

function MetricRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-[7px] border-b border-[var(--s3)] last:border-b-0">
      <span className="text-[12px] text-[var(--t2)]">{label}</span>
      <span className={cn('text-[12px] font-bold font-mono text-[var(--t1)]', color)}>{value}</span>
    </div>
  )
}

function StatBar({ label, value, color = 'bg-[var(--a1)]' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-[7px] border-b border-[var(--s3)] last:border-b-0">
      <span className="text-[12px] text-[var(--t2)]">{label}</span>
      <div className="flex items-center gap-2.5">
        <div className="w-[90px] h-1 bg-[var(--s3)] rounded-full shadow-[var(--di)]">
          <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
        </div>
        <span className="text-[12px] font-bold font-mono text-[var(--t1)] w-9 text-right">{value}%</span>
      </div>
    </div>
  )
}

// ─── DATA QUALITY PAGE ────────────────────────────────────────────────────────
export function DataQualityPage() {
  const activeProjectId = useLayoutStore((s) => s.activeProjectId)
  const { data: q, isLoading } = useQuality(activeProjectId)

  if (isLoading) return <DashboardLayout><PageLoading message="Loading quality data…" /></DashboardLayout>

  const issueIcon = { error: '🔴', warning: '🟡', info: '🔵' }

  return (
    <DashboardLayout>
      <PageHeader title="Data quality" sub={`Retail_Demand_Q2_2024 · ${q?.summary?.totalRecords?.toLocaleString('en-IN') ?? '—'} records`} />

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Overall score', value: q?.overall ?? '—', top: 'bg-[var(--a1)]' },
          { label: 'Completeness', value: `${q?.completeness ?? '—'}%`, top: 'bg-[var(--a1)]' },
          { label: 'Consistency', value: `${q?.consistency ?? '—'}%`, top: 'bg-[var(--wa)]' },
          { label: 'Outlier rate', value: '4.3%', top: 'bg-[var(--er)]' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-3.5 shadow-[var(--d1)] relative overflow-hidden">
            <div className={cn('absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--rl)]', s.top)} />
            <div className="text-[9.5px] font-bold text-[var(--t3)] uppercase tracking-[.07em] mb-1">{s.label}</div>
            <div className="text-[22px] font-bold text-[var(--t1)] tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Card>
          <CardTitle>Score breakdown</CardTitle>
          <StatBar label="Completeness" value={q?.completeness ?? 0} />
          <StatBar label="Consistency"  value={q?.consistency  ?? 0} color="bg-[var(--wa)]" />
          <StatBar label="Variability"  value={q?.variability  ?? 0} />
          <StatBar label="Intermittency"value={q?.intermittency ?? 0} color="bg-[var(--wa)]" />
          <StatBar label="Outlier score"value={q?.outlierScore ?? 0} color="bg-[var(--er)]" />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Issues detected</CardTitle>
            <Badge variant="danger">{q?.issueCount ?? 0} issues</Badge>
          </div>
          {q?.issues?.map((iss: { type: string; text: string }, i: number) => (
            <div key={i} className={cn('flex gap-2 p-2.5 bg-[var(--s2)] rounded-md mb-2 last:mb-0 border-l-[3px] shadow-[var(--di)]',
              iss.type === 'error' ? 'border-l-[var(--er)]' : iss.type === 'warning' ? 'border-l-[var(--wa)]' : 'border-l-[var(--in)]'
            )}>
              <span className="text-[11px]">{issueIcon[iss.type as keyof typeof issueIcon] ?? '🔵'}</span>
              <p className="text-[11.5px] text-[var(--t2)] leading-relaxed" dangerouslySetInnerHTML={{ __html: iss.text }} />
            </div>
          ))}
        </Card>

        {/* ABC-XYZ */}
        <Card>
          <div className="flex items-center justify-between mb-3"><CardTitle>ABC-XYZ matrix</CardTitle><Badge>156 SKUs</Badge></div>
          <div className="grid grid-cols-3 gap-1.5">
            {q?.abcXyz && Object.entries(q.abcXyz).map(([key, val]) => (
              <div key={key} className={cn('p-2 rounded-md text-center border',
                key === 'AX' ? 'bg-[var(--a3)] border-[var(--a4)]' : key === 'CZ' ? 'bg-[var(--er-t)] border-[var(--er-b)]' : 'bg-[var(--s2)] border-[var(--s3)]'
              )}>
                <div className="text-[9px] font-bold text-[var(--t3)] tracking-wider">{key}</div>
                <div className={cn('text-[15px] font-bold', key === 'AX' ? 'text-[var(--a1)]' : key === 'CZ' ? 'text-[var(--er)]' : 'text-[var(--t1)]')}>{String(val)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Data summary</CardTitle>
          <MetricRow label="Date range"     value={q?.summary?.dateRange ?? '—'} />
          <MetricRow label="Granularity"    value={q?.summary?.granularity ?? '—'} />
          <MetricRow label="Total records"  value={q?.summary?.totalRecords?.toLocaleString('en-IN') ?? '—'} />
          <MetricRow label="Combinations"   value={q?.summary?.combinations ?? '—'} />
          <MetricRow label="Avg pts / SKU"  value={q?.summary?.avgPointsPerSKU ?? '—'} />
          <MetricRow label="Intermittency"  value={`${q?.summary?.intermittencyPct ?? '—'}%`} color="text-[var(--wa)]" />
        </Card>
      </div>
    </DashboardLayout>
  )
}

// ─── PRE-FORECAST PAGE ────────────────────────────────────────────────────────
export function PreForecastPage() {
  const toast = useToast()
  return (
    <DashboardLayout>
      <PageHeader
        title="Pre-forecast analysis"
        sub="Prepare data before modelling"
        action={
          <button onClick={() => toast.success('Applied', 'Treatment applied to 3 SKUs.')}
            className="h-8 px-4 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold hover:bg-[var(--a2)] shadow-[0_2px_8px_rgba(74,111,165,.3)] transition-colors">
            Apply treatment
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3.5">
        <Card className="col-span-2">
          <ChartTooltipStyle />
          <div className="flex items-center justify-between mb-3">
            <div>
              <CardTitle>Demand series — RETAIL_NORTH_001</CardTitle>
              <p className="text-[11px] text-[var(--t3)] -mt-2">Jan 2022–Jun 2024 · Weekly</p>
            </div>
            <div className="flex gap-1.5"><Badge variant="danger">3 outliers</Badge><Badge>IQR</Badge></div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={DEMAND_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--s3)" />
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--s1)', border: '1px solid var(--s4)', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="v" stroke="var(--a1)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <ReferenceDot x="W9"  y={1480} r={5} fill="var(--er)" stroke="none" label={{ value:'⚠', position:'top', fontSize:12 }} />
              <ReferenceDot x="W18" y={1470} r={5} fill="var(--er)" stroke="none" label={{ value:'⚠', position:'top', fontSize:12 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardTitle>Outlier summary</CardTitle>
          <MetricRow label="Method"    value="IQR 1.5×" />
          <MetricRow label="Detected"  value="3 pts" color="text-[var(--er)]" />
          <MetricRow label="Affected"  value="2 / 156" />
          <MetricRow label="Treatment" value="Cap bounds" />
        </Card>
        <Card>
          <CardTitle>Seasonality</CardTitle>
          <MetricRow label="Period"       value="52 weeks" />
          <MetricRow label="STL strength" value="0.74"    color="text-[var(--a1)]" />
          <MetricRow label="Seasonal SKUs"value="112 / 156" />
          <MetricRow label="Peak period"  value="Nov–Jan" />
        </Card>
      </div>
    </DashboardLayout>
  )
}

// ─── FORECAST GENERATION PAGE ─────────────────────────────────────────────────
const LOG_COLORS: Record<string, string> = {
  success: 'text-[#5aaa7a]',
  running: 'text-[#d4a432]',
  info:    'text-[#5a8abf]',
  warning: 'text-[#d47a32]',
  error:   'text-[#d45a5a]',
}

export function ForecastGenerationPage() {
  const activeProjectId = useLayoutStore((s) => s.activeProjectId)
  const { data: models = [] } = useModels()
  const { data: experiments = [] } = useExperiments(activeProjectId)
  const { mutateAsync: createExp, isPending } = useCreateExperiment()
  const toast = useToast()

  const [selected, setSelected] = useState<string[]>(['Prophet', 'XGBoost', 'Random Forest'])
  const [expName, setExpName] = useState('Exp_005_New')
  const [trainUntil, setTrainUntil] = useState('2024-03-31')
  const [validateUntil, setValidateUntil] = useState('2024-06-30')

  async function runExperiment() {
    await createExp({ projectId: activeProjectId, name: expName, models: selected, trainUntil, validateUntil })
    toast.success('Started', 'Experiment queued.')
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Forecast generation"
        sub={`${models.length} available models · configure and run experiments`}
        action={
          <button onClick={runExperiment} disabled={isPending || selected.length === 0}
            className="h-8 px-4 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold hover:bg-[var(--a2)] disabled:opacity-40 shadow-[0_2px_8px_rgba(74,111,165,.3)] transition-colors">
            {isPending ? '⟳ Queuing…' : '▶ Run experiment'}
          </button>
        }
      />

      <Card className="mb-3.5">
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Select models</CardTitle>
          <div className="flex gap-2">
            <Badge>{selected.length} selected</Badge>
            <button onClick={() => setSelected((models as {name:string}[]).map(m => m.name))} className="text-[11px] text-[var(--a1)] hover:underline">All</button>
            <button onClick={() => setSelected([])} className="text-[11px] text-[var(--t3)] hover:underline">Clear</button>
          </div>
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-1.5 pb-0.5">
            {models.map((m: { id: string; name: string; category: string; premium?: boolean }) => {
              const on: boolean = selected.includes(m.name)
              return (
                <div
                  key={m.id}
                  onClick={() => setSelected((p) => on ? p.filter((x) => x !== m.name) : [...p, m.name])}
                  className={cn(
                    'relative p-2.5 rounded-md border cursor-pointer transition-all',
                    on ? 'bg-[var(--a3)] border-[var(--a4)] shadow-[var(--d1)]' : 'bg-[var(--s2)] border-[var(--s4)] hover:border-[var(--a4)] shadow-[var(--di)]',
                    m.premium && 'border-dashed'
                  )}
                >
                  <div className={cn('text-[12px] font-bold', m.premium ? 'text-[var(--t2)]' : 'text-[var(--t1)]')}>{m.name}</div>
                  <div className="text-[10px] text-[var(--t3)] mt-0.5">{m.category}</div>
                  <div className={cn(
                    'absolute top-2 right-2 w-3 h-3 rounded-full border',
                    on ? 'bg-[var(--a1)] border-[var(--a1)]' : 'border-[var(--s5)] bg-[var(--s1)]'
                  )}>
                    {on && <div className="w-[4px] h-[4px] rounded-full bg-white m-auto mt-[2.5px]" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <Card className="mb-3.5">
        <CardTitle>Experiment config</CardTitle>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Name</label>
            <input value={expName} onChange={(e) => setExpName(e.target.value)} className="w-full h-9 px-3 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none focus:border-[var(--a1)] focus:shadow-[0_0_0_3px_var(--a3)] shadow-[var(--di)] transition-all" />
          </div>
          <div />
          <div>
            <label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Train until</label>
            <input type="date" value={trainUntil} onChange={(e) => setTrainUntil(e.target.value)} className="w-full h-9 px-3 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none focus:border-[var(--a1)] shadow-[var(--di)] transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Validate until</label>
            <input type="date" value={validateUntil} onChange={(e) => setValidateUntil(e.target.value)} className="w-full h-9 px-3 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none focus:border-[var(--a1)] shadow-[var(--di)] transition-all" />
          </div>
        </div>
        {/* Log */}
        <div className="bg-[#0f1520] rounded-md p-3 font-mono text-[10.5px] h-[200px] overflow-y-auto border border-[#1e2a3a] shadow-[inset_0_2px_8px_rgba(0,0,0,.3)]">
          {[
            { ts:'08:00:01', level:'success', msg:'Config loaded · project: Retail_Demand_Q2_2024' },
            { ts:'08:00:02', level:'success', msg:'Data loaded: 48,320 rows × 8 columns' },
            { ts:'08:00:05', level:'success', msg:'Outlier treatment (IQR 1.5×) → 3 values capped' },
            { ts:'08:02:14', level:'success', msg:'Prophet (126s) · MAPE: 12.6%' },
            { ts:'08:03:44', level:'success', msg:'XGBoost (86s) · MAPE: 10.4% · best model' },
            { ts:'08:04:12', level:'running', msg:'Random Forest: 72/156 (46%) — ETA ~45s' },
            { ts:'08:04:13', level:'warning', msg:'SKU RETAIL_SOUTH_043: sparse data, Croston fallback' },
            { ts:'08:04:36', level:'success', msg:'Ensemble MAPE: 10.1% · best combined' },
            { ts:'08:04:40', level:'success', msg:'Experiment complete · 3 models · 156 SKUs' },
          ].map((line, i) => (
            <div key={i} className="leading-[1.9]">
              <span className="text-[#2a3a52] text-[9.5px]">[{line.ts}]</span>{' '}
              <span className={LOG_COLORS[line.level] ?? 'text-[#5a8abf]'}>{line.msg}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Past experiments</CardTitle>
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr>{['Name','Models','Status','Best MAPE','Date'].map((h) => (
              <th key={h} className="text-left text-[10px] font-bold text-[var(--t3)] uppercase tracking-[.07em] pb-2 border-b border-[var(--s4)] px-2.5 first:pl-0">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {experiments.map((e) => (
              <tr key={e.id} className="hover:bg-[var(--s2)] transition-colors">
                <td className="py-2.5 px-2.5 first:pl-0 font-semibold text-[var(--t1)] border-b border-[var(--s3)]">{e.name}</td>
                <td className="py-2.5 px-2.5 text-[var(--t2)] border-b border-[var(--s3)]">{e.models.join(', ')}</td>
                <td className="py-2.5 px-2.5 border-b border-[var(--s3)]">
                  <Badge variant={e.status === 'done' ? 'blue' : e.status === 'failed' ? 'danger' : 'warn'}>
                    {e.status}
                  </Badge>
                </td>
                <td className="py-2.5 px-2.5 font-mono font-bold text-[var(--t1)] border-b border-[var(--s3)]">{e.bestMape ? `${e.bestMape}%` : '—'}</td>
                <td className="py-2.5 px-2.5 text-[var(--t2)] border-b border-[var(--s3)]">{new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  )
}

// ─── POST-FORECAST PAGE ───────────────────────────────────────────────────────
export function PostForecastPage() {
  const toast = useToast()
  return (
    <DashboardLayout>
      <PageHeader
        title="Post-forecast"
        sub="Exp_002_With_Features · XGBoost best model"
        action={
          <button onClick={() => toast.success('Exported', 'PDF report saved.')}
            className="h-8 px-4 rounded-md border border-[var(--s5)] bg-[var(--s1)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] shadow-[var(--d1)] transition-colors">
            ↓ Export PDF
          </button>
        }
      />
      <div className="grid grid-cols-3 gap-3 mb-3.5">
        {[{ l: 'MAPE', v: '10.4%' }, { l: 'WMAPE', v: '8.9%' }, { l: 'Bias', v: '+2.1%' }].map((m) => (
          <div key={m.l} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-3.5 text-center shadow-[var(--d1)]">
            <div className="text-[9.5px] font-bold text-[var(--t3)] uppercase tracking-[.07em]">{m.l}</div>
            <div className="text-[24px] font-bold text-[var(--t1)] tracking-tight my-1">{m.v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <Card className="col-span-2">
          <ChartTooltipStyle />
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Actual vs forecast</CardTitle>
            <div className="flex gap-1.5"><Badge>Actuals</Badge><Badge variant="blue">Forecast</Badge></div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={FORECAST_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--s3)" />
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--s1)', border: '1px solid var(--s4)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="actual"   stroke="var(--a1)"  strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="var(--in)"  strokeWidth={2} dot={false} strokeDasharray="4 2" name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardTitle>Model comparison</CardTitle>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={MODEL_BAR_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--s3)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--s1)', border: '1px solid var(--s4)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Bar dataKey="mape"  fill="var(--a1)" radius={[3,3,0,0]} name="MAPE %" />
              <Bar dataKey="wmape" fill="var(--in)"  radius={[3,3,0,0]} name="WMAPE %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardTitle>Accuracy by segment</CardTitle>
          <MetricRow label="AX SKUs (34)" value="7.2%"  color="text-[var(--a1)]" />
          <MetricRow label="AY (18)"       value="11.8%" color="text-[var(--a1)]" />
          <MetricRow label="BX (22)"       value="15.4%" color="text-[var(--wa)]" />
          <MetricRow label="CZ (9)"        value="34.1%" color="text-[var(--er)]" />
        </Card>
      </div>
    </DashboardLayout>
  )
}
