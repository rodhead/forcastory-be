import { forwardRef, useState } from 'react'
import {EyeIcon, EyeOffIcon} from "lucide-react";
import {cn} from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)
        const isPassword = type === 'password'

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-medium text-text-secondary">
                        {label}
                    </label>
                )}

                <div className="relative">
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? 'text' : type}
                        className={cn(
                            'h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-raised px-3',
                            'text-sm text-text-primary placeholder:text-text-muted',
                            'outline-none transition-colors',
                            'focus:border-primary focus:ring-2 focus:ring-primary/20',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            isPassword && 'pr-10',
                            error && 'border-danger focus:border-danger focus:ring-danger/20',
                            className
                        )}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    )}
                </div>

                {error && (
                    <p className="text-xs text-danger">{error}</p>
                )}
            </div>
        )
    }
)