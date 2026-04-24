// src/components/ui/Badge.tsx
const badgeVariants = cva(
    'inline-flex items-center font-medium px-2 py-0.5 rounded-[var(--radius-full)]',
    {
        variants: {
            variant: {
                default: 'bg-surface text-text-secondary border border-border',
                success: 'bg-green-50 text-green-800',
                warning: 'bg-yellow-50 text-yellow-800',
                danger:  'bg-red-50 text-red-800',
                info:    'bg-blue-50 text-blue-800',
            },
            size: {
                sm: 'text-xs',
                md: 'text-sm',
            }
        },
        defaultVariants: { variant: 'default', size: 'sm' }
    }
)

export function Badge({ variant, size, className, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}