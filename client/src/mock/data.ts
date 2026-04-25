// src/mock/data.ts
// Single source of all mock data.
// Import from here in query files when ENV.useMock === true.

import type { Project, User, Experiment, ProjectFile, SupportTicket, TicketDetail } from '@/types/common'

// ─── USERS ────────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Ganit', email: 'harish.kumar@hksinc.com', role: 'admin',   organisation: 'HKS Inc.', initials: 'G'  },
  { id: 'u2', name: 'Priya S.', email: 'priya.s@hksinc.com',  role: 'analyst', organisation: 'HKS Inc.', initials: 'PS' },
  { id: 'u3', name: 'Rahul M.', email: 'rahul.m@hksinc.com',  role: 'viewer',  organisation: 'HKS Inc.', initials: 'RM' },
  { id: 'u4', name: 'Neha K.',  email: 'neha.k@hksinc.com',   role: 'manager', organisation: 'HKS Inc.', initials: 'NK' },
]

export const MOCK_CURRENT_USER = MOCK_USERS[0]

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Retail_Demand_Q2_2024',
    description: 'Demand planning for retail stores across North India',
    industry: 'Retail',
    purpose: 'Demand Planning',
    granularity: 'weekly',
    recordCount: 48320,
    combinations: 156,
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-18T14:22:00Z',
    createdBy: 'Ganit',
  },
  {
    id: 'p2',
    name: 'CPG_Inventory_Planning',
    description: 'Monthly inventory replenishment for CPG manufacturer',
    industry: 'CPG',
    purpose: 'Inventory Planning',
    granularity: 'monthly',
    recordCount: 23808,
    combinations: 84,
    status: 'idle',
    createdAt: '2024-02-14T09:00:00Z',
    updatedAt: '2024-06-10T11:00:00Z',
    createdBy: 'Priya S.',
  },
  {
    id: 'p3',
    name: 'QSR_Production_Planning',
    description: 'Daily production forecasting for quick service chain',
    industry: 'QSR',
    purpose: 'Production Planning',
    granularity: 'daily',
    recordCount: 91440,
    combinations: 312,
    status: 'idle',
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
    createdBy: 'Neha K.',
  },
]

// ─── QUALITY ──────────────────────────────────────────────────────────────────
export const MOCK_QUALITY = {
  p1: {
    overall: 78.4, completeness: 91, consistency: 72,
    variability: 81, intermittency: 68, outlierScore: 57,
    issueCount: 4,
    issues: [
      { type: 'error',   text: '2,041 missing values in target column. Recommend forward-fill.' },
      { type: 'warning', text: '38 duplicate records detected. Will be removed.' },
      { type: 'warning', text: 'Time series gaps in 7 SKUs. Longest: 3 consecutive weeks.' },
      { type: 'info',    text: '14 potential outliers via IQR method. Review before forecasting.' },
    ],
    abcXyz: {
      AX:34, AY:18, AZ:9,
      BX:22, BY:31, BZ:14,
      CX:8,  CY:11, CZ:9,
    },
    summary: {
      dateRange: 'Jan 2022 – Jun 2024',
      granularity: 'Weekly',
      totalRecords: 48320,
      combinations: 156,
      avgPointsPerSKU: 309.7,
      intermittencyPct: 18.4,
    },
  },
}

// ─── EXPERIMENTS ──────────────────────────────────────────────────────────────
export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: 'e4', projectId: 'p1', name: 'Exp_004_Multi_Model',
    models: ['XGBoost', 'Prophet', 'Random Forest'],
    status: 'running', trainUntil: '2024-03-31', validateUntil: '2024-06-30',
    createdAt: '2024-06-19T08:00:00Z',
  },
  {
    id: 'e2', projectId: 'p1', name: 'Exp_002_With_Features',
    models: ['XGBoost', 'Prophet'],
    status: 'done', bestMape: 10.4, bestWmape: 8.9,
    durationMs: 272000,
    trainUntil: '2024-03-31', validateUntil: '2024-06-30',
    createdAt: '2024-06-18T09:00:00Z',
  },
  {
    id: 'e3', projectId: 'p1', name: 'Exp_003_Ensemble',
    models: ['XGBoost', 'Random Forest', 'ETS'],
    status: 'done', bestMape: 11.8, bestWmape: 10.1,
    durationMs: 378000,
    trainUntil: '2024-03-31', validateUntil: '2024-06-30',
    createdAt: '2024-06-16T10:00:00Z',
  },
  {
    id: 'e1', projectId: 'p1', name: 'Exp_001_Baseline',
    models: ['ARIMA', 'SARIMA'],
    status: 'failed',
    trainUntil: '2024-03-31', validateUntil: '2024-06-30',
    createdAt: '2024-06-13T11:00:00Z',
  },
]

