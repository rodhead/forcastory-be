// src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// ALL variants defined in one place
const buttonVariants = cva(
    // base classes every button gets
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                primary:   'bg-primary text-white hover:bg-primary-hover',
                secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-raised',
                ghost:     'text-text-secondary hover:bg-surface hover:text-text-primary',
                danger:    'bg-danger text-white hover:opacity-90',
                link:      'text-primary underline-offset-4 hover:underline p-0 h-auto',
            },
            size: {
                sm:   'h-7  px-3 text-xs rounded-[var(--radius-sm)]',
                md:   'h-9  px-4 text-sm rounded-[var(--radius-md)]',
                lg:   'h-11 px-6 text-base rounded-[var(--radius-lg)]',
                icon: 'h-9  w-9       rounded-[var(--radius-md)]',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
)

// props = HTML button props + your variant props
interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean
}


function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
export function Button({ variant, size, loading, className, children, ...props }: ButtonProps) {
    return (
        <button
            className={cn(buttonVariants({ variant, size }), className)}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <Spinner className="mr-2 h-4 w-4" />}
            {children}
        </button>
    )
}