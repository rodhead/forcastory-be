// src/components/shared/Toast.tsx
import { useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLayoutStore, type Toast } from '@/features/layout/store/layout.store'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  warn:    AlertTriangle,
  info:    Info,
}

const STYLES = {
  success: 'border-l-[var(--a1)] [&_.ti]:bg-[var(--a3)] [&_.ti_svg]:text-[var(--a1)]',
  error:   'border-l-[var(--er)] [&_.ti]:bg-[var(--er-t)] [&_.ti_svg]:text-[var(--er)]',
  warn:    'border-l-[var(--wa)] [&_.ti]:bg-[var(--wa-t)] [&_.ti_svg]:text-[var(--wa)]',
  info:    'border-l-[var(--in)] [&_.ti]:bg-[var(--in-t)] [&_.ti_svg]:text-[var(--in)]',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useLayoutStore((s) => s.removeToast)
  const Icon = ICONS[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4200)
    return () => clearTimeout(timer)
  }, [toast.id, removeToast])

  return (
    <div
      className={cn(
        'flex items-start gap-3 min-w-[260px] max-w-[320px]',
        'bg-[var(--s1)] border border-[var(--s4)] border-l-4 rounded-[var(--rl)]',
        'p-3 shadow-[var(--d4)] animate-slide-in',
        STYLES[toast.type]
      )}
    >
      <div className="ti w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0">
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[var(--t1)] leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-[var(--t2)] mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[var(--t4)] hover:text-[var(--t1)] transition-colors flex-shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useLayoutStore((s) => s.toasts)
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-20 right-4 z-[400] flex flex-col gap-1.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