// ─── MODELS ───────────────────────────────────────────────────────────────────
export const MOCK_MODELS = [
  { id: 'm1',  name: 'Prophet',       category: 'Bayesian',          tag: 'Seasonal'    },
  { id: 'm2',  name: 'XGBoost',       category: 'Gradient boosting', tag: 'ML'          },
  { id: 'm3',  name: 'ARIMA',         category: 'Statistical',       tag: 'Classic'     },
  { id: 'm4',  name: 'Random Forest', category: 'Ensemble',          tag: 'ML'          },
  { id: 'm5',  name: 'Auto ARIMA',    category: 'Statistical',       tag: 'Auto'        },
  { id: 'm6',  name: 'SARIMA',        category: 'Statistical',       tag: 'Seasonal'    },
  { id: 'm7',  name: 'LSTM',          category: 'Deep learning',     tag: 'RNN'         },
  { id: 'm8',  name: 'GRU',           category: 'Deep learning',     tag: 'RNN'         },
  { id: 'm9',  name: 'LightGBM',      category: 'Gradient boosting', tag: 'ML'          },
  { id: 'm10', name: 'CatBoost',      category: 'Gradient boosting', tag: 'Categorical' },
  { id: 'm11', name: 'ETS',           category: 'Statistical',       tag: 'Smoothing'   },
  { id: 'm12', name: 'Theta',         category: 'Statistical',       tag: 'Method'      },
  { id: 'm13', name: 'Croston',       category: 'Statistical',       tag: 'Intermittent'},
  { id: 'm14', name: 'TBATS',         category: 'Statistical',       tag: 'Complex'     },
  { id: 'm15', name: 'NeuralProphet', category: 'Deep learning',     tag: 'Neural'      },
  { id: 'm16', name: 'N-BEATS',       category: 'Deep learning',     tag: 'Neural'      },
  { id: 'm17', name: 'N-HiTS',        category: 'Deep learning',     tag: 'Hierarchical'},
  { id: 'm18', name: 'Transformer',   category: 'Deep learning',     tag: 'Attention'   },
  { id: 'm19', name: 'TiDE',          category: 'Deep learning',     tag: 'Premium', premium: true },
  { id: 'm20', name: 'TimesNet',      category: 'Deep learning',     tag: 'Premium', premium: true },
]

