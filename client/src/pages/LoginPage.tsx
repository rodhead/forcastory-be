// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, BarChart2, ArrowRight, Check, Shield, BarChart, Eye as EyeIcon, Briefcase, TrendingUp, Zap, Globe, Lock } from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { cn } from '@/utils/cn'
import type { Role } from '@/types/common'

// ─── Tenant company from URL subdomain ────────────────────────────────────────
// HKS Inc. is the platform owner. Tenants access via companyabc.hksforecastory.com.
// On localhost / bare domain there is no tenant — show generic workspace label.
function getTenantFromUrl(): { name: string; slug: string } | null {
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const parts = host.split('.')
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    const slug = parts[0]
    const name = slug.charAt(0).toUpperCase() + slug.slice(1)
    return { name, slug }
  }
  return null  // localhost / no subdomain — demo / HKS internal
}

// ─── Role definitions ─────────────────────────────────────────────────────────
const ROLES: { id: Role; label: string; desc: string; icon: React.ElementType; badge: string; color: string }[] = [
  { id: 'admin',   label: 'Administrator', desc: 'Full access to all features, settings and user management',       icon: Shield,   badge: 'Full access',     color: '#ca8a04' },
  { id: 'analyst', label: 'Analyst',       desc: 'Run experiments, view results and manage forecasting projects',   icon: BarChart,  badge: 'Read / Write',    color: '#3b82f6' },
  { id: 'manager', label: 'Manager',       desc: 'Approve outputs and export reports for leadership review',        icon: Briefcase, badge: 'Approve / Export', color: '#8b5cf6' },
  { id: 'viewer',  label: 'Viewer',        desc: 'Read-only access to projects, forecasts and dashboards',          icon: EyeIcon,   badge: 'Read only',       color: '#10b981' },
]

