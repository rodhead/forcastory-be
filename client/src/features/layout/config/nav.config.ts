// src/features/layout/config/nav.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE NOTE:
// This file is the single source of truth for navigation.
// In production, replace `STATIC_NAV_CONFIG` with an API call:
//   GET /api/shell/nav  → returns NavConfig[]
// The shell components (Sidebar, Topbar) consume this config and render
// accordingly, so they work as standalone micro-frontend shell components.
// ─────────────────────────────────────────────────────────────────────────────

import type { Role } from '@/types/common'
import { ROUTES } from '@/config/constants'

export interface NavChild {
  id: string
  label: string
  to: string
  meta?: string
  workflowState?: 'done' | 'active' | 'idle'
}

export interface NavConfig {
  id: string
  label: string
  iconName: string               // maps to lucide-react icon name
  section: 'main' | 'config'
  to?: string
  chip?: string
  chipVariant?: 'red' | 'blue'
  allowedRoles: Role[]           // empty = all roles
  children?: NavChild[]
}

// ─── Static nav (replace with API fetch in production) ───────────────────────
export const STATIC_NAV_CONFIG: NavConfig[] = [
  // ── Main ─────────────────────────────────────────────────────────────────
  {
    id: 'projects',
    label: 'Projects',
    iconName: 'LayoutGrid',
    section: 'main',
    to: ROUTES.PROJECTS,
    allowedRoles: [],    // all roles
  },
  {
    id: 'forecasting',
    label: 'Forecasting',
    iconName: 'BarChart2',
    section: 'main',
    allowedRoles: [],
    children: [
      { id: 'quality',     label: 'Data quality',    to: ROUTES.QUALITY,      meta: '78.4 ✓', workflowState: 'done'   },
      { id: 'pre',         label: 'Pre-forecast',     to: ROUTES.PREFORECAST,  meta: 'In progress', workflowState: 'active' },
      { id: 'forecast',    label: 'Forecast gen.',    to: ROUTES.FORECAST,     meta: '2 exp.',      workflowState: 'idle'   },
      { id: 'postforecast',label: 'Post-forecast',    to: ROUTES.POSTFORECAST, meta: 'Ready',       workflowState: 'idle'   },
    ],
  },
  {
    id: 'files',
    label: 'File manager',
    iconName: 'Folder',
    section: 'main',
    to: ROUTES.FILES,
    allowedRoles: [],
  },
  {
    id: 'learning',
    label: 'Learning',
    iconName: 'BookOpen',
    section: 'main',
    to: ROUTES.LEARNING,
    allowedRoles: [],
  },
  // ── Config ────────────────────────────────────────────────────────────────
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'Settings',
    section: 'config',
    to: ROUTES.SETTINGS,
    allowedRoles: [],
    children: [
      { id: 'settings-general', label: 'General',      to: ROUTES.SETTINGS },
      { id: 'plans',            label: 'Plans & billing', to: ROUTES.PLANS, workflowState: 'idle' as const },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    iconName: 'HelpCircle',
    section: 'config',
    to: ROUTES.SUPPORT,
    chip: '2',
    chipVariant: 'red',
    allowedRoles: [],
  },
  {
    id: 'admin',
    label: 'Admin panel',
    iconName: 'ShieldCheck',
    section: 'config',
    to: ROUTES.ADMIN,
    chip: 'Admin',
    chipVariant: 'blue',
    allowedRoles: ['admin'],   // admin-only
  },
]

// ─── Breadcrumb config ────────────────────────────────────────────────────────
export interface BreadcrumbSegment { label: string; to?: string }