// ─── FILES ────────────────────────────────────────────────────────────────────
export const MOCK_FILES: ProjectFile[] = [
  // p1 — Retail_Demand_Q2_2024
  { id: 'f1', projectId: 'p1', name: 'historical_actuals.csv',      type: 'csv',    sizeBytes: 3355443, rowCount: 48320, modifiedAt: '2024-06-12T10:00:00Z', protected: true  },
  { id: 'f2', projectId: 'p1', name: 'forecast_output_Exp_002.csv', type: 'csv',    sizeBytes: 1887437, rowCount: 34476, modifiedAt: '2024-06-18T14:00:00Z', protected: false },
  { id: 'f3', projectId: 'p1', name: 'accuracy_report.json',        type: 'json',   sizeBytes: 43008,                   modifiedAt: '2024-06-18T14:05:00Z', protected: false },
  {
    id: 'f4', projectId: 'p1', name: 'Experiments/', type: 'folder', sizeBytes: 0,
    modifiedAt: '2024-06-18T14:10:00Z', protected: false,
    children: [
      { id: 'f4a', projectId: 'p1', name: 'Exp_001_Baseline.zip',        type: 'json', sizeBytes: 18432,  modifiedAt: '2024-06-13T11:30:00Z', protected: false },
      { id: 'f4b', projectId: 'p1', name: 'Exp_002_With_Features.zip',   type: 'json', sizeBytes: 52428,  modifiedAt: '2024-06-18T14:05:00Z', protected: false },
      { id: 'f4c', projectId: 'p1', name: 'Exp_003_Ensemble.zip',        type: 'json', sizeBytes: 47185,  modifiedAt: '2024-06-16T10:00:00Z', protected: false },
    ],
  },

  // p2 — CPG_Inventory_Planning
  { id: 'f5', projectId: 'p2', name: 'cpg_historical_data.csv',     type: 'csv',    sizeBytes: 1843200, rowCount: 23808, modifiedAt: '2024-06-10T11:00:00Z', protected: true  },
  { id: 'f6', projectId: 'p2', name: 'inventory_forecast.csv',      type: 'csv',    sizeBytes: 921600,  rowCount: 12000, modifiedAt: '2024-06-10T11:30:00Z', protected: false },
  { id: 'f7', projectId: 'p2', name: 'replenishment_plan.json',     type: 'json',   sizeBytes: 28672,                   modifiedAt: '2024-06-10T12:00:00Z', protected: false },
  {
    id: 'f8', projectId: 'p2', name: 'Experiments/', type: 'folder', sizeBytes: 0,
    modifiedAt: '2024-06-10T11:00:00Z', protected: false,
    children: [
      { id: 'f8a', projectId: 'p2', name: 'CPG_Exp_001_Baseline.zip',    type: 'json', sizeBytes: 14336,  modifiedAt: '2024-06-07T09:00:00Z', protected: false },
      { id: 'f8b', projectId: 'p2', name: 'CPG_Exp_002_LightGBM.zip',    type: 'json', sizeBytes: 39321,  modifiedAt: '2024-06-10T10:00:00Z', protected: false },
    ],
  },

  // p3 — QSR_Production_Planning
  { id: 'f9',  projectId: 'p3', name: 'qsr_production_data.csv',    type: 'csv',    sizeBytes: 7340032, rowCount: 91440, modifiedAt: '2024-06-01T09:00:00Z', protected: true  },
  { id: 'f10', projectId: 'p3', name: 'daily_forecast_output.csv',  type: 'csv',    sizeBytes: 2621440, rowCount: 48000, modifiedAt: '2024-06-01T09:30:00Z', protected: false },
  { id: 'f11', projectId: 'p3', name: 'accuracy_metrics.json',      type: 'json',   sizeBytes: 32768,                   modifiedAt: '2024-06-01T10:00:00Z', protected: false },
  {
    id: 'f12', projectId: 'p3', name: 'Experiments/', type: 'folder', sizeBytes: 0,
    modifiedAt: '2024-06-01T09:00:00Z', protected: false,
    children: [
      { id: 'f12a', projectId: 'p3', name: 'QSR_Exp_001_XGBoost.zip',   type: 'json', sizeBytes: 22528,  modifiedAt: '2024-05-28T08:00:00Z', protected: false },
      { id: 'f12b', projectId: 'p3', name: 'QSR_Exp_002_Ensemble.zip',  type: 'json', sizeBytes: 35840,  modifiedAt: '2024-06-01T09:00:00Z', protected: false },
    ],
  },
]

