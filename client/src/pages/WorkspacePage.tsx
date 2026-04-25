// src/pages/WorkspacePage.tsx
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Play, RotateCcw, Download, FlaskConical } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/utils/cn'
import { useToast } from '@/features/layout/store/toast.hook'
import { MOCK_WORKSPACE_RESULTS, MOCK_LOG_LINES } from '@/mock/data'
import { ToastContainer } from '@/components/shared/Toast'

// ─── Techy loading screen ─────────────────────────────────────────────────────
const BOOT_MESSAGES = [
  'Initializing workspace environment...',
  'Loading model registry...',
  'Mounting data connectors...',
  'Bootstrapping experiment engine...',
  'Calibrating feature pipeline...',
  'Verifying data integrity...',
  'Workspace ready ✓',
]

function PlaygroundLoader({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalMs = 5000
    const perMsg  = totalMs / BOOT_MESSAGES.length

    const msgTimer = setInterval(() => {
      setMsgIdx(i => {
        const next = i + 1
        if (next >= BOOT_MESSAGES.length) clearInterval(msgTimer)
        return Math.min(next, BOOT_MESSAGES.length - 1)
      })
    }, perMsg)

    const progTimer = setInterval(() => {
      setProgress(p => Math.min(p + 1, 100))
    }, totalMs / 100)

    const doneTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, totalMs)

    return () => { clearInterval(msgTimer); clearInterval(progTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className={cn(
      'fixed inset-0 z-[700] flex flex-col items-center justify-center bg-[#0a0e1a] transition-opacity duration-400',
      visible ? 'opacity-100' : 'opacity-0'
    )}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(#4af 1px,transparent 1px),linear-gradient(90deg,#4af 1px,transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-8">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-[#ca8a04] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(202,138,4,.4)]">
          <FlaskConical size={26} className="text-black" />
        </div>

        <div className="text-[22px] font-bold text-white tracking-tight mb-1">Playground</div>
        <div className="text-[12px] text-white/40 mb-10">HKS Forecastory · v2.1</div>

        {/* Messages */}
        <div className="w-full h-[22px] mb-4 text-center">
          {BOOT_MESSAGES.map((msg, i) => (
            <p key={i} className={cn(
              'text-[12.5px] font-mono transition-all duration-300 absolute left-0 right-0',
              msgIdx === i ? 'opacity-100 text-[#ca8a04]' : 'opacity-0 text-white/40'
            )}>{msg}</p>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#ca8a04] rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between w-full text-[10px] font-mono text-white/25">
          <span>BOOT SEQUENCE</span>
          <span>{progress}%</span>
        </div>

        {/* Blinking dots */}
        <div className="flex gap-1.5 mt-8">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#ca8a04]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type WsStatus = 'idle' | 'running' | 'done'

interface ScenarioRun {
  id: number
  label: string
  model: string
  mape: string
  wmape: string
  features: number
  horizon: number
}

const MODEL_SUGGESTIONS: Record<string, string> = {
  XGBoost:        'XGBoost with lag + rolling features is your best bet for this weekly retail dataset. Start with max_depth=6, lr=0.05. Expect 10–12% MAPE.',
  Prophet:        'Prophet excels with your strong seasonality (0.74 STL). Enable Fourier terms for better seasonal fit. Expect 12–14% MAPE.',
  'Random Forest':'Random Forest is a solid baseline — less hyperparameter-sensitive than XGBoost. Expect 13–15% MAPE.',
  LSTM:           'LSTM can capture nonlinear patterns. With 309 avg pts/SKU you have enough data. Slower to train.',
  'Auto ARIMA':   'Auto ARIMA fits fast and works for stationary series. Poor for strong seasonality.',
  Ensemble:       'Ensemble (XGB + Prophet) typically gives 0.5–1.5% MAPE improvement over the best single model.',
}

let runCounter = 0

// ─── Config panel ─────────────────────────────────────────────────────────────
function ConfigPanel({
  model, onModelChange,
  horizon, onHorizonChange,
  depth, onDepthChange,
  lr, onLrChange,
  nest, onNestChange,
  features, onFeaturesChange,
  scenarios, onLoadScenario, onSaveScenario,
  onRun,
}: {
  model: string; onModelChange: (m: string) => void
  horizon: number; onHorizonChange: (v: number) => void
  depth: number; onDepthChange: (v: number) => void
  lr: number; onLrChange: (v: number) => void
  nest: number; onNestChange: (v: number) => void
  features: Record<string, boolean>; onFeaturesChange: (key: string, val: boolean) => void
  scenarios: string[]; onLoadScenario: (s: string) => void; onSaveScenario: () => void
  onRun: () => void
}) {
  const sliders = [
    { label: 'Forecast horizon', unit: 'wks', min: 4, max: 52, value: horizon, onChange: onHorizonChange },
    { label: 'Max depth (trees)', unit: '',    min: 2, max: 12, value: depth,   onChange: onDepthChange },
    { label: 'n_estimators',      unit: '',    min: 50, max: 1000, step: 50, value: nest, onChange: onNestChange },
    { label: 'Learning rate',     unit: '',    min: 1,  max: 30, value: lr,     onChange: onLrChange, display: (lr / 100).toFixed(2) },
  ]

  const featureLabels: Record<string, string> = {
    lag: 'Lag features (1,4,8,13,26,52w)',
    rolling: 'Rolling statistics (4,8,13w)',
    calendar: 'Calendar features',
    external: 'External features',
    fourier: 'Fourier terms (seasonality)',
  }

  return (
    <div className="w-[280px] flex-shrink-0 bg-[var(--s1)] border-r border-[var(--s4)] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--s3)]">
        <div className="text-[13px] font-bold text-[var(--t1)]">Configuration</div>
        <div className="text-[11px] text-[var(--t3)] mt-0.5">Tune and run scenarios</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* model pills */}
        <div>
          <div className="text-[10px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Model</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(['XGBoost','Prophet','Random Forest','LSTM','Auto ARIMA','Ensemble'] as const).map((m) => (
              <button key={m} onClick={() => onModelChange(m)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md border text-[11.5px] font-semibold text-center transition-all',
                  model === m
                    ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)] shadow-[var(--d1)]'
                    : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)] shadow-[var(--di)]'
                )}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* sliders */}
        <div>
          <div className="text-[10px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Hyperparameters</div>
          <div className="flex flex-col gap-3">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11.5px] text-[var(--t2)] font-medium">{s.label}</span>
                  <span className="text-[11.5px] font-bold text-[var(--t1)] font-mono">
                    {s.display ?? `${s.value}${s.unit ? ` ${s.unit}` : ''}`}
                  </span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step ?? 1} value={s.value}
                  onChange={(e) => s.onChange(Number(e.target.value))}
                  className="w-full accent-[var(--a1)] h-1 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* feature checkboxes */}
        <div>
          <div className="text-[10px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Feature engineering</div>
          <div className="flex flex-col gap-2">
            {Object.entries(featureLabels).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={features[key] ?? false}
                  onChange={(e) => onFeaturesChange(key, e.target.checked)}
                  className="accent-[var(--a1)] w-3.5 h-3.5 cursor-pointer" />
                <span className="text-[12px] text-[var(--t2)]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* data split */}
        <div>
          <div className="text-[10px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Data split</div>
          <div className="flex flex-col gap-2">
            {[['Train until','2024-03-31'],['Validate until','2024-06-30']].map(([l, v]) => (
              <div key={l}>
                <label className="text-[11px] font-semibold text-[var(--t2)] mb-1 block">{l}</label>
                <input type="date" defaultValue={v} className="w-full h-8 px-2.5 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none focus:border-[var(--a1)] shadow-[var(--di)] transition-all" />
              </div>
            ))}
            <div className="bg-[var(--s2)] border border-[var(--s3)] rounded-md p-2 shadow-[var(--di)]">
              <div className="text-[10px] text-[var(--t3)] mb-1.5 font-semibold">Split preview</div>
              <div className="flex gap-0.5 h-3 rounded overflow-hidden">
                <div className="bg-[var(--a1)] opacity-70 flex-[9] rounded-l" />
                <div className="bg-[var(--t3)] opacity-40 flex-1 rounded-r" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[var(--t3)]">
                <span>Train <strong className="text-[var(--t2)] font-mono">90%</strong></span>
                <span>Val <strong className="text-[var(--t2)] font-mono">10%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* preprocessing */}
        <div>
          <div className="text-[10px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Preprocessing</div>
          {[['Missing value fill', ['Forward fill','Linear interpolation','Backward fill']],
            ['Outlier treatment', ['IQR cap (1.5×)','Z-score (3σ)','None']]].map(([l, opts]) => (
            <div key={String(l)} className="mb-2">
              <label className="text-[11px] font-semibold text-[var(--t2)] mb-1 block">{l}</label>
              <select className="w-full h-8 px-2.5 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none appearance-none cursor-pointer shadow-[var(--di)]">
                {(opts as string[]).map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* saved scenarios */}
        <div>
          <div className="text-[10px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Saved scenarios</div>
          <div className="flex flex-col gap-1.5">
            {['Baseline (XGB, 13w)', 'Deep features', 'Prophet seasonal', ...scenarios].map((s, i) => (
              <button key={s} onClick={() => onLoadScenario(s)}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-left text-[11.5px] font-medium transition-all',
                  i === 0
                    ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)]'
                    : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)] shadow-[var(--di)]'
                )}
              >{s}</button>
            ))}
          </div>
          <button onClick={onSaveScenario}
            className="w-full mt-2 h-7 border border-dashed border-[var(--s5)] rounded-md text-[11.5px] font-semibold text-[var(--t3)] hover:border-[var(--a4)] hover:text-[var(--a1)] transition-colors">
            + Save current config
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-[var(--s3)]">
        <button onClick={onRun}
          className="w-full h-9 rounded-md bg-[var(--a1)] text-white text-[13px] font-bold hover:bg-[var(--a2)] shadow-[0_2px_8px_rgba(74,111,165,.3)] transition-colors flex items-center justify-center gap-2">
          <Play size={13} /> Run experiment
        </button>
      </div>
    </div>
  )
}

