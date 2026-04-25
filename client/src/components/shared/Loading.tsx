// src/components/shared/Loading.tsx
import { cn } from '@/utils/cn'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
}

export function Loading({ message = 'Loading...', size = 'md', className, fullPage }: LoadingProps) {
  const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' }
  const textMap = { sm: 'text-[11px]', md: 'text-[12px]', lg: 'text-[13px]' }

  const inner = (
    <div className={cn('flex flex-col items-center justify-center gap-2.5', className)}>
      <div className={cn(
        'rounded-full border-[var(--s4)] border-t-[var(--a1)] animate-spin',
        sizeMap[size]
      )} />
      {message && (
        <span className={cn('text-[var(--t3)] font-medium', textMap[size])}>
          {message}
        </span>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--s0)] z-50">
        {inner}
      </div>
    )
  }

  return inner
}

// Inline row loading — for tables, lists
export function LoadingRow({ message = 'Loading...', cols = 5 }: { message?: string; cols?: number }) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center">
        <Loading message={message} size="sm" />
      </td>
    </tr>
  )
}

// Page-level skeleton wrapper
export function PageLoading({ message = 'Loading page data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-48">
      <Loading message={message} size="md" />
    </div>
  )
}