export const MOCK_FILE_CONTENT: Record<string, { headers: string[]; rows: string[][] }> = {
  f1: {
    headers: ['item_id','date','demand','revenue','region','category','store_type','weekday'],
    rows: [
      ['RETAIL_N_001','2024-06-03','342','15,390','North','Electronics','Flagship','Mon'],
      ['RETAIL_N_001','2024-06-10','318','14,310','North','Electronics','Flagship','Mon'],
      ['RETAIL_N_002','2024-06-03','89', '4,005', 'North','Apparel',    'Mall',    'Mon'],
      ['RETAIL_N_003','2024-06-03','512','23,040','North','FMCG',       'Hyper',   'Mon'],
      ['RETAIL_S_001','2024-06-03','201','9,045', 'South','Electronics','Flagship','Mon'],
      ['RETAIL_S_002','2024-06-03','445','20,025','South','FMCG',       'Hyper',   'Mon'],
      ['RETAIL_E_001','2024-06-03','167','7,515', 'East', 'Apparel',    'Mall',    'Mon'],
      ['RETAIL_W_001','2024-06-03','290','13,050','West', 'Electronics','Flagship','Mon'],
      ['RETAIL_W_002','2024-06-03','133','5,985', 'West', 'Apparel',    'Mall',    'Mon'],
      ['RETAIL_C_001','2024-06-03','388','17,460','Central','FMCG',     'Hyper',   'Mon'],
    ],
  },
  f2: {
    headers: ['item_id','date','actual','forecast','lower_ci','upper_ci'],
    rows: [
      ['RETAIL_N_001','2024-04-01','298','312','281','343'],
      ['RETAIL_N_001','2024-04-08','334','328','294','362'],
      ['RETAIL_N_001','2024-04-15','—',  '345','309','381'],
      ['RETAIL_N_002','2024-04-01','82', '86', '74', '98' ],
      ['RETAIL_N_002','2024-04-08','91', '88', '76', '100'],
      ['RETAIL_N_003','2024-04-01','489','502','454','550'],
      ['RETAIL_N_003','2024-04-08','521','518','468','568'],
      ['RETAIL_S_001','2024-04-01','195','202','182','222'],
      ['RETAIL_S_001','2024-04-08','—',  '207','186','228'],
      ['RETAIL_E_001','2024-04-01','158','163','147','179'],
    ],
  },
  f3: {
    headers: ['model','mape','wmape','bias','mae','rmse'],
    rows: [
      ['XGBoost',      '10.4%','8.9%', '+2.1%','28.3','41.2'],
      ['Prophet',      '12.6%','10.2%','+3.8%','34.1','49.8'],
      ['Random Forest','14.1%','12.3%','+5.2%','38.2','55.6'],
      ['Ensemble',     '10.1%','8.7%', '+1.9%','27.8','40.5'],
    ],
  },
}

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TKT-004', title: 'LSTM fails on weekly data with gaps',   type: 'Bug Fix',             status: 'in-progress', createdAt: '2024-06-15', priority: 'high'   },
  { id: 'TKT-005', title: 'Add LGBM to forecast generation',       type: 'Enhancement Request', status: 'open',        createdAt: '2024-06-18', priority: 'medium' },
  { id: 'TKT-003', title: 'Date parse error on hourly data',       type: 'Bug Fix',             status: 'resolved',    createdAt: '2024-06-10', priority: 'medium' },
]

