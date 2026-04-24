// src/router/router.ts
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import {DashboardPage} from "../pages/DashboardPage.tsx";
import {LoginPage} from "../pages/LoginPage.tsx";

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

const routeTree = rootRoute.addChildren([loginRoute, dashboardRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}