import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import {useAuthStore} from "../features/auth/store/auth.store.ts";
import {cn} from "../utils/cn.ts";

// reusable field wrapper
function Field({ label, action, children }: {
    label: string
    action?: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#555] tracking-wide">{label}</label>
                {action}
            </div>
            {children}
        </div>
    )
}

// shared input class
const inputCls = [
    'w-full h-[42px] px-3.5 rounded-[10px]',
    'border border-[#e4e4e4] bg-white text-[#1a1a1a]',
    'text-[14px] placeholder:text-[#bbb] outline-none',
    'transition focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/10',
].join(' ')

function Divider() {
    return (
        <div className="flex items-center gap-2.5 my-4">
            <div className="flex-1 h-px bg-[#ececec]" />
            <span className="text-[12px] text-[#bbb]">or continue with</span>
            <div className="flex-1 h-px bg-[#ececec]" />
        </div>
    )
}

function GoogleButton() {
    return (
        <button className="w-full h-[42px] flex items-center justify-center gap-2 rounded-[10px] border border-[#e4e4e4] bg-white text-[13px] text-[#333] hover:bg-[#fafafa] transition">
            <GoogleIcon />
            Continue with Google
        </button>
    )
}

function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.31a3.68 3.68 0 01-1.6 2.42v2h2.59c1.52-1.4 2.39-3.46 2.39-5.88z" fill="#4285F4"/>
            <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.77 4.77 0 01-7.1-2.5H1v2.07A8 8 0 008 16z" fill="#34A853"/>
            <path d="M3.61 9.57A4.8 4.8 0 013.36 8c0-.55.1-1.08.25-1.57V4.36H1A8 8 0 000 8c0 1.29.31 2.51.86 3.59l2.75-2.02z" fill="#FBBC05"/>
            <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A7.94 7.94 0 008 0a8 8 0 00-7.14 4.36l2.75 2.07A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
        </svg>
    )
}

function Spinner() {
    return (
        <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
    )
}

function GridLines() {
    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-[0.07]"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    )
}

function BrandLogo() {
    return (
        <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-[#534AB7] rounded-[10px] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2"  y="12" width="3.5" height="6"  rx="1" fill="white" />
                    <rect x="8"  y="7"  width="3.5" height="11" rx="1" fill="white" />
                    <rect x="14" y="2"  width="3.5" height="16" rx="1" fill="white" opacity=".65" />
                </svg>
            </div>
            <div>
                <div className="text-[15px] font-medium text-[#f0eefc] tracking-[-0.01em]">
                    HKS Analytics
                </div>
                <div className="text-[11px] text-[#f0eefc]/40 mt-px">
                    Resource forecasting platform
                </div>
            </div>
        </div>
    )
}

function LeftPanel() {
    return (
        <div className="bg-[#0f0e17] relative flex flex-col justify-end p-10 overflow-hidden max-[560px]:hidden">

            {/* floating orbs */}
            <div className="absolute w-[320px] h-[320px] rounded-full bg-[#534AB7]/18 -top-16 -left-16 animate-float1" />
            <div className="absolute w-[260px] h-[260px] rounded-full bg-[#1D9E75]/12 bottom-10 -right-20 animate-float2" />
            <div className="absolute w-[180px] h-[180px] rounded-full bg-[#D4537E]/10 top-[40%] left-[30%] animate-float3" />

            {/* subtle grid */}
            <GridLines />

            <div className="relative z-10">
                <BrandLogo />

                <p className="text-[28px] font-medium text-[#f0eefc] leading-[1.3] tracking-tight mb-3">
                    Forecast smarter,<br />
                    scale <span className="text-[#7F77DD]">faster</span>
                </p>

                <p className="text-[13px] text-[#f0eefc]/40 leading-relaxed max-w-[260px]">
                    Real-time resource planning and capacity forecasting for high-growth teams.
                </p>

                <div className="flex gap-6 mt-8">
                    {[['98%','Accuracy'],['3.2×','Faster planning'],['40+','Integrations']].map(([v,l]) => (
                        <div key={l}>
                            <div className="text-[18px] font-medium text-[#f0eefc]">{v}</div>
                            <div className="text-[11px] text-[#f0eefc]/35 mt-0.5">{l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function LoginPage() {
    const navigate = useNavigate()
    const { setUser, setLoading, isLoading } = useAuthStore()

    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw]     = useState(false)
    const [remember, setRemember] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await new Promise(r => setTimeout(r, 1000)) // replace with real API
            setUser({ id: '1', email, name: 'Misbah Rahman' })
            navigate({ to: '/dashboard' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-2 max-[560px]:grid-cols-1">

            {/* ── left panel ── */}
            <LeftPanel />

            {/* ── right panel ── */}
            <div className="bg-[#fafaf9] flex items-center justify-center px-8 py-10">
                <div className="w-full max-w-[360px] animate-fadein">

                    <div className="mb-7">
                        <h1 className="text-[22px] font-medium text-[#1a1a1a] tracking-tight mb-1.5">
                            Sign in
                        </h1>
                        <p className="text-[13px] text-[#888]">Welcome back to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <Field label="Email address">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                autoComplete="email"
                                className={inputCls}
                            />
                        </Field>

                        <Field
                            label="Password"
                            action={
                                <button type="button" className="text-[12px] text-[#534AB7] hover:underline">
                                    Forgot password?
                                </button>
                            }
                        >
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={cn(inputCls, 'pr-10')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#888]"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </Field>

                        <label className="flex items-center gap-2 cursor-pointer -mt-1">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                                className="w-[15px] h-[15px] accent-[#534AB7]"
                            />
                            <span className="text-[13px] text-[#666]">Keep me signed in for 30 days</span>
                        </label>

                        <button
                            type="submit"
                            disabled={!email || !password || isLoading}
                            className={cn(
                                'w-full h-11 rounded-[10px] text-[14px] font-medium tracking-wide',
                                'bg-[#534AB7] text-white transition-opacity',
                                'hover:opacity-90 active:scale-[.99]',
                                'disabled:opacity-40 disabled:cursor-not-allowed',
                                'flex items-center justify-center gap-2'
                            )}
                        >
                            {isLoading ? <Spinner /> : 'Sign in'}
                        </button>

                    </form>

                    <Divider />

                    <GoogleButton />

                    <p className="text-center text-[13px] text-[#888] mt-5">
                        No account?{' '}
                        <a href="/signup" className="text-[#534AB7] font-medium hover:underline">
                            Create one free
                        </a>
                    </p>

                </div>
            </div>
        </div>
    )
}