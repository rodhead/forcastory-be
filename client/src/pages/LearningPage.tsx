// src/pages/LearningPage.tsx
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  BookOpen, Zap, BarChart2, Brain, TrendingUp, AlertCircle, ChevronDown,
  Star, CheckCircle, Search, X, SlidersHorizontal, Play, ExternalLink,
  Clock, Award,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { DashboardLayout } from '@/features/layout/components/DashboardLayout'

// ─── Data ────────────────────────────────────────────────────────────────────
const MODEL_CATEGORIES = ['All', 'Statistical', 'ML / Gradient Boosting', 'Deep Learning', 'Bayesian'] as const

const MODELS = [
  {
    name: 'XGBoost', category: 'ML / Gradient Boosting', tag: 'Most popular',
    desc: 'Gradient boosted decision trees. Excellent for structured tabular data with exogenous features. Fast, interpretable feature importance.',
    pros: ['Handles missing values', 'Feature importance out-of-box', 'Fast training'],
    cons: ['Needs feature engineering', 'Can overfit on small data'],
    useCase: 'Retail demand with promotions, pricing, holidays',
    mapeRange: '8–14%', color: '#3b82f6', difficulty: 'Medium',
  },
  {
    name: 'LightGBM', category: 'ML / Gradient Boosting', tag: 'Speed',
    desc: 'Leaf-wise gradient boosting. Faster than XGBoost on large datasets with similar or better accuracy.',
    pros: ['Faster than XGBoost', 'Lower memory usage', 'Handles categorical features'],
    cons: ['Can overfit easily', 'Less intuitive tuning'],
    useCase: 'High-volume SKUs, large combination spaces',
    mapeRange: '8–13%', color: '#3b82f6', difficulty: 'Medium',
  },
  {
    name: 'Prophet', category: 'Bayesian', tag: 'Seasonal',
    desc: 'Additive model by Meta for time series with strong seasonal patterns and holiday effects. Handles missing data gracefully.',
    pros: ['Automatic seasonality', 'Holiday effects built-in', 'Trend changepoints'],
    cons: ['Slower on many series', 'Less accurate on irregular data'],
    useCase: 'Retail with known holidays, e-commerce, weekly patterns',
    mapeRange: '10–18%', color: '#8b5cf6', difficulty: 'Low',
  },
  {
    name: 'ARIMA / SARIMA', category: 'Statistical', tag: 'Classic',
    desc: 'Auto-Regressive Integrated Moving Average. Gold standard for univariate stationary time series. SARIMA adds seasonal terms.',
    pros: ['Well understood', 'Interpretable coefficients', 'No features needed'],
    cons: ['Univariate only', 'Requires stationarity', 'Manual order selection'],
    useCase: 'Clean, regular series; baselines; low-volume SKUs',
    mapeRange: '12–22%', color: '#10b981', difficulty: 'High',
  },
  {
    name: 'ETS', category: 'Statistical', tag: 'Smoothing',
    desc: 'Error-Trend-Seasonality exponential smoothing. State-space framework that automatically selects the best smoothing model.',
    pros: ['Auto model selection', 'Fast', 'Good for stable series'],
    cons: ['Only captures linear trend', 'No exogenous features'],
    useCase: 'Stable demand, FMCG categories with smooth patterns',
    mapeRange: '11–20%', color: '#10b981', difficulty: 'Low',
  },
  {
    name: 'Theta', category: 'Statistical', tag: 'Method',
    desc: 'Decomposition-based method that won M3 competition. Decomposes series into two theta lines and combines forecasts.',
    pros: ['Very accurate on M-competitions', 'Robust', 'Simple'],
    cons: ['Limited configurability', 'Not multivariate'],
    useCase: 'General purpose, especially when data is limited',
    mapeRange: '10–18%', color: '#10b981', difficulty: 'Low',
  },
  {
    name: 'LSTM', category: 'Deep Learning', tag: 'RNN',
    desc: 'Long Short-Term Memory networks. Captures long-range temporal dependencies. Best when you have many series and a large training set.',
    pros: ['Learns complex patterns', 'Multi-step ahead', 'Handles multivariate'],
    cons: ['Slow to train', 'Needs large data', 'Hyperparameter-sensitive'],
    useCase: 'QSR production, high-frequency IoT, large retail chains',
    mapeRange: '9–16%', color: '#ec4899', difficulty: 'High',
  },
  {
    name: 'N-BEATS', category: 'Deep Learning', tag: 'Neural',
    desc: 'Neural Basis Expansion Analysis for Time Series. Pure DL model that won M4 without any hand-crafted features.',
    pros: ['State-of-art accuracy', 'No feature engineering', 'Interpretable blocks'],
    cons: ['Computationally heavy', 'Large training set needed'],
    useCase: 'Large global models across many SKUs simultaneously',
    mapeRange: '8–14%', color: '#ec4899', difficulty: 'High',
  },
  {
    name: 'Croston', category: 'Statistical', tag: 'Intermittent',
    desc: 'Specifically designed for intermittent (lumpy) demand. Separately forecasts demand size and inter-demand intervals.',
    pros: ['Best for sparse data', 'No zero-inflation issue', 'Simple'],
    cons: ['Only intermittent demand', 'No seasonal component'],
    useCase: 'CZ SKUs, spare parts, low-movement SKUs',
    mapeRange: '20–40%', color: '#f59e0b', difficulty: 'Low',
  },
]

