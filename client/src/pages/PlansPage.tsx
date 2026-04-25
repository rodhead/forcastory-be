// src/pages/PlansPage.tsx
// Admin-only: plan management, usage tracking, billing.
import { useState } from 'react'
import { Check, Zap, Shield, Building2, Users, Database, BarChart2, CreditCard, Download } from 'lucide-react'
import { cn } from '@/utils/cn'
import { DashboardLayout } from '@/features/layout/components/DashboardLayout'
import { useToast } from '@/features/layout/store/toast.hook'
import { Badge } from '@/components/ui/Badge'

// ─── Plan data ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹0',
    period: '/month',
    description: 'For individuals and small teams exploring forecasting.',
    current: false,
    color: 'border-[var(--s4)]',
    badge: null,
    features: ['3 projects', '5 experiments/month', '50,000 records', '3 models', 'Email support', 'CSV export'],
    limits: { projects: 3, experiments: 5, records: 50000, users: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹4,999',
    period: '/month',
    description: 'For growing teams needing more capacity and models.',
    current: true,
    color: 'border-[var(--a1)]',
    badge: 'Current plan',
    features: ['15 projects', '100 experiments/month', '500,000 records', '15 models', 'Priority support', 'All export formats', 'API access', 'Ensemble methods'],
    limits: { projects: 15, experiments: 100, records: 500000, users: 5 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited capacity, dedicated support, SLA guarantee.',
    current: false,
    color: 'border-[var(--s4)]',
    badge: null,
    features: ['Unlimited projects', 'Unlimited experiments', 'Unlimited records', 'All 20 models', 'Dedicated support', 'SLA 99.9%', 'SSO/SAML', 'Custom integrations', 'On-premise option'],
    limits: { projects: Infinity, experiments: Infinity, records: Infinity, users: Infinity },
  },
]

const USAGE = [
  { label: 'Projects', used: 3,      limit: 15,     unit: '' },
  { label: 'Experiments this month', used: 12, limit: 100, unit: '' },
  { label: 'Records stored', used: 163568, limit: 500000, unit: '' },
  { label: 'Team members', used: 4,   limit: 5,      unit: '' },
]

const INVOICES = [
  { id: 'INV-2024-06', date: 'Jun 1, 2024',  amount: '₹4,999', status: 'paid'    },
  { id: 'INV-2024-05', date: 'May 1, 2024',  amount: '₹4,999', status: 'paid'    },
  { id: 'INV-2024-04', date: 'Apr 1, 2024',  amount: '₹4,999', status: 'paid'    },
  { id: 'INV-2024-03', date: 'Mar 1, 2024',  amount: '₹3,499', status: 'paid'    },
]

// ─── Components ───────────────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-5 shadow-[var(--d1)]', className)}>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={16} className="text-[var(--a1)]" />}
      <h2 className="text-[14px] font-bold text-[var(--t1)]">{children}</h2>
    </div>
  )
}

