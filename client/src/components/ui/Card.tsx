// src/components/ui/Card.tsx
import {cn} from "../../utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'bg-surface-raised border border-border rounded-[var(--radius-lg)] p-4',
                className
            )}
            {...props}
        />
    )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('mb-3 flex items-center justify-between', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-base font-medium text-text-primary', className)} {...props} />
}