import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials } from '../types/auth.types'
import {Input} from "../../../components/ui/Input";
import {Button} from "../../../components/ui/Button";

export function LoginForm() {
    const navigate = useNavigate()
    const { setUser, setLoading, isLoading } = useAuthStore()

    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: '',
        rememberMe: false,
    })

    const handleChange = (field: keyof LoginCredentials) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setCredentials((prev) => ({
                ...prev,
                [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
            }))
        }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // replace this with your real API call later
            // const user = await loginApi(credentials)
            await new Promise((r) => setTimeout(r, 1000)) // fake delay

            setUser({
                id: '1',
                email: credentials.email,
                name: 'Admin',
                role: 'admin',
                organisation: 'HKS Inc.',
                initials: 'G',
            })

            navigate({ to: '/dashboard' })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const isDisabled = !credentials.email || !credentials.password

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={credentials.email}
                onChange={handleChange('email')}
                autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary">Password</span>
                    <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange('password')}
                    autoComplete="current-password"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={credentials.rememberMe}
                    onChange={handleChange('rememberMe')}
                    className="accent-primary w-3.5 h-3.5"
                />
                <span className="text-sm text-text-secondary">Keep me signed in</span>
            </label>

            <Button
                type="submit"
                disabled={isDisabled}
                loading={isLoading}
                className="w-full mt-1"
            >
                Sign in
            </Button>
        </form>
    )
}