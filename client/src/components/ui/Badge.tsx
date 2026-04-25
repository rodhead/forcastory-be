// src/components/ui/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center font-medium px-2 py-0.5 rounded-full border',
  {
    variants: {
      variant: {
        default: 'bg-[var(--s2)] text-[var(--t2)] border-[var(--s4)]',
        blue:    'bg-[var(--in-t)] text-[var(--in)] border-[var(--in-b)]',
        gray:    'bg-[var(--s2)] text-[var(--t2)] border-[var(--s4)]',
        warn:    'bg-[var(--wa-t)] text-[var(--wa)] border-[var(--wa-b)]',
        danger:  'bg-[var(--er-t)] text-[var(--er)] border-[var(--er-b)]',
      },
      size: {
        sm: 'text-[10px]',
        md: 'text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    BadgeVariants {}

export function Badge({ variant, size, className, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}