export const BREADCRUMB_MAP: Record<string, BreadcrumbSegment[]> = {
  [ROUTES.PROJECTS]:             [{ label: 'Projects' }],
  [ROUTES.PROJECTS + '#recent']: [{ label: 'Projects', to: ROUTES.PROJECTS }, { label: 'Recent' }],
  [ROUTES.PROJECTS + '#analytics']: [{ label: 'Projects', to: ROUTES.PROJECTS }, { label: 'Analytics' }],
  [ROUTES.QUALITY]:      [{ label: 'Forecasting' }, { label: 'Data quality' }],
  [ROUTES.PREFORECAST]:  [{ label: 'Forecasting' }, { label: 'Pre-forecast' }],
  [ROUTES.FORECAST]:     [{ label: 'Forecasting' }, { label: 'Forecast generation' }],
  [ROUTES.POSTFORECAST]: [{ label: 'Forecasting' }, { label: 'Post-forecast' }],
  [ROUTES.WORKSPACE]:    [{ label: 'Projects', to: ROUTES.PROJECTS }, { label: 'Workspace' }],
  [ROUTES.FILES]:        [{ label: 'File manager' }],
  [ROUTES.LEARNING]:    [{ label: 'Learning' }],
  [ROUTES.SUPPORT]:        [{ label: 'Support' }],
  [ROUTES.TICKET_DETAIL]:  [{ label: 'Support', to: ROUTES.SUPPORT }, { label: 'Ticket detail' }],
  [ROUTES.SETTINGS]:     [{ label: 'Config' }, { label: 'Settings' }],
  [ROUTES.ADMIN]:        [{ label: 'Config', to: ROUTES.SETTINGS }, { label: 'Admin panel' }],
  [ROUTES.PROFILE]:      [{ label: 'Account' }, { label: 'Profile' }],
  [ROUTES.PREFERENCES]:  [{ label: 'Account', to: ROUTES.PROFILE }, { label: 'Preferences' }],
  [ROUTES.PLANS]:        [{ label: 'Config', to: ROUTES.SETTINGS }, { label: 'Plans & billing' }],
}

// ─── Role permissions helper ──────────────────────────────────────────────────
export function canAccess(item: NavConfig, role: Role): boolean {
  if (item.allowedRoles.length === 0) return true
  return item.allowedRoles.includes(role)
}

// ─── Page → subbar tabs config ────────────────────────────────────────────────
export interface TabConfig { id: string; label: string }

export const PAGE_TABS: Record<string, TabConfig[]> = {
  [ROUTES.PROJECTS]:     [{ id: 'overview', label: 'Overview' }, { id: 'recent', label: 'Recent' }, { id: 'analytics', label: 'Analytics' }],
  [ROUTES.QUALITY]:      [{ id: 'overview', label: 'Overview' }, { id: 'completeness', label: 'Completeness' }, { id: 'consistency', label: 'Consistency' }, { id: 'outliers', label: 'Outliers' }, { id: 'abc-xyz', label: 'ABC-XYZ' }],
  [ROUTES.PREFORECAST]:  [{ id: 'outlier', label: 'Outlier detection' }, { id: 'seasonality', label: 'Seasonality' }, { id: 'trend', label: 'Trend' }, { id: 'forecastability', label: 'Forecastability' }, { id: 'features', label: 'Feature store' }],
  [ROUTES.FORECAST]:     [{ id: 'models', label: 'Models' }, { id: 'experiments', label: 'Experiments' }, { id: 'config', label: 'Config' }, { id: 'results', label: 'Results' }],
  [ROUTES.POSTFORECAST]: [{ id: 'summary', label: 'Summary' }, { id: 'accuracy', label: 'Accuracy' }, { id: 'comparison', label: 'Vs actual' }, { id: 'segments', label: 'Segments' }, { id: 'export', label: 'Export' }],
  [ROUTES.FILES]:        [{ id: 'all', label: 'All files' }, { id: 'data', label: 'Data' }, { id: 'experiments', label: 'Experiments' }, { id: 'metadata', label: 'Metadata' }],
  [ROUTES.SUPPORT]:      [{ id: 'open', label: 'Open (2)' }, { id: 'resolved', label: 'Resolved' }, { id: 'faq', label: 'FAQ' }],
  [ROUTES.SETTINGS]:     [{ id: 'general', label: 'General' }, { id: 'project', label: 'Project' }, { id: 'integrations', label: 'Integrations' }],
  [ROUTES.ADMIN]:        [{ id: 'users', label: 'Users' }, { id: 'system', label: 'System' }, { id: 'audit', label: 'Audit log' }],
  [ROUTES.PROFILE]:      [{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }],
  [ROUTES.PREFERENCES]:  [{ id: 'display', label: 'Display' }, { id: 'notifications', label: 'Notifications' }],
  [ROUTES.PLANS]:        [{ id: 'overview', label: 'Overview' }, { id: 'usage', label: 'Usage' }, { id: 'billing', label: 'Billing' }, { id: 'invoices', label: 'Invoices' }],
}

// ─── Footer policy links ──────────────────────────────────────────────────────
export const FOOTER_LINKS = [
  { label: 'Privacy policy',     href: '/legal/privacy' },
  { label: 'Terms of service',   href: '/legal/terms'   },
  { label: 'Cookie settings',    href: '/legal/cookies' },
  { label: 'Accessibility',      href: '/legal/a11y'    },
  { label: 'Documentation',      href: '/docs'          },
  { label: 'Status',             href: '/status'        },
]
