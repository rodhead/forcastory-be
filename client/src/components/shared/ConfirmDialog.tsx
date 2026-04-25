// src/components/shared/ConfirmDialog.tsx
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Modal, ModalActions } from './Modal'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warn' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT_CONFIG = {
  danger: {
    icon:    AlertTriangle,
    iconBg:  'bg-[var(--er-t)]',
    iconCls: 'text-[var(--er)]',
    btnCls:  'bg-[var(--er-t)] border border-[var(--er-b)] text-[var(--er)] hover:opacity-80',
  },
  warn: {
    icon:    AlertTriangle,
    iconBg:  'bg-[var(--wa-t)]',
    iconCls: 'text-[var(--wa)]',
    btnCls:  'bg-[var(--wa-t)] border border-[var(--wa)]/30 text-[var(--wa)] hover:opacity-80',
  },
  info: {
    icon:    Info,
    iconBg:  'bg-[var(--in-t)]',
    iconCls: 'text-[var(--in)]',
    btnCls:  'bg-[var(--a1)] text-white hover:bg-[var(--a2)] shadow-[0_2px_8px_rgba(74,111,165,.25)]',
  },
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'warn',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cfg  = VARIANT_CONFIG[variant]
  const Icon = cfg.icon

  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex items-start gap-3 mb-4">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cfg.iconBg)}>
          <Icon size={16} className={cfg.iconCls} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-[var(--t1)]">{title}</h3>
          <p className="text-[12px] text-[var(--t2)] mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <ModalActions>
        <button
          onClick={onCancel}
          className="px-3 h-8 rounded-md border border-[var(--s4)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={cn('px-3 h-8 rounded-md text-[12px] font-bold transition-all', cfg.btnCls)}
        >
          {confirmLabel}
        </button>
      </ModalActions>
    </Modal>
  )
}