// ─── Insights panel ───────────────────────────────────────────────────────────
function InsightsPanel({ model, result }: { model: string; result?: typeof MOCK_WORKSPACE_RESULTS[string] }) {
  return (
    <div className="w-[300px] flex-shrink-0 bg-[var(--s1)] border-l border-[var(--s4)] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--s3)]">
        <div className="text-[13px] font-bold text-[var(--t1)]">Insights</div>
        <div className="text-[11px] text-[var(--t3)] mt-0.5">Automated analysis</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* data profile */}
        <div className="bg-[var(--s2)] border border-[var(--s3)] rounded-[var(--rl)] p-3 shadow-[var(--di)]">
          <div className="text-[12px] font-bold text-[var(--t1)] mb-2.5">Data profile</div>
          {[['Project','Retail_Demand_Q2'],['SKUs','156'],['Records','48,320'],['Seasonality','Strong (0.74)'],['Intermittency','18.4%']].map(([l, v]) => (
            <div key={l} className="flex justify-between py-1.5 text-[11.5px] border-b border-[var(--s3)] last:border-b-0">
              <span className="text-[var(--t2)]">{l}</span>
              <span className="font-bold text-[var(--t1)] font-mono text-[11px]">{v}</span>
            </div>
          ))}
        </div>

        {/* model suggestion */}
        <div className="bg-[var(--s2)] border border-[var(--s3)] rounded-[var(--rl)] p-3 shadow-[var(--di)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[var(--a3)] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] text-[var(--a1)] font-bold">i</span>
            </div>
            <div className="text-[12px] font-bold text-[var(--t1)]">Recommendation</div>
          </div>
          <p className="text-[11.5px] text-[var(--t2)] leading-relaxed">
            {MODEL_SUGGESTIONS[model] ?? 'Select a model to see recommendations for your data profile.'}
          </p>
        </div>

        {/* tips */}
        <div className="bg-[var(--s2)] border border-[var(--s3)] rounded-[var(--rl)] p-3 shadow-[var(--di)]">
          <div className="text-[12px] font-bold text-[var(--t1)] mb-2.5">Tips</div>
          {[
            { tip: 'Lag features typically reduce MAPE by 15–25% on weekly retail data.', highlight: true },
            { tip: 'Strong seasonality (0.74) — Prophet and ETS capture this well.', highlight: false },
            { tip: '18.4% intermittency: consider Croston for CZ segment SKUs.', highlight: false },
          ].map(({ tip, highlight }) => (
            <div key={tip} className="flex gap-2 mb-2 last:mb-0 text-[11.5px] text-[var(--t2)] leading-relaxed">
              <span className={cn('font-bold flex-shrink-0', highlight ? 'text-[var(--a1)]' : 'text-[var(--t4)]')}>→</span>
              {tip}
            </div>
          ))}
        </div>

        {/* result insights */}
        {result && (
          <div className="bg-[var(--s2)] border border-[var(--s3)] rounded-[var(--rl)] p-3 shadow-[var(--di)]">
            <div className="text-[12px] font-bold text-[var(--t1)] mb-2.5">Result analysis</div>
            {[
              parseFloat(result.mape) < 11 ? { title: 'Excellent accuracy', body: 'This configuration is performing in the top tier for retail demand forecasting.' }
              : parseFloat(result.mape) < 13 ? { title: 'Good accuracy', body: 'Try enabling Fourier terms or adding external features to push below 10%.' }
              : { title: 'Room to improve', body: 'Try XGBoost with all feature flags enabled, or Ensemble for a 1–2% MAPE reduction.' },
              ...(model === 'Ensemble' ? [{ title: 'Ensemble advantage', body: 'Weights: XGB 0.42, Prophet 0.35, RF 0.23. Higher accuracy than any single model.' }] : []),
            ].map(({ title, body }) => (
              <div key={title} className="mb-2 last:mb-0">
                <div className="text-[11.5px] font-bold text-[var(--t1)]">{title}</div>
                <div className="text-[11px] text-[var(--t2)] leading-relaxed mt-0.5">{body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Workspace Page ───────────────────────────────────────────────────────────
export function WorkspacePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [booting, setBooting] = useState(true)

  const [model, setModel] = useState('XGBoost')
  const [horizon, setHorizon] = useState(13)
  const [depth, setDepth] = useState(6)
  const [lr, setLr] = useState(5)
  const [nest, setNest] = useState(200)
  const [features, setFeatures] = useState({ lag: true, rolling: true, calendar: true, external: false, fourier: false })
  const [savedScenarios, setSavedScenarios] = useState<string[]>([])

  const [status, setStatus] = useState<WsStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [logLines, setLogLines] = useState<Array<{ ts: string; level: string; msg: string }>>([])
  const [result, setResult] = useState<typeof MOCK_WORKSPACE_RESULTS[string] | undefined>()
  const [runs, setRuns] = useState<ScenarioRun[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const featCount = Object.values(features).filter(Boolean).length

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logLines])

  function handleRun() {
    setStatus('running')
    setProgress(0)
    setLogLines([])
    const res = MOCK_WORKSPACE_RESULTS[model] ?? MOCK_WORKSPACE_RESULTS['XGBoost']
    const lines = MOCK_LOG_LINES.map((l) => ({
      ...l,
      msg: l.msg.replace('MODEL', model).replace('RESULT_MAPE', res.mape),
    }))

    let lineIdx = 0
    const total = 2400
    const tick = total / 100
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 1, 100)
        if (next >= (lineIdx / lines.length) * 100 && lineIdx < lines.length) {
          const entry = lines[lineIdx]
          if (entry) setLogLines((prev) => [...prev, entry])
          lineIdx++
        }
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setStatus('done')
            setResult(res)
            setRuns((prev) => [
              ...prev,
              { id: ++runCounter, label: `Run ${runCounter}`, model, mape: res.mape, wmape: res.wmape, features: featCount, horizon },
            ])
          }, 300)
        }
        return next
      })
    }, tick)
  }

  function handleReset() {
    setStatus('idle')
    setProgress(0)
    setLogLines([])
    setResult(undefined)
  }

  function handleSaveScenario() {
    const name = `${model} · ${horizon}w · ${featCount}ft`
    setSavedScenarios((p) => [...p, name])
    toast.success('Scenario saved', `Config "${name}" saved.`)
  }

  return (
    <div className="fixed inset-0 z-[600] flex flex-col bg-[var(--s0)] overflow-hidden">
      {booting && <PlaygroundLoader onDone={() => setBooting(false)} />}

      {/* Workspace topbar */}
      <div className="h-[50px] bg-[var(--s1)] border-b border-[var(--s4)] flex items-center px-5 gap-3 flex-shrink-0 shadow-[var(--d1)] z-10">
        <button
          onClick={() => navigate({ to: '/dashboard/projects' as never })}
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--s4)] bg-[var(--s2)] text-[12px] font-semibold text-[var(--t2)] hover:text-[var(--t1)] hover:border-[var(--s5)] transition-all shadow-[var(--d1)]"
        >
          <ArrowLeft size={13} /> Back to global view
        </button>
        <span className="w-px h-5 bg-[var(--s4)]" />

        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px]">
          <span onClick={() => navigate({ to: '/dashboard/projects' as never })} className="text-[var(--t3)] font-medium hover:text-[var(--a1)] transition-colors cursor-pointer">Forecastory</span>
          <span className="text-[var(--t4)] text-[10px]">/</span>
          <span onClick={() => navigate({ to: '/dashboard/projects' as never })} className="text-[var(--t3)] font-medium hover:text-[var(--a1)] transition-colors cursor-pointer">Projects</span>
          <span className="text-[var(--t4)] text-[10px]">/</span>
          <span className="text-[var(--t3)] font-medium">Retail_Demand_Q2</span>
          <span className="text-[var(--t4)] text-[10px]">/</span>
          <span className="text-[var(--t1)] font-bold">Workspace</span>
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[11px] text-[var(--t2)] font-semibold shadow-[var(--di)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--a1)]" />
            Retail_Demand_Q2_2024
          </div>
          <button onClick={handleRun}
            className="h-8 px-4 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold hover:bg-[var(--a2)] transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(74,111,165,.3)]">
            <Play size={12} /> Run experiment
          </button>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT — config */}
        <ConfigPanel
          model={model} onModelChange={setModel}
          horizon={horizon} onHorizonChange={setHorizon}
          depth={depth} onDepthChange={setDepth}
          lr={lr} onLrChange={setLr}
          nest={nest} onNestChange={setNest}
          features={features} onFeaturesChange={(k, v) => setFeatures((p) => ({ ...p, [k]: v }))}
          scenarios={savedScenarios}
          onLoadScenario={(s) => toast.info('Loaded', `Config "${s}" loaded.`)}
          onSaveScenario={handleSaveScenario}
          onRun={handleRun}
        />

        {/* CENTER — results */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--s0)]">

          {/* status bar */}
          <div className="h-[38px] bg-[var(--s1)] border-b border-[var(--s3)] flex items-center px-4 gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-[11.5px] text-[var(--t3)]">
              <span className={cn('w-1.5 h-1.5 rounded-full', status === 'idle' ? 'bg-[var(--s5)]' : status === 'running' ? 'bg-[var(--a1)] animate-pulse' : 'bg-[var(--a1)]')} />
              <span>{status === 'idle' ? 'Ready to run' : status === 'running' ? 'Running…' : `Completed · ${model}`}</span>
            </div>
            <span className="w-px h-4 bg-[var(--s4)]" />
            <span className="text-[11.5px] text-[var(--t3)]">Model: <strong className="text-[var(--t1)]">{model}</strong></span>
            <span className="text-[11.5px] text-[var(--t3)]">Horizon: <strong className="text-[var(--t1)] font-mono">{horizon} wks</strong></span>
            <span className="text-[11.5px] text-[var(--t3)]">Features: <strong className="text-[var(--t1)]">{featCount} active</strong></span>
            <div className="ml-auto flex gap-2">
              <button onClick={handleReset} className="h-6 px-3 rounded-md border border-[var(--s4)] bg-[var(--s1)] text-[11px] font-semibold text-[var(--t3)] hover:text-[var(--t1)] shadow-[var(--d1)] transition-colors flex items-center gap-1">
                <RotateCcw size={10} /> Reset
              </button>
              <button onClick={() => toast.success('Exported', 'Results exported.')} className="h-6 px-3 rounded-md border border-[var(--s4)] bg-[var(--s1)] text-[11px] font-semibold text-[var(--t2)] shadow-[var(--d1)] transition-colors flex items-center gap-1">
                <Download size={10} /> Export
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">

            {/* IDLE */}
            {status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-[var(--rl)] bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-4 shadow-[var(--d1)]">
                  <Play size={22} className="text-[var(--t3)]" />
                </div>
                <div className="text-[15px] font-bold text-[var(--t1)] mb-2">Configure and run</div>
                <p className="text-[12.5px] text-[var(--t2)] max-w-xs leading-relaxed">
                  Select a model, tune hyperparameters on the left, then click <strong>Run experiment</strong>.
                </p>
                <div className="flex gap-2.5 mt-5">
                  {['Baseline (XGB, 13w)', 'Deep features'].map((s) => (
                    <button key={s} onClick={handleRun}
                      className="px-4 py-2 rounded-md border border-[var(--s4)] bg-[var(--s1)] text-[12px] font-semibold text-[var(--t2)] hover:border-[var(--a4)] hover:text-[var(--a1)] shadow-[var(--d1)] transition-all flex items-center gap-1.5">
                      <Play size={11} /> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RUNNING */}
            {status === 'running' && (
              <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[13px] font-bold text-[var(--t1)]">Running experiment…</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--a3)] text-[var(--a1)] border border-[var(--a4)]">{progress}%</span>
                </div>
                <div className="h-1 bg-[var(--s3)] rounded-full overflow-hidden shadow-[var(--di)] mb-3">
                  <div className="h-full bg-[var(--a1)] rounded-full transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div ref={logRef} className="bg-[#0f1520] rounded-md p-3 font-mono text-[10.5px] h-[calc(50vh-160px)] min-h-[200px] overflow-y-auto border border-[#1e2a3a] shadow-[inset_0_2px_8px_rgba(0,0,0,.3)]">
                  {logLines.map((l, i) => (
                    <div key={i} className="leading-[1.9]">
                      <span className="text-[#2a3a52] text-[9.5px]">[{l.ts}] </span>
                      <span className={cn(
                        l.level === 'success' ? 'text-[#5aaa7a]' : l.level === 'running' ? 'text-[#d4a432]' :
                        l.level === 'warning' ? 'text-[#d47a32]' : 'text-[#5a8abf]'
                      )}>{l.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DONE — results */}
            {status === 'done' && result && (
              <>
                {/* metrics */}
                <div className="grid grid-cols-4 gap-2.5">
                  {[['MAPE', result.mape], ['WMAPE', result.wmape], ['Bias', result.bias], ['Duration', result.durationSec > 0 ? `${result.durationSec}s` : '—']].map(([l, v]) => (
                    <div key={l} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-3 text-center shadow-[var(--d1)]">
                      <div className="text-[9.5px] font-bold text-[var(--t3)] uppercase tracking-[.07em]">{l}</div>
                      <div className="text-[22px] font-bold text-[var(--t1)] tracking-tight my-1">{String(v)}</div>
                    </div>
                  ))}
                </div>

                {/* chart placeholder */}
                <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-bold text-[var(--t1)]">Actual vs forecast</div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--a3)] text-[var(--a1)] border border-[var(--a4)]">{model}</span>
                  </div>
                  <div className="bg-[var(--s2)] border border-[var(--s3)] rounded-md h-[180px] flex items-center justify-center shadow-[var(--di)]">
                    <span className="text-[11px] text-[var(--t4)]">Chart renders here · connect Recharts with result data</span>
                  </div>
                </div>

                {/* segment + config */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
                    <div className="text-[13px] font-bold text-[var(--t1)] mb-3">Accuracy by segment</div>
                    {result.segments.map((s) => (
                      <div key={s.label} className="flex justify-between py-1.5 text-[12px] border-b border-[var(--s3)] last:border-b-0">
                        <span className="text-[var(--t2)]">{s.label}</span>
                        <span className="font-bold font-mono text-[var(--t1)]">{s.mape}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
                    <div className="text-[13px] font-bold text-[var(--t1)] mb-3">Config summary</div>
                    {[['Model', model], ['Horizon', `${horizon} wks`], ['Max depth', depth], ['L. rate', (lr / 100).toFixed(2)], ['n_estimators', nest], ['Features', `${featCount} active`]].map(([l, v]) => (
                      <div key={String(l)} className="flex justify-between py-1.5 text-[12px] border-b border-[var(--s3)] last:border-b-0">
                        <span className="text-[var(--t2)]">{l}</span>
                        <span className="font-bold font-mono text-[var(--t1)]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* scenario comparison */}
                <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-bold text-[var(--t1)]">Scenario comparison</div>
                    <button onClick={handleRun} className="h-6 px-2.5 rounded-md border border-[var(--a4)] bg-[var(--a3)] text-[var(--a1)] text-[11px] font-bold hover:opacity-80 transition-opacity">
                      + Add run
                    </button>
                  </div>
                  <table className="w-full text-[12px] border-collapse">
                    <thead><tr>
                      {['Scenario','Model','MAPE','WMAPE','Features','Horizon'].map((h) => (
                        <th key={h} className="text-left text-[10px] font-bold text-[var(--t3)] uppercase tracking-[.07em] pb-2 border-b border-[var(--s4)] px-2.5 first:pl-0">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {runs.map((r, i) => (
                        <tr key={r.id} className={cn('transition-colors', i === runs.length - 1 ? 'bg-[var(--a3)]' : 'hover:bg-[var(--s2)]')}>
                          <td className="py-2 px-2.5 first:pl-0 font-semibold text-[var(--t1)] border-b border-[var(--s3)]">{r.label}</td>
                          <td className="py-2 px-2.5 text-[var(--t2)] border-b border-[var(--s3)]">{r.model}</td>
                          <td className="py-2 px-2.5 font-mono font-bold text-[var(--t1)] border-b border-[var(--s3)]">{r.mape}</td>
                          <td className="py-2 px-2.5 font-mono text-[var(--t2)] border-b border-[var(--s3)]">{r.wmape}</td>
                          <td className="py-2 px-2.5 text-[var(--t2)] border-b border-[var(--s3)]">{r.features} features</td>
                          <td className="py-2 px-2.5 font-mono text-[var(--t2)] border-b border-[var(--s3)]">{r.horizon}w</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — insights */}
        <InsightsPanel model={model} result={result} />
      </div>

      <ToastContainer />
    </div>
  )
}