// ─── Left panel ───────────────────────────────────────────────────────────────
function LeftPanel({ tenant }: { tenant: { name: string; slug: string } | null }) {
  const features = [
    { icon: TrendingUp, label: 'Demand Forecasting',     desc: 'ML-powered predictions across 20+ algorithms'  },
    { icon: Zap,        label: 'Real-time Experiments',  desc: 'Run, compare and deploy models in minutes'     },
    { icon: Globe,      label: 'Multi-tenant Platform',  desc: 'Isolated workspace per business unit'          },
    { icon: Lock,       label: 'Enterprise Security',    desc: 'SOC2 compliant · Role-based access control'    },
  ]

  return (
    <div className="relative flex flex-col justify-between p-10 overflow-hidden" style={{ background: '#06091a' }}>
      {/* grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* ambient orbs */}
      <div className="absolute w-[400px] h-[400px] rounded-full -top-24 -left-24 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(202,138,4,.10) 0%, transparent 65%)' }} />
      <div className="absolute w-[300px] h-[300px] rounded-full bottom-10 right-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,.07) 0%, transparent 65%)' }} />

      {/* chart visual */}
      <div className="absolute bottom-[180px] left-0 right-0 flex items-end justify-center gap-[6px] px-12 opacity-[0.07]">
        {[38, 62, 45, 78, 55, 90, 67, 83, 50, 72, 88, 60, 94].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h * 1.3}px`,
              background: 'linear-gradient(180deg, #ca8a04 0%, #a16207 100%)',
              animation: `barPulse 2.4s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>

      {/* brand */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ca8a04,#a16207)', boxShadow: '0 0 24px rgba(202,138,4,.3)' }}>
          <BarChart2 size={18} className="text-black" />
        </div>
        <div>
          <div className="text-[15px] font-bold text-white tracking-tight">Forecastory</div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,.3)' }}>by HKS Inc.</div>
        </div>
      </div>

      {/* headline */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-[10.5px] font-semibold tracking-wide" style={{ background: 'rgba(202,138,4,.12)', border: '1px solid rgba(202,138,4,.2)', color: '#ca8a04' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#ca8a04] animate-pulse" />
          Platform v2.1 · Now with multi-model ensembles
        </div>
        <h2 className="text-[28px] font-bold text-white leading-[1.2] tracking-tight mb-3">
          Forecast smarter,<br />
          <span style={{ color: '#ca8a04' }}>scale faster.</span>
        </h2>
        <p className="text-[12.5px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,.35)', maxWidth: '280px' }}>
          Demand planning and supply chain intelligence for high-growth teams — deployed in hours, not months.
        </p>

        {/* feature list */}
        <div className="flex flex-col gap-3 mb-8">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(202,138,4,.1)', border: '1px solid rgba(202,138,4,.15)' }}>
                <Icon size={13} style={{ color: '#ca8a04' }} />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-white">{label}</div>
                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,.3)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* stats */}
        <div className="flex gap-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
          {[['98%', 'Avg. accuracy'], ['3.2×', 'Faster planning'], ['40+', 'Integrations']].map(([v, l]) => (
            <div key={l}>
              <div className="text-[18px] font-bold" style={{ color: '#ca8a04' }}>{v}</div>
              <div className="text-[10.5px] mt-0.5" style={{ color: 'rgba(255,255,255,.3)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tenant tag */}
      {tenant && (
        <div className="relative z-10 mt-6">
          <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,.25)' }}>
            Workspace for <span style={{ color: 'rgba(255,255,255,.5)' }}>{tenant.name}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes barPulse {
          0%,100% { transform: scaleY(0.55); opacity:.55; }
          50%      { transform: scaleY(1.0);  opacity:1;  }
        }
      `}</style>
    </div>
  )
}

// ─── LoginPage ─────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const tenant = getTenantFromUrl()
  const { loginWithRedirect, user: ssoUser, isAuthenticated: ssoAuthenticated, isLoading: ssoLoading } = useAuth0()

  const [stage,     setStage]     = useState<'credentials' | 'role'>('credentials')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [remember,  setRemember]  = useState(false)
  const [role,      setRole]      = useState<Role | null>(null)
  const [loading,   setLoading]   = useState(false)   // local — avoids persisted state bug

  // When Auth0/Okta redirects back and the user is authenticated, advance to role selection
  useEffect(() => {
    if (ssoAuthenticated && ssoUser && stage === 'credentials') {
      setEmail(ssoUser.email ?? ssoUser.name ?? '')
      setStage('role')
    }
  }, [ssoAuthenticated, ssoUser, stage])

  const inputCls = [
    'w-full h-11 px-4 rounded-xl text-[13px] outline-none transition-all',
    'bg-[#0d1525] border border-[#1e2d45] text-white placeholder:text-[#2d4060]',
    'focus:border-[#ca8a04] focus:shadow-[0_0_0_3px_rgba(202,138,4,.1)]',
  ].join(' ')

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setStage('role')
  }

  const handleLogin = async () => {
    if (!role) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const displayName = ssoUser?.name ?? ssoUser?.nickname ?? email
    const nameParts = displayName.trim().split(/\s+/)
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : (displayName[0]?.toUpperCase() ?? '?')
    setUser({
      id: ssoUser?.sub ?? '1',
      email: ssoUser?.email ?? email,
      name: displayName,
      picture: ssoUser?.picture,
      role,
      organisation: tenant?.name ?? 'HKS Inc.',
      initials,
    })
    navigate({ to: '/dashboard' })
    // setLoading(false) intentionally omitted — component unmounts on navigate
  }

  return (
    <div className="min-h-screen grid max-[640px]:grid-cols-1" style={{ gridTemplateColumns: '1fr 1fr', background: '#06091a' }}>
      <LeftPanel tenant={tenant} />

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center px-8 py-10 relative" style={{ background: '#080d18' }}>
        {/* subtle top border */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(202,138,4,.3), transparent)' }} />

        <div className="w-full max-w-[400px]">

          {/* Tenant / platform badge */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ca8a04,#a16207)' }}>
                <BarChart2 size={10} className="text-black" />
              </div>
              {tenant ? (
                <>
                  <span className="text-[12px] font-semibold text-white/70">{tenant.name}</span>
                  <span className="text-[10px] text-white/25">·</span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,.3)' }}>Powered by Forecastory</span>
                </>
              ) : (
                <span className="text-[12px] font-semibold text-white/50">Forecastory</span>
              )}
            </div>
          </div>

          {/* ── Stage: Credentials ── */}
          {stage === 'credentials' && (
            <div style={{ animation: 'panelIn .3s ease' }}>
              <div className="mb-7 text-center">
                <h1 className="text-[24px] font-bold text-white tracking-tight mb-1.5">Sign in</h1>
                <p className="text-[13px]" style={{ color: '#3d5570' }}>
                  Enter your credentials to access your workspace
                </p>
              </div>

              <form onSubmit={handleCredentials} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-semibold tracking-wide" style={{ color: '#6a89a8' }}>Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11.5px] font-semibold tracking-wide" style={{ color: '#6a89a8' }}>Password</label>
                    <button type="button" className="text-[11px] font-medium transition-colors hover:underline" style={{ color: '#ca8a04' }}>Forgot password?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={cn(inputCls, 'pr-11')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#2d4060' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ca8a04')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#2d4060')}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setRemember(r => !r)}
                    className={cn('w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all cursor-pointer border', remember ? 'border-[#ca8a04]' : 'border-[#2a3a52]')}
                    style={{ background: remember ? '#ca8a04' : 'transparent' }}
                  >
                    {remember && <Check size={9} className="text-black" strokeWidth={3} />}
                  </div>
                  <span className="text-[12px]" style={{ color: '#3d5570' }}>Keep me signed in for 30 days</span>
                </label>

                <button
                  type="submit"
                  disabled={!email || !password || loading}
                  className="w-full h-11 rounded-xl text-[13px] font-bold tracking-wide text-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                  style={{ background: 'linear-gradient(135deg,#ca8a04,#a16207)', boxShadow: loading || (!email || !password) ? 'none' : '0 4px 20px rgba(202,138,4,.35)' }}
                >
                  {loading ? (
                    <div className="w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} />
                  ) : (
                    <>Continue <ArrowRight size={15} /></>
                  )}
                </button>
              </form>

              {/* divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: '#131c2e' }} />
                <span className="text-[11px]" style={{ color: '#1e2d40' }}>or</span>
                <div className="flex-1 h-px" style={{ background: '#131c2e' }} />
              </div>

              {/* SSO */}
              <button
                onClick={() => loginWithRedirect()}
                disabled={ssoLoading}
                className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border text-[13px] transition-all text-white/60 hover:text-white hover:border-[#2a3a52] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: '#1a2536', background: '#0a0f1a' }}
              >
                {ssoLoading ? (
                  <div className="w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,.1)', borderTopColor: 'rgba(255,255,255,.5)' }} />
                ) : (
                  'Continue with SSO'
                )}
              </button>

              <p className="text-center text-[12px] mt-5" style={{ color: '#2d4060' }}>
                Need access?{' '}
                <a href="#" className="font-semibold hover:underline" style={{ color: '#ca8a04' }}>Contact your admin</a>
              </p>
            </div>
          )}

          {/* ── Stage: Role selection ── */}
          {stage === 'role' && (
            <div style={{ animation: 'panelIn .3s ease' }}>
              <div className="mb-5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4" style={{ background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.18)' }}>
                  <Check size={13} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-[11.5px] font-medium text-emerald-400 truncate">Authenticated · {email}</span>
                </div>
                <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">Select your role</h1>
                <p className="text-[12.5px]" style={{ color: '#3d5570' }}>
                  Choose how you'd like to access {tenant ? <><strong className="text-white/60">{tenant.name}</strong>'s workspace.</> : <>your workspace.</>}
                </p>
              </div>

              <div className="flex flex-col gap-2 mb-5">
                {ROLES.map(r => {
                  const Icon = r.icon
                  const selected = role === r.id
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl border text-left transition-all"
                      style={{
                        background: selected ? `${r.color}10` : '#090e1a',
                        borderColor: selected ? r.color : '#192030',
                        boxShadow: selected ? `0 0 0 1px ${r.color}30` : 'none',
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all" style={{ background: selected ? r.color : '#111926' }}>
                        <Icon size={14} style={{ color: selected ? '#000' : '#3a5070' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12.5px] font-semibold text-white">{r.label}</span>
                          <span className="text-[9px] font-bold px-1.5 py-px rounded-full" style={{ background: `${r.color}1a`, color: r.color }}>{r.badge}</span>
                        </div>
                        <p className="text-[11px] leading-snug" style={{ color: '#3d5570' }}>{r.desc}</p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ borderColor: selected ? r.color : '#1e2d40', background: selected ? r.color : 'transparent' }}
                      >
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { setStage('credentials'); setRole(null) }}
                  className="h-11 px-5 rounded-xl border text-[13px] font-semibold transition-all hover:border-[#2a3a52]"
                  style={{ borderColor: '#192030', color: '#5a7a98', background: 'transparent' }}
                >
                  Back
                </button>
                <button
                  onClick={handleLogin}
                  disabled={!role || loading}
                  className="flex-1 h-11 rounded-xl text-[13px] font-bold text-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#ca8a04,#a16207)', boxShadow: role && !loading ? '0 4px 20px rgba(202,138,4,.35)' : 'none' }}
                >
                  {loading ? (
                    <div className="w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} />
                  ) : (
                    <>Enter workspace <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  )
}