const METRICS = [
  {
    name: 'MAPE', full: 'Mean Absolute Percentage Error',
    formula: '(1/n) × Σ |actual − forecast| / actual × 100',
    desc: 'Most widely used metric. Expresses error as a percentage of actual values. Undefined when actual = 0.',
    good: '< 10%', ok: '10–20%', bad: '> 20%',
    color: '#3b82f6',
    caveat: 'Penalises under-forecasting more than over-forecasting. Avoid for intermittent/zero-demand SKUs.',
  },
  {
    name: 'wMAPE', full: 'Weighted Mean Absolute Percentage Error',
    formula: 'Σ |actual − forecast| / Σ actual × 100',
    desc: 'Volume-weighted version of MAPE. Gives more importance to high-volume SKUs. Preferred over MAPE for business decisions.',
    good: '< 9%', ok: '9–18%', bad: '> 18%',
    color: '#8b5cf6',
    caveat: 'High-volume items can dominate the score — always check segment-level accuracy too.',
  },
  {
    name: 'MAE', full: 'Mean Absolute Error',
    formula: '(1/n) × Σ |actual − forecast|',
    desc: 'Absolute units error. Easy to interpret in business terms (e.g. average error of 42 units per week). Scale-dependent.',
    good: 'Depends on scale', ok: '—', bad: '—',
    color: '#10b981',
    caveat: 'Use for single-series evaluation or when absolute unit error matters more than percentage.',
  },
  {
    name: 'RMSE', full: 'Root Mean Squared Error',
    formula: '√[(1/n) × Σ (actual − forecast)²]',
    desc: 'Penalises large errors quadratically. More sensitive to outliers than MAE. Useful when large errors are disproportionately costly.',
    good: 'Depends on scale', ok: '—', bad: '—',
    color: '#f59e0b',
    caveat: 'Can be dominated by a few large errors. Use alongside MAE to detect outlier influence.',
  },
  {
    name: 'Bias', full: 'Mean Forecast Bias',
    formula: '(1/n) × Σ (forecast − actual)',
    desc: 'Positive = over-forecasting, Negative = under-forecasting. Target is 0. Systematic bias indicates a model calibration issue.',
    good: '± 2%', ok: '± 2–5%', bad: '> ± 5%',
    color: '#ec4899',
    caveat: 'A low MAPE with high bias is dangerous — the model is systematically wrong in one direction.',
  },
]

