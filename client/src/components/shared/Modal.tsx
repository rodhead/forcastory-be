// src/components/shared/Modal.tsx
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  // close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(26,29,39,0.35)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          'bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rxl)]',
          'p-5 w-full mx-4 shadow-[var(--d4)]',
          'animate-[modalIn_.18s_ease]',
          widths[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[var(--t1)] tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--s3)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

interface ModalActionsProps { children: ReactNode; className?: string }
export function ModalActions({ children, className }: ModalActionsProps) {
  return (
    <div className={cn('flex gap-2 justify-end mt-4 pt-4 border-t border-[var(--s3)]', className)}>
      {children}
    </div>
  )
}
