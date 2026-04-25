// src/features/layout/components/Subbar.tsx
// Horizontal page-level tab bar.
// Driven by PAGE_TABS from nav.config — add a route entry there to get tabs.
import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { cn } from '@/utils/cn'
import { PAGE_TABS } from '../config/nav.config'

interface SubbarProps {
  /** Override tabs (optional) — if omitted, driven by current route */
  tabs?: { id: string; label: string }[]
  /** Controlled active tab (optional) */
  activeTab?: string
  onChange?: (id: string) => void
}

export function Subbar({ tabs, activeTab, onChange }: SubbarProps) {
  const router   = useRouterState()
  const pathname = router.location.pathname
  const resolved = tabs ?? PAGE_TABS[pathname] ?? []
  const [internal, setInternal] = useState(resolved[0]?.id ?? '')

  const active = activeTab ?? internal

  function handleClick(id: string) {
    setInternal(id)
    onChange?.(id)
  }

  if (!resolved.length) return null

  return (
    <div className="h-[36px] bg-[var(--s1)] border-b border-[var(--s4)] flex items-center px-5 gap-0.5 flex-shrink-0 overflow-x-auto">
      {resolved.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={cn(
            'h-full px-3.5 text-[11.5px] font-medium border-b-2 transition-all whitespace-nowrap',
            active === tab.id
              ? 'text-[var(--a1)] border-b-[var(--a1)] font-semibold'
              : 'text-[var(--t3)] border-b-transparent hover:text-[var(--t2)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