const ABC_XYZ = [
  { class: 'AX', desc: 'High volume, low variability',   action: 'Standard ML models. High ROI focus.',        color: '#16a34a' },
  { class: 'AY', desc: 'High volume, medium variability', action: 'ML with feature engineering for seasonality.', color: '#65a30d' },
  { class: 'AZ', desc: 'High volume, high variability',   action: 'Ensemble models. Safety stock rules.',         color: '#ca8a04' },
  { class: 'BX', desc: 'Medium volume, low variability',  action: 'ETS or ARIMA. Rule-based approach possible.',  color: '#2563eb' },
  { class: 'BY', desc: 'Medium volume, medium variability', action: 'Prophet or XGBoost.',                        color: '#7c3aed' },
  { class: 'BZ', desc: 'Medium volume, high variability',  action: 'Ensemble + safety stock.',                    color: '#db2777' },
  { class: 'CX', desc: 'Low volume, low variability',     action: 'Simple smoothing (ETS/Theta).',               color: '#9ca3af' },
  { class: 'CY', desc: 'Low volume, medium variability',  action: 'ETS with safety stock.',                      color: '#9ca3af' },
  { class: 'CZ', desc: 'Low volume, high variability',    action: 'Croston method. Focus on availability.',      color: '#dc2626' },
]

const GLOSSARY = [
  { term: 'Seasonality',          def: 'Repeating patterns at fixed intervals (weekly, monthly, yearly). E.g. higher ice cream sales every summer.' },
  { term: 'Trend',                def: 'Long-term upward or downward movement in demand, independent of seasonal effects.' },
  { term: 'Intermittency',        def: 'Demand that occurs sporadically with many zero-demand periods. Measured by ADI (Average Demand Interval).' },
  { term: 'Lumpy demand',         def: 'Demand that is both intermittent and highly variable in size when it does occur. CZ category in ABC-XYZ.' },
  { term: 'Forecast horizon',     def: 'How many periods into the future you forecast. Should be ≥ your replenishment lead time to be actionable.' },
  { term: 'Lead time',            def: 'The time between placing a replenishment order and receiving goods. Directly constrains the minimum useful horizon.' },
  { term: 'Train / Test split',   def: 'Train on historical data up to a cutoff date; evaluate on the "holdout" period that follows.' },
  { term: 'Overfit',              def: 'Model memorises training data patterns (including noise) but fails to generalise to new data.' },
  { term: 'Feature engineering',  def: 'Creating new input variables (lag values, rolling means, price-promotion flags) to improve model accuracy.' },
  { term: 'Ensemble',             def: 'Combining predictions from multiple models (average, weighted, stacked) to reduce variance and improve robustness.' },
]

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     'text-[var(--ok)] bg-[var(--ok-t)]',
  Intermediate: 'text-[var(--wa)] bg-[var(--wa-t)]',
  Advanced:     'text-[var(--er)] bg-[var(--er-t)]',
}