export const MOCK_TICKET_DETAILS: Record<string, TicketDetail> = {
  'TKT-004': {
    id: 'TKT-004',
    title: 'LSTM fails on weekly data with gaps',
    type: 'Bug Fix',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'Priya S.',
    createdByInitials: 'PS',
    assignee: 'Ganit',
    assigneeInitials: 'G',
    projectRef: 'QSR_Production_Planning',
    description: 'LSTM model crashes with an index-out-of-range exception when the time series contains gaps of more than 3 consecutive weeks. Reproducible on the QSR_Production_Planning project with the weekly granularity dataset.\n\nSteps to reproduce:\n1. Load QSR_Production_Planning dataset\n2. Navigate to Forecast Generation → select LSTM\n3. Run experiment\n4. Observe: RuntimeError — index out of range in sequence padding',
    events: [
      { id: 'e1', type: 'created',        actor: 'Priya S.', detail: 'Ticket created',                            timestamp: '2024-06-15T10:00:00Z' },
      { id: 'e2', type: 'assigned',        actor: 'Ganit',    detail: 'Assigned to Ganit',                        timestamp: '2024-06-15T10:05:00Z' },
      { id: 'e3', type: 'status_changed', actor: 'Ganit',    detail: 'Status changed from Open to In Progress',  timestamp: '2024-06-15T14:30:00Z' },
      { id: 'e4', type: 'priority_changed',actor: 'Ganit',   detail: 'Priority escalated from Medium to High',   timestamp: '2024-06-16T09:15:00Z' },
    ],
    comments: [
      {
        id: 'c1', author: 'Priya S.', authorInitials: 'PS', authorRole: 'Analyst',
        body: 'LSTM model crashes when the time series has gaps > 3 consecutive weeks. Error in `create_sequences()` during sequence padding. Attaching log output from the experiment run for reference.',
        createdAt: '2024-06-15T10:00:00Z',
      },
      {
        id: 'c2', author: 'Ganit', authorInitials: 'G', authorRole: 'Admin',
        body: 'Assigned to myself. Will investigate — looks like the sequence padding logic might not handle long gaps correctly. Will update once I dig into the data pipeline.',
        createdAt: '2024-06-15T14:35:00Z',
      },
      {
        id: 'c3', author: 'Ganit', authorInitials: 'G', authorRole: 'Admin',
        body: 'Root cause found: `create_sequences()` in `lstm_model.py` line 142 does not account for `NaN` padding after gap detection. When the imputed gaps produce NaN runs longer than the lookback window (default 12 weeks), the index calculation overflows. Fix: add a guard clause to skip sequences that contain > 50% NaN. PR in progress.',
        createdAt: '2024-06-16T09:20:00Z',
        isInternal: true,
      },
      {
        id: 'c4', author: 'Priya S.', authorInitials: 'PS', authorRole: 'Analyst',
        body: 'Any ETA on the fix? This is blocking the QSR experiment run — we have a client review on Friday.',
        createdAt: '2024-06-16T11:00:00Z',
      },
    ],
  },

  'TKT-005': {
    id: 'TKT-005',
    title: 'Add LGBM to forecast generation',
    type: 'Enhancement Request',
    status: 'open',
    priority: 'medium',
    createdAt: '2024-06-18T09:00:00Z',
    createdBy: 'Neha K.',
    createdByInitials: 'NK',
    assignee: undefined,
    projectRef: 'CPG_Inventory_Planning',
    description: 'We need LightGBM (LGBM) added to the available models in the Forecast Generation step. Our CPG inventory project consistently shows LGBM outperforming XGBoost by 1–2 MAPE points in benchmarks, but we cannot test it on this platform yet.\n\nProposed: Add LightGBM as a selectable model in the model grid alongside XGBoost and Prophet, with the same configuration surface (lag features, hyperparameter ranges).',
    events: [
      { id: 'e1', type: 'created', actor: 'Neha K.', detail: 'Enhancement request created', timestamp: '2024-06-18T09:00:00Z' },
    ],
    comments: [
      {
        id: 'c1', author: 'Neha K.', authorInitials: 'NK', authorRole: 'Manager',
        body: 'We need LightGBM added to the model selection grid. Our external benchmarks show it beats XGBoost by 1–2% MAPE on our CPG dataset. Happy to provide benchmark data if it helps prioritise.',
        createdAt: '2024-06-18T09:00:00Z',
      },
    ],
  },

  'TKT-003': {
    id: 'TKT-003',
    title: 'Date parse error on hourly data',
    type: 'Bug Fix',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-06-10T08:00:00Z',
    createdBy: 'Rahul M.',
    createdByInitials: 'RM',
    assignee: 'Priya S.',
    assigneeInitials: 'PS',
    projectRef: undefined,
    description: 'Date parsing fails when uploading hourly data with ISO 8601 format including timezone offsets (e.g. `2024-06-01T00:00:00+05:30`). The upload succeeds but the date column is parsed as a string, breaking all downstream processing.\n\nAffected: Any CSV with a datetime column in `YYYY-MM-DDTHH:MM:SS±HH:MM` format.',
    events: [
      { id: 'e1', type: 'created',        actor: 'Rahul M.',  detail: 'Ticket created',                             timestamp: '2024-06-10T08:00:00Z' },
      { id: 'e2', type: 'assigned',        actor: 'Ganit',     detail: 'Assigned to Priya S.',                      timestamp: '2024-06-10T08:30:00Z' },
      { id: 'e3', type: 'status_changed', actor: 'Priya S.',  detail: 'Status changed from Open to In Progress',   timestamp: '2024-06-10T09:00:00Z' },
      { id: 'e4', type: 'resolved',        actor: 'Priya S.',  detail: 'Ticket resolved — fix deployed in v2.1.1',  timestamp: '2024-06-10T11:30:00Z' },
    ],
    comments: [
      {
        id: 'c1', author: 'Rahul M.', authorInitials: 'RM', authorRole: 'Viewer',
        body: 'Date parsing fails on upload with ISO 8601 + timezone offset format. The date column shows as string type in the data quality page. Error: "invalid date format — expected YYYY-MM-DD or DD/MM/YYYY".',
        createdAt: '2024-06-10T08:00:00Z',
      },
      {
        id: 'c2', author: 'Priya S.', authorInitials: 'PS', authorRole: 'Analyst',
        body: 'Confirmed. The date parser in `ingest/parse.py` does not handle timezone offset suffixes. Working on a fix now.',
        createdAt: '2024-06-10T09:05:00Z',
      },
      {
        id: 'c3', author: 'Priya S.', authorInitials: 'PS', authorRole: 'Analyst',
        body: 'Fix: switched to `pandas.to_datetime(..., utc=True)` and then converting to IST. Also added a normalisation step that strips timezone info after conversion to avoid mixed-tz issues downstream. PR #47 merged.',
        createdAt: '2024-06-10T11:00:00Z',
        isInternal: true,
      },
      {
        id: 'c4', author: 'Priya S.', authorInitials: 'PS', authorRole: 'Analyst',
        body: 'Fixed and deployed in v2.1.1. Please re-upload your file — the date parsing will now correctly handle timezone offsets. Let us know if the issue persists.',
        createdAt: '2024-06-10T11:30:00Z',
      },
    ],
  },
}