function UsageBar({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) {
  const pct = Math.min((used / limit) * 100, 100)
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)
  const isWarning = pct > 75
  const isCritical = pct > 90

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5 text-[12px]">
        <span className="text-[var(--t2)] font-medium">{label}</span>
        <span className={cn('font-semibold font-mono', isCritical ? 'text-[var(--er)]' : isWarning ? 'text-[var(--wa)]' : 'text-[var(--t1)]')}>
          {fmt(used)}{unit} / {limit === Infinity ? '∞' : fmt(limit)}{unit}
        </span>
      </div>
      <div className="h-2 bg-[var(--s3)] rounded-full overflow-hidden shadow-[var(--di)]">
        <div
          className={cn('h-full rounded-full transition-[width]', isCritical ? 'bg-[var(--er)]' : isWarning ? 'bg-[var(--wa)]' : 'bg-[var(--a1)]')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PlansPage() {
  const toast = useToast()
  const [tab, setTab] = useState<'overview' | 'usage' | 'billing' | 'invoices'>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'usage',    label: 'Usage'    },
    { id: 'billing',  label: 'Billing'  },
    { id: 'invoices', label: 'Invoices' },
  ] as const

  return (
    <DashboardLayout
      topAction={
        <button
          onClick={() => toast.info('Contact sales', 'Opening sales contact form.')}
          className="h-[30px] px-3.5 rounded-lg bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors shadow-[0_2px_8px_var(--a4)]"
        >
          Contact sales
        </button>
      }
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Plans &amp; billing</h1>
          <p className="text-[12px] text-[var(--t2)] mt-0.5">Manage your subscription, usage, and invoices</p>
        </div>
      </div>

      {/* Current plan banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--a3)] border border-[var(--a4)] mb-5 shadow-[var(--d1)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--a1)] flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-black" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-[var(--t1)]">Pro plan · Active</div>
          <div className="text-[11.5px] text-[var(--t2)] mt-0.5">Next billing date: <strong>Jul 1, 2024</strong> · ₹4,999/month · 4 of 5 seats used</div>
        </div>
        <button onClick={() => toast.info('Manage', 'Opening subscription portal.')} className="h-8 px-4 rounded-lg border border-[var(--s5)] bg-[var(--s1)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors shadow-[var(--d1)]">
          Manage subscription
        </button>
      </div>

      {/* Inline tabs (not subbar — page controls its own tabs here) */}
      <div className="flex gap-0.5 mb-5 bg-[var(--s2)] rounded-lg p-1 w-fit shadow-[var(--di)]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 h-7 rounded-md text-[12px] font-semibold transition-all',
              tab === t.id ? 'bg-[var(--s1)] text-[var(--t1)] shadow-[var(--d1)]' : 'text-[var(--t3)] hover:text-[var(--t2)]'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={cn('relative rounded-xl border-2 p-5 bg-[var(--s1)] shadow-[var(--d1)] flex flex-col', plan.color, plan.current && 'shadow-[var(--d2)]')}>
              {plan.badge && (
                <div className="absolute -top-3 left-4">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--a1)] text-black text-[10px] font-bold shadow-[0_2px_8px_var(--a4)]">{plan.badge}</span>
                </div>
              )}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--s2)] flex items-center justify-center border border-[var(--s4)]">
                    {plan.id === 'starter'    && <Users    size={14} className="text-[var(--t3)]" />}
                    {plan.id === 'pro'        && <Zap      size={14} className="text-[var(--a1)]" />}
                    {plan.id === 'enterprise' && <Building2 size={14} className="text-[var(--t2)]" />}
                  </div>
                  <span className="text-[14px] font-bold text-[var(--t1)]">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[26px] font-bold text-[var(--t1)] tracking-tight">{plan.price}</span>
                  <span className="text-[12px] text-[var(--t3)]">{plan.period}</span>
                </div>
                <p className="text-[11.5px] text-[var(--t3)] leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex-1 mb-5">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 py-1">
                    <Check size={12} className="text-[var(--a1)] flex-shrink-0" />
                    <span className="text-[11.5px] text-[var(--t2)]">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => plan.current ? toast.info('Current plan', 'You are already on this plan.') : toast.success('Upgrade initiated', `Switching to ${plan.name}…`)}
                className={cn(
                  'w-full h-9 rounded-lg text-[12px] font-bold transition-all',
                  plan.current
                    ? 'bg-[var(--s2)] border border-[var(--s4)] text-[var(--t3)] cursor-default'
                    : plan.id === 'enterprise'
                    ? 'bg-[var(--t1)] text-[var(--s1)] hover:opacity-90'
                    : 'bg-[var(--a1)] text-black hover:bg-[var(--a2)]'
                )}
              >
                {plan.current ? 'Current plan' : plan.id === 'enterprise' ? 'Contact sales' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Usage ── */}
      {tab === 'usage' && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <SectionTitle icon={BarChart2}>Resource usage</SectionTitle>
            {USAGE.map(u => <UsageBar key={u.label} {...u} />)}
          </Card>
          <Card>
            <SectionTitle icon={Database}>Storage breakdown</SectionTitle>
            {[
              { label: 'Historical data files', size: '3.2 GB', pct: 64 },
              { label: 'Experiment outputs',    size: '1.4 GB', pct: 28 },
              { label: 'Metadata & configs',    size: '0.4 GB', pct: 8  },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[var(--s3)] last:border-b-0 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--a1)] flex-shrink-0" />
                  <span className="text-[var(--t2)]">{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--t3)] text-[11px]">{s.pct}%</span>
                  <span className="font-bold font-mono text-[var(--t1)]">{s.size}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Billing ── */}
      {tab === 'billing' && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <SectionTitle icon={CreditCard}>Payment method</SectionTitle>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--s2)] border border-[var(--s4)] mb-3">
              <div className="w-10 h-7 rounded-md bg-[var(--t1)] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white">VISA</span>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-[var(--t1)]">Visa ending in 4242</div>
                <div className="text-[11px] text-[var(--t3)]">Expires 09/2026</div>
              </div>
              <button onClick={() => toast.info('Update', 'Opening payment portal.')} className="ml-auto text-[11px] text-[var(--a1)] hover:underline font-semibold">Update</button>
            </div>
            <button onClick={() => toast.info('Add card', 'Opening card form.')} className="w-full h-8 rounded-lg border border-dashed border-[var(--s5)] text-[12px] font-semibold text-[var(--t3)] hover:text-[var(--t2)] hover:border-[var(--a4)] transition-colors">
              + Add payment method
            </button>
          </Card>
          <Card>
            <SectionTitle icon={Shield}>Billing details</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[var(--t2)] mb-1 block">Company name</label>
                <input defaultValue="Ganit Inc." className="w-full h-9 px-3 rounded-lg bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none focus:border-[var(--a1)] shadow-[var(--di)] transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[var(--t2)] mb-1 block">GST / Tax ID</label>
                <input defaultValue="27AAACG0569G1ZL" className="w-full h-9 px-3 rounded-lg bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] font-mono outline-none focus:border-[var(--a1)] shadow-[var(--di)] transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[var(--t2)] mb-1 block">Billing email</label>
                <input defaultValue="billing@ganitinc.com" className="w-full h-9 px-3 rounded-lg bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] outline-none focus:border-[var(--a1)] shadow-[var(--di)] transition-all" />
              </div>
              <button onClick={() => toast.success('Saved', 'Billing details updated.')} className="h-9 rounded-lg bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors">Save details</button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Invoices ── */}
      {tab === 'invoices' && (
        <Card>
          <SectionTitle>Invoice history</SectionTitle>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {['Invoice ID','Date','Amount','Status',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-[var(--t3)] uppercase tracking-[.07em] pb-2 border-b border-[var(--s4)] px-2 first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map(inv => (
                <tr key={inv.id} className="hover:bg-[var(--s2)] transition-colors">
                  <td className="py-3 px-2 first:pl-0 font-mono font-semibold text-[var(--t1)] border-b border-[var(--s3)]">{inv.id}</td>
                  <td className="py-3 px-2 text-[var(--t2)] border-b border-[var(--s3)]">{inv.date}</td>
                  <td className="py-3 px-2 font-bold font-mono text-[var(--t1)] border-b border-[var(--s3)]">{inv.amount}</td>
                  <td className="py-3 px-2 border-b border-[var(--s3)]">
                    <Badge variant="blue">{inv.status}</Badge>
                  </td>
                  <td className="py-3 px-2 border-b border-[var(--s3)]">
                    <button onClick={() => toast.success('Downloaded', `${inv.id}.pdf saved.`)} className="flex items-center gap-1 text-[11px] text-[var(--a1)] hover:underline font-semibold">
                      <Download size={11} />PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DashboardLayout>
  )
}
