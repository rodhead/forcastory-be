// src/router/routes.ts
import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { LoginPage } from '@/pages/LoginPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import {
  DataQualityPage,
  PreForecastPage,
  ForecastGenerationPage,
  PostForecastPage,
} from '@/pages/ForecastingPages'
import { WorkspacePage } from '@/pages/WorkspacePage'
import { PlansPage } from '@/pages/PlansPage'
import {
  FileManagerPage,
  SupportPage,
  SettingsPage,
  AdminPage,
  ProfilePage,
  PreferencesPage,
} from '@/pages/OtherPages'
import { DashboardPage } from '@/pages/DashboardPage'
import { LearningPage } from '@/pages/LearningPage'
import { TicketDetailPage } from '@/pages/TicketDetailPage'

// ── auth guard ───────────────────────────────────────────────────────────────
function requireAuth() {
  const raw = localStorage.getItem('hks-auth')
  if (!raw) throw redirect({ to: '/' as const })
  try {
    const { state } = JSON.parse(raw)
    if (!state?.isAuthenticated) throw redirect({ to: '/' as const })
  } catch {
    throw redirect({ to: '/' as const })
  }
}

// ── root ─────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute()

// ── public ───────────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
})

// ── /dashboard → redirect to /dashboard/projects ─────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
  beforeLoad: () => {
    requireAuth()
    throw redirect({ to: '/dashboard/projects' as never })
  },
})

// ── helper: protected route ───────────────────────────────────────────────────
function makeRoute(path: string, Comp: () => React.JSX.Element) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: Comp,
    beforeLoad: requireAuth,
  })
}

// ── protected pages ───────────────────────────────────────────────────────────
const projectsRoute     = makeRoute('/dashboard/projects',               ProjectsPage)
const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/projects/$projectId',
  component: ProjectDetailPage,
  beforeLoad: requireAuth,
})
const qualityRoute      = makeRoute('/dashboard/forecasting/quality',    DataQualityPage)
const preForecastRoute  = makeRoute('/dashboard/forecasting/pre-forecast', PreForecastPage)
const forecastRoute     = makeRoute('/dashboard/forecasting/generate',   ForecastGenerationPage)
const postForecastRoute = makeRoute('/dashboard/forecasting/results',    PostForecastPage)
const workspaceRoute    = makeRoute('/dashboard/workspace',              WorkspacePage)
const filesRoute        = makeRoute('/dashboard/files',                  FileManagerPage)
const supportRoute      = makeRoute('/dashboard/support',                SupportPage)
const settingsRoute     = makeRoute('/dashboard/settings',               SettingsPage)
const adminRoute        = makeRoute('/dashboard/admin',                  AdminPage)
const profileRoute      = makeRoute('/dashboard/profile',                ProfilePage)
const preferencesRoute  = makeRoute('/dashboard/preferences',            PreferencesPage)
const plansRoute        = makeRoute('/dashboard/settings/plans',            PlansPage)
const learningRoute     = makeRoute('/dashboard/learning',                  LearningPage)
const ticketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/support/$ticketId',
  component: TicketDetailPage,
  beforeLoad: requireAuth,
})

// ── tree ──────────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  projectsRoute,
  projectDetailRoute,
  qualityRoute,
  preForecastRoute,
  forecastRoute,
  postForecastRoute,
  workspaceRoute,
  filesRoute,
  supportRoute,
  settingsRoute,
  adminRoute,
  profileRoute,
  preferencesRoute,
  plansRoute,
  learningRoute,
  ticketDetailRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