// ─── WORKSPACE SCENARIOS ─────────────────────────────────────────────────────
export const MOCK_WORKSPACE_RESULTS: Record<string, {
  mape: string; wmape: string; bias: string; durationSec: number
  segments: Array<{ label: string; mape: string }>
}> = {
  XGBoost:        { mape:'10.4%', wmape:'8.9%',  bias:'+2.1%', durationSec:86,  segments:[{label:'AX (34)',mape:'7.2%'},{label:'AY (18)',mape:'11.8%'},{label:'BX (22)',mape:'15.4%'},{label:'CZ (9)',mape:'34.1%'}] },
  Prophet:        { mape:'12.6%', wmape:'10.2%', bias:'+3.8%', durationSec:126, segments:[{label:'AX (34)',mape:'9.1%'},{label:'AY (18)',mape:'12.4%'},{label:'BX (22)',mape:'17.2%'},{label:'CZ (9)',mape:'38.6%'}] },
  'Random Forest':{ mape:'14.1%', wmape:'12.3%', bias:'+5.2%', durationSec:47,  segments:[{label:'AX (34)',mape:'10.2%'},{label:'AY (18)',mape:'13.8%'},{label:'BX (22)',mape:'18.9%'},{label:'CZ (9)',mape:'41.2%'}] },
  LSTM:           { mape:'11.8%', wmape:'9.8%',  bias:'+1.4%', durationSec:312, segments:[{label:'AX (34)',mape:'8.4%'},{label:'AY (18)',mape:'12.1%'},{label:'BX (22)',mape:'16.3%'},{label:'CZ (9)',mape:'36.8%'}] },
  'Auto ARIMA':   { mape:'16.2%', wmape:'14.1%', bias:'+6.8%', durationSec:234, segments:[{label:'AX (34)',mape:'12.3%'},{label:'AY (18)',mape:'15.6%'},{label:'BX (22)',mape:'21.4%'},{label:'CZ (9)',mape:'45.2%'}] },
  Ensemble:       { mape:'10.1%', wmape:'8.7%',  bias:'+1.9%', durationSec:0,   segments:[{label:'AX (34)',mape:'7.0%'},{label:'AY (18)',mape:'11.2%'},{label:'BX (22)',mape:'14.8%'},{label:'CZ (9)',mape:'33.2%'}] },
}

export const MOCK_LOG_LINES = [
  { ts:'08:00:00', level:'info',    msg:'Forecastory Engine v2.1 initializing...' },
  { ts:'08:00:01', level:'success', msg:'Config loaded · project: Retail_Demand_Q2_2024' },
  { ts:'08:00:02', level:'success', msg:'Data loaded: 48,320 rows × 8 columns' },
  { ts:'08:00:03', level:'success', msg:'156 unique item_id combinations detected' },
  { ts:'08:00:04', level:'info',    msg:'Applying preprocessing pipeline...' },
  { ts:'08:00:05', level:'success', msg:'Outlier treatment (IQR 1.5×) → 3 values capped' },
  { ts:'08:00:06', level:'success', msg:'Missing value fill (forward-fill) → 2,041 filled' },
  { ts:'08:00:07', level:'success', msg:'Train: 2022-01-03 → 2024-03-31 (117 wks)' },
  { ts:'08:00:08', level:'info',    msg:'Starting MODEL on 156 combinations...' },
  { ts:'08:00:09', level:'running', msg:'Progress: 40/156 (26%)' },
  { ts:'08:00:10', level:'running', msg:'Progress: 96/156 (62%)' },
  { ts:'08:00:11', level:'running', msg:'Progress: 140/156 (90%)' },
  { ts:'08:00:12', level:'warning', msg:'SKU RETAIL_SOUTH_043: sparse data, using Croston fallback' },
  { ts:'08:00:13', level:'success', msg:'Training complete → MAPE: RESULT_MAPE' },
  { ts:'08:00:14', level:'success', msg:'Forecast output saved (1.9 MB)' },
  { ts:'08:00:15', level:'success', msg:'Experiment complete · 156 SKUs processed' },
]