const VIDEOS = [
  {
    id: 'v1',
    title: 'Time Series Forecasting with Python – Full Course',
    instructor: 'freeCodeCamp.org',
    platform: 'YouTube',
    duration: '2h 14m',
    level: 'Beginner',
    thumbnail: 'https://img.youtube.com/vi/KgmNg2d8XDk/hqdefault.jpg',
    url: 'https://youtu.be/KgmNg2d8XDk?si=PyJpcvfSlcIqeI0r',
    desc: 'Comprehensive introduction to time series forecasting using Python. Covers ARIMA, ETS, Prophet, and neural approaches with hands-on examples.',
    tags: ['Python', 'ARIMA', 'Prophet', 'ETS'],
  },
  {
    id: 'v2',
    title: 'XGBoost & LightGBM for Demand Forecasting',
    instructor: 'Analytics Vidhya',
    platform: 'YouTube',
    duration: '52m',
    level: 'Intermediate',
    thumbnail: 'https://img.youtube.com/vi/KgmNg2d8XDk/hqdefault.jpg',
    url: 'https://youtu.be/KgmNg2d8XDk?si=PyJpcvfSlcIqeI0r',
    desc: 'Deep dive into gradient boosting models for demand forecasting — feature engineering, lag variables, holiday effects, and hyperparameter tuning.',
    tags: ['XGBoost', 'LightGBM', 'Feature Engineering'],
  },
  {
    id: 'v3',
    title: 'Forecast Accuracy Metrics Explained – MAPE, wMAPE, RMSE',
    instructor: 'Supply Chain Wizards',
    platform: 'YouTube',
    duration: '28m',
    level: 'Beginner',
    thumbnail: 'https://img.youtube.com/vi/KgmNg2d8XDk/hqdefault.jpg',
    url: 'https://youtu.be/KgmNg2d8XDk?si=PyJpcvfSlcIqeI0r',
    desc: 'Clear explanation of common forecast error metrics and when to use each one for supply chain applications.',
    tags: ['MAPE', 'wMAPE', 'RMSE', 'Metrics'],
  },
  {
    id: 'v4',
    title: 'ABC-XYZ Segmentation for Smarter Inventory Planning',
    instructor: 'SCM Insights',
    platform: 'YouTube',
    duration: '35m',
    level: 'Intermediate',
    thumbnail: 'https://img.youtube.com/vi/KgmNg2d8XDk/hqdefault.jpg',
    url: 'https://youtu.be/KgmNg2d8XDk?si=PyJpcvfSlcIqeI0r',
    desc: 'Practical guide to implementing ABC-XYZ segmentation to prioritise forecasting efforts and set the right safety stock strategy.',
    tags: ['ABC-XYZ', 'Inventory', 'Segmentation'],
  },
  {
    id: 'v5',
    title: 'LSTM Neural Networks for Multi-Step Time Series Prediction',
    instructor: 'Deep Learning AI',
    platform: 'YouTube',
    duration: '1h 12m',
    level: 'Advanced',
    thumbnail: 'https://img.youtube.com/vi/KgmNg2d8XDk/hqdefault.jpg',
    url: 'https://youtu.be/KgmNg2d8XDk?si=PyJpcvfSlcIqeI0r',
    desc: 'Build LSTM networks from scratch for multi-step time series forecasting. Hands-on code, architecture selection, and optimisation tips.',
    tags: ['LSTM', 'Deep Learning', 'Python'],
  },
  {
    id: 'v6',
    title: 'N-BEATS: Neural Basis Expansion for Forecasting',
    instructor: 'ML Research Hub',
    platform: 'YouTube',
    duration: '44m',
    level: 'Advanced',
    thumbnail: 'https://img.youtube.com/vi/KgmNg2d8XDk/hqdefault.jpg',
    url: 'https://youtu.be/KgmNg2d8XDk?si=PyJpcvfSlcIqeI0r',
    desc: 'Paper walkthrough and implementation of N-BEATS — the model that won M4 competition without hand-crafted features.',
    tags: ['N-BEATS', 'Deep Learning', 'Research'],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[var(--a3)] border border-[var(--a4)] flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[var(--a1)]" />
      </div>
      <div>
        <h2 className="text-[16px] font-bold text-[var(--t1)] tracking-tight">{title}</h2>
        {subtitle && <p className="text-[12px] text-[var(--t3)] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border" style={{ background: `${color}15`, color, borderColor: `${color}35` }}>
      {label}
    </span>
  )
}

function ModelCard({ model }: { model: typeof MODELS[0] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={cn('bg-[var(--s1)] border rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)] transition-all', expanded ? 'border-[var(--a4)]' : 'border-[var(--s4)]')}>
      <div className="px-4 py-3.5 flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${model.color}18`, border: `1px solid ${model.color}30` }}>
          <Brain size={14} style={{ color: model.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-[var(--t1)]">{model.name}</span>
            <Chip label={model.tag} color={model.color} />
            <Chip label={model.category} color="#6b7280" />
          </div>
          <p className="text-[11.5px] text-[var(--t2)] mt-0.5 leading-relaxed">{model.desc}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-[11px] font-bold text-[var(--a1)]">{model.mapeRange} MAPE</div>
          <div className="text-[9.5px] text-[var(--t4)] capitalize">Difficulty: {model.difficulty}</div>
          <ChevronDown size={12} className={cn('text-[var(--t4)] transition-transform mt-1', expanded && 'rotate-180')} />
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-3 border-t border-[var(--s3)]" style={{ paddingTop: '12px' }}>
          <div>
            <div className="text-[10px] font-bold text-[var(--ok)] uppercase tracking-wider mb-1.5">Pros</div>
            {model.pros.map(p => (
              <div key={p} className="flex items-start gap-1.5 mb-1">
                <CheckCircle size={10} className="text-[var(--ok)] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-[var(--t2)]">{p}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-bold text-[var(--er)] uppercase tracking-wider mb-1.5">Cons</div>
            {model.cons.map(c => (
              <div key={c} className="flex items-start gap-1.5 mb-1">
                <AlertCircle size={10} className="text-[var(--er)] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-[var(--t2)]">{c}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-bold text-[var(--in)] uppercase tracking-wider mb-1.5">Best for</div>
            <p className="text-[11px] text-[var(--t2)] leading-relaxed">{model.useCase}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function VideoCard({ video }: { video: typeof VIDEOS[0] }) {
  return (
    <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)] hover:border-[var(--a4)] transition-all group">
      {/* thumbnail */}
      <div className="relative aspect-video bg-[var(--s3)] overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={18} className="text-black ml-0.5" fill="black" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <Clock size={9} />
          {video.duration}
        </div>
        <div className={cn('absolute top-2 left-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full', LEVEL_COLOR[video.level])}>
          {video.level}
        </div>
      </div>

      {/* info */}
      <div className="p-3.5">
        <div className="text-[12.5px] font-bold text-[var(--t1)] leading-snug mb-1.5 line-clamp-2">{video.title}</div>
        <p className="text-[11px] text-[var(--t3)] leading-relaxed mb-3 line-clamp-2">{video.desc}</p>

        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-semibold text-[var(--t2)]">{video.instructor}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {video.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[var(--s3)] text-[var(--t3)]">{tag}</span>
              ))}
            </div>
          </div>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[var(--er)] text-white text-[11px] font-bold hover:opacity-90 transition-opacity flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <Play size={10} fill="white" />
            Watch
            <ExternalLink size={9} className="opacity-70" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Advanced search panel ────────────────────────────────────────────────────
const SEARCH_SECTIONS = [
  { id: 'models',   label: 'Models'      },
  { id: 'metrics',  label: 'Metrics'     },
  { id: 'abcxyz',   label: 'ABC-XYZ'    },
  { id: 'glossary', label: 'Glossary'   },
  { id: 'videos',   label: 'Videos'     },
] as const
type SectionId = typeof SEARCH_SECTIONS[number]['id']

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'models',   label: 'Model library',   icon: Brain      },
  { id: 'metrics',  label: 'Accuracy metrics', icon: BarChart2  },
  { id: 'abcxyz',   label: 'ABC-XYZ guide',    icon: TrendingUp },
  { id: 'glossary', label: 'Glossary',         icon: BookOpen   },
  { id: 'videos',   label: 'Video learning',   icon: Play       },
] as const
type TabId = typeof TABS[number]['id']

// ─── LearningPage ─────────────────────────────────────────────────────────────
export function LearningPage() {
  const [tab,           setTab]           = useState<TabId>('models')
  const [modelCategory, setModelCategory] = useState<string>('All')
  const [videoLevel,    setVideoLevel]    = useState<string>('All')

  // Search
  const [query,          setQuery]          = useState('')
  const [showAdvanced,   setShowAdvanced]   = useState(false)
  const [activeSections, setActiveSections] = useState<Set<SectionId>>(new Set(SEARCH_SECTIONS.map(s => s.id)))
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showAdvanced) return
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowAdvanced(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAdvanced])

  function toggleSection(id: SectionId) {
    setActiveSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) { if (next.size > 1) next.delete(id) }
      else next.add(id)
      return next
    })
  }

  // Global search results
  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return null
    const q = query.toLowerCase()

    const results: { type: SectionId; label: string; sub: string; onClick: () => void }[] = []

    if (activeSections.has('models'))
      MODELS.filter(m =>
        [m.name, m.category, m.desc, m.tag, ...m.pros, ...m.cons, m.useCase].some(s => s.toLowerCase().includes(q))
      ).forEach(m => results.push({ type: 'models', label: m.name, sub: m.category + ' · ' + m.desc.slice(0, 80) + '…', onClick: () => setTab('models') }))

    if (activeSections.has('metrics'))
      METRICS.filter(m =>
        [m.name, m.full, m.desc, m.caveat].some(s => s.toLowerCase().includes(q))
      ).forEach(m => results.push({ type: 'metrics', label: m.name, sub: m.full + ' — ' + m.desc.slice(0, 70) + '…', onClick: () => setTab('metrics') }))

    if (activeSections.has('abcxyz'))
      ABC_XYZ.filter(r =>
        [r.class, r.desc, r.action].some(s => s.toLowerCase().includes(q))
      ).forEach(r => results.push({ type: 'abcxyz', label: r.class, sub: r.desc + ' · ' + r.action, onClick: () => setTab('abcxyz') }))

    if (activeSections.has('glossary'))
      GLOSSARY.filter(g =>
        [g.term, g.def].some(s => s.toLowerCase().includes(q))
      ).forEach(g => results.push({ type: 'glossary', label: g.term, sub: g.def.slice(0, 100) + '…', onClick: () => setTab('glossary') }))

    if (activeSections.has('videos'))
      VIDEOS.filter(v =>
        [v.title, v.instructor, v.desc, ...v.tags].some(s => s.toLowerCase().includes(q))
      ).forEach(v => results.push({ type: 'videos', label: v.title, sub: v.instructor + ' · ' + v.duration + ' · ' + v.level, onClick: () => setTab('videos') }))

    return results
  }, [query, activeSections])

  const TYPE_LABEL: Record<SectionId, string> = {
    models: 'Model', metrics: 'Metric', abcxyz: 'ABC-XYZ', glossary: 'Term', videos: 'Video',
  }
  const TYPE_COLOR: Record<SectionId, string> = {
    models: 'text-[var(--in)] bg-[var(--in-t)]',
    metrics: 'text-[var(--a1)] bg-[var(--a3)]',
    abcxyz: 'text-[var(--ok)] bg-[var(--ok-t)]',
    glossary: 'text-[var(--t3)] bg-[var(--s3)]',
    videos: 'text-[var(--er)] bg-[var(--er-t)]',
  }

  const visibleModels = modelCategory === 'All' ? MODELS : MODELS.filter(m => m.category === modelCategory)
  const visibleVideos = videoLevel === 'All' ? VIDEOS : VIDEOS.filter(v => v.level === videoLevel)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Learning centre</h1>
            <p className="text-[12px] text-[var(--t2)] mt-0.5">Forecasting models · accuracy metrics · best practices · video courses</p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[var(--a3)] border border-[var(--a4)] rounded-xl text-[11.5px] font-semibold text-[var(--a1)] flex-shrink-0">
            <Star size={13} />
            {MODELS.length} models · {METRICS.length} metrics · {VIDEOS.length} videos
          </div>
        </div>

        {/* Search bar */}
        <div ref={searchRef} className="relative mt-4">
          <div className={cn(
            'flex items-center gap-2 h-9 px-3 rounded-xl border bg-[var(--s1)] shadow-[var(--d1)] transition-all',
            query.length > 0 ? 'border-[var(--a4)]' : 'border-[var(--s4)]'
          )}>
            <Search size={14} className="text-[var(--t4)] flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-[12.5px] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none"
              placeholder="Search models, metrics, glossary, videos…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-1">
              {query.length > 0 && (
                <button onClick={() => setQuery('')} className="w-5 h-5 rounded flex items-center justify-center text-[var(--t4)] hover:text-[var(--t2)] hover:bg-[var(--s3)] transition-colors">
                  <X size={11} />
                </button>
              )}
              <button
                onClick={() => setShowAdvanced(p => !p)}
                className={cn(
                  'flex items-center gap-1 h-6 px-2 rounded-lg text-[11px] font-semibold border transition-all',
                  showAdvanced
                    ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)]'
                    : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t3)] hover:text-[var(--t1)]'
                )}
              >
                <SlidersHorizontal size={10} />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced filter panel */}
          {showAdvanced && (
            <div className="absolute top-[calc(100%+6px)] left-0 z-30 w-[340px] bg-[var(--s1)] border border-[var(--s4)] rounded-xl shadow-[var(--d4)] p-3.5">
              <div className="text-[10px] font-bold text-[var(--t4)] uppercase tracking-wider mb-2.5">Search in sections</div>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSection(s.id)}
                    className={cn(
                      'h-6 px-3 rounded-full text-[10.5px] font-semibold border transition-all',
                      activeSections.has(s.id)
                        ? 'bg-[var(--a1)] border-[var(--a1)] text-black'
                        : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t3)]'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-[var(--s3)] flex items-center justify-between">
                <span className="text-[10.5px] text-[var(--t4)]">{activeSections.size} of {SEARCH_SECTIONS.length} active</span>
                <button
                  onClick={() => setActiveSections(new Set(SEARCH_SECTIONS.map(s => s.id)))}
                  className="text-[10.5px] text-[var(--a1)] hover:underline font-semibold"
                >
                  Reset all
                </button>
              </div>
            </div>
          )}

          {/* Search results dropdown */}
          {searchResults !== null && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-20 bg-[var(--s1)] border border-[var(--s4)] rounded-xl shadow-[var(--d4)] overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-4 py-5 text-center text-[12px] text-[var(--t4)]">
                  No results for <strong className="text-[var(--t2)]">"{query}"</strong>
                </div>
              ) : (
                <>
                  <div className="px-3.5 py-2 border-b border-[var(--s3)] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--t4)] uppercase tracking-wider">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => setQuery('')} className="text-[10.5px] text-[var(--t4)] hover:text-[var(--t2)]"><X size={11} /></button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { r.onClick(); setQuery('') }}
                        className="w-full flex items-start gap-3 px-3.5 py-2.5 hover:bg-[var(--s2)] transition-colors border-b border-[var(--s3)] last:border-b-0 text-left"
                      >
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 flex-shrink-0', TYPE_COLOR[r.type])}>
                          {TYPE_LABEL[r.type]}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-[var(--t1)] truncate">{r.label}</div>
                          <div className="text-[10.5px] text-[var(--t3)] truncate">{r.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-1 w-fit shadow-[var(--d1)]">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setQuery('') }}
              className={cn(
                'flex items-center gap-1.5 h-7 px-3.5 rounded-md text-[12px] font-semibold transition-all',
                tab === t.id ? 'bg-[var(--a1)] text-black shadow-[var(--d1)]' : 'text-[var(--t2)] hover:bg-[var(--s2)]'
              )}
            >
              <Icon size={12} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Model library ── */}
      {tab === 'models' && (
        <div>
          <SectionHeader icon={Brain} title="Model library" subtitle="Click any model to expand details, pros/cons and recommended use cases." />
          <div className="flex flex-wrap gap-2 mb-4">
            {MODEL_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setModelCategory(c)}
                className={cn('h-6 px-3 rounded-full text-[10.5px] font-semibold border transition-all',
                  modelCategory === c ? 'bg-[var(--a1)] border-[var(--a1)] text-black' : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)]'
                )}
              >{c}</button>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {visibleModels.map(m => <ModelCard key={m.name} model={m} />)}
          </div>
        </div>
      )}

      {/* ── Accuracy metrics ── */}
      {tab === 'metrics' && (
        <div>
          <SectionHeader icon={BarChart2} title="Accuracy metrics" subtitle="Understanding how to measure and interpret your forecast quality." />
          <div className="grid grid-cols-1 gap-4">
            {METRICS.map(m => (
              <div key={m.name} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--s3)]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-black" style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
                    {m.name.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[var(--t1)]">{m.name}</span>
                      <span className="text-[10.5px] text-[var(--t3)]">{m.full}</span>
                    </div>
                    <code className="text-[11px] font-mono text-[var(--a1)] bg-[var(--a3)] px-2 py-0.5 rounded mt-1 inline-block">{m.formula}</code>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-6 px-5 py-4">
                  <div>
                    <p className="text-[12px] text-[var(--t2)] leading-relaxed mb-3">{m.desc}</p>
                    <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-[var(--wa-t)] border border-[var(--wa-b)]">
                      <AlertCircle size={11} className="text-[var(--wa)] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[var(--t2)]">{m.caveat}</p>
                    </div>
                  </div>
                  {m.good !== 'Depends on scale' && (
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="text-[9.5px] font-bold text-[var(--t4)] uppercase tracking-wider mb-0.5">Benchmarks</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--ok)] flex-shrink-0" />
                        <span className="text-[11px] text-[var(--t2)]">Excellent: <strong>{m.good}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--wa)] flex-shrink-0" />
                        <span className="text-[11px] text-[var(--t2)]">Acceptable: <strong>{m.ok}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--er)] flex-shrink-0" />
                        <span className="text-[11px] text-[var(--t2)]">Needs work: <strong>{m.bad}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABC-XYZ guide ── */}
      {tab === 'abcxyz' && (
        <div>
          <SectionHeader icon={TrendingUp} title="ABC-XYZ segmentation" subtitle="A framework to classify SKUs by volume (ABC) and demand variability (XYZ) to choose the right strategy." />
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
              <div className="text-[11px] font-bold text-[var(--t2)] uppercase tracking-wider mb-3">ABC — Volume classification</div>
              {[['A', 'Top 70% of revenue / volume', '#16a34a'], ['B', 'Next 20% of revenue / volume', '#2563eb'], ['C', 'Bottom 10% of revenue / volume', '#9ca3af']].map(([l, d, c]) => (
                <div key={l} className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black text-white flex-shrink-0" style={{ background: c as string }}>{l}</div>
                  <span className="text-[12px] text-[var(--t2)]">{d}</span>
                </div>
              ))}
            </div>
            <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]">
              <div className="text-[11px] font-bold text-[var(--t2)] uppercase tracking-wider mb-3">XYZ — Variability (CoV)</div>
              {[['X', 'CoV < 0.5 · Low variability, predictable', '#16a34a'], ['Y', 'CoV 0.5–1.0 · Medium variability', '#ca8a04'], ['Z', 'CoV > 1.0 · High variability, intermittent', '#dc2626']].map(([l, d, c]) => (
                <div key={l} className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black text-white flex-shrink-0" style={{ background: c as string }}>{l}</div>
                  <span className="text-[12px] text-[var(--t2)]">{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {ABC_XYZ.map(row => (
              <div key={row.class} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-3.5 shadow-[var(--d1)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black text-white flex-shrink-0" style={{ background: row.color }}>
                    {row.class}
                  </div>
                  <span className="text-[11.5px] font-bold text-[var(--t1)]">{row.desc}</span>
                </div>
                <p className="text-[11px] text-[var(--t3)] leading-relaxed">{row.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Glossary ── */}
      {tab === 'glossary' && (
        <div>
          <SectionHeader icon={BookOpen} title="Forecasting glossary" subtitle={`${GLOSSARY.length} key terms explained in plain language.`} />
          <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
            {GLOSSARY.map((item, i) => (
              <div key={item.term} className={cn('grid grid-cols-[200px_1fr] gap-4 px-5 py-3.5', i < GLOSSARY.length - 1 && 'border-b border-[var(--s3)]')}>
                <div className="flex items-start gap-2 pt-0.5">
                  <Zap size={11} className="text-[var(--a1)] flex-shrink-0 mt-0.5" />
                  <span className="text-[12.5px] font-bold text-[var(--t1)]">{item.term}</span>
                </div>
                <p className="text-[12px] text-[var(--t2)] leading-relaxed">{item.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Video learning ── */}
      {tab === 'videos' && (
        <div>
          <SectionHeader icon={Play} title="Video learning" subtitle="Curated video courses and walkthroughs on forecasting, models, and supply chain analytics." />

          {/* level filter + count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
                <button
                  key={l}
                  onClick={() => setVideoLevel(l)}
                  className={cn('h-6 px-3 rounded-full text-[10.5px] font-semibold border transition-all',
                    videoLevel === l ? 'bg-[var(--a1)] border-[var(--a1)] text-black' : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)]'
                  )}
                >{l}</button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--t3)]">
              <Award size={12} className="text-[var(--a1)]" />
              {visibleVideos.length} video{visibleVideos.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {visibleVideos.map(v => <VideoCard key={v.id} video={v} />)}
          </div>

          {visibleVideos.length === 0 && (
            <div className="py-12 text-center text-[12px] text-[var(--t3)]">No videos match the selected level.</div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
