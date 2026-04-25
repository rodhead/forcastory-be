// src/config/constants.ts

export const ROUTES = {
  LOGIN:          '/',
  DASHBOARD:      '/dashboard',
  PROJECTS:       '/dashboard/projects',
  PROJECT_DETAIL: '/dashboard/projects/$projectId',
  QUALITY:        '/dashboard/forecasting/quality',
  PREFORECAST:    '/dashboard/forecasting/pre-forecast',
  FORECAST:       '/dashboard/forecasting/generate',
  POSTFORECAST:   '/dashboard/forecasting/results',
  FILES:          '/dashboard/files',
  SUPPORT:        '/dashboard/support',
  SETTINGS:       '/dashboard/settings',
  ADMIN:          '/dashboard/admin',
  PROFILE:        '/dashboard/profile',
  PREFERENCES:    '/dashboard/preferences',
  WORKSPACE:      '/dashboard/workspace',
  PLANS:          '/dashboard/settings/plans',
  LEARNING:       '/dashboard/learning',
  TICKET_DETAIL:  '/dashboard/support/$ticketId',
} as const

export const QUERY_KEYS = {
  PROJECTS:     ['projects'] as const,
  PROJECT:      (id: string) => ['project', id] as const,
  QUALITY:      (projectId: string) => ['quality', projectId] as const,
  EXPERIMENTS:  (projectId: string) => ['experiments', projectId] as const,
  FILES:        (projectId: string) => ['files', projectId] as const,
  TICKETS:      ['tickets'] as const,
  USERS:        ['users'] as const,
} as const

export const STALE_TIMES = {
  STATIC:  1000 * 60 * 60,   // 1 hour — rarely changes
  NORMAL:  1000 * 60 * 5,    // 5 min  — typical API data
  LIVE:    1000 * 30,        // 30 sec — experiment logs, running jobs
} as const
