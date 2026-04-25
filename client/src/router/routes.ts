// src/router/router.ts
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { DashboardPage } from '../pages/DashboardPage.tsx'
import { LoginPage } from '../pages/LoginPage.tsx'
import { ChatPage } from '../pages/ChatPage.tsx'

const rootRoute = createRootRoute()

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LoginPage,
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: DashboardPage,
})

const chatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/chat',
    component: ChatPage,
})

const routeTree = rootRoute.addChildren([loginRoute, dashboardRoute, chatRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
