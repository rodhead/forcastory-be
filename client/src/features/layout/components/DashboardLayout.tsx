// src/features/layout/components/DashboardLayout.tsx
// Shell layout — Sidebar + Topbar + Subbar + main content + FooterBar.
// Designed to be a standalone shell component reusable across micro-frontends.
import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Subbar } from './Subbar'
import { FooterBar } from './FooterBar'
import { ToastContainer } from '@/components/shared/Toast'
import { ChatPanel } from '@/components/shared/ChatPanel'

interface Props {
  children: ReactNode
  topAction?: ReactNode
  tabs?: { id: string; label: string }[]
  activeTab?: string
  onTabChange?: (id: string) => void
}

export function DashboardLayout({ children, tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--s0)]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar activeTab={activeTab} />

        {/* Subbar — horizontal tabs driven by nav.config PAGE_TABS */}
        <Subbar tabs={tabs} activeTab={activeTab} onChange={onTabChange} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>

        {/* Footer — policy links, copyright, version */}
        <FooterBar />
      </div>

      {/* Global overlays */}
      <ToastContainer />
      <ChatPanel />
    </div>
  )
}
