// src/pages/ProjectsPage.tsx
import { useState, useMemo } from 'react'
import { Plus, Eye, Trash2, Check, Upload, FileText, Sliders, Calendar, BarChart2, Search, X, ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { cn } from '@/utils/cn'
import { PageLoading } from '@/components/shared/Loading'
import { DashboardLayout } from '@/features/layout/components/DashboardLayout'
import { Modal, ModalActions } from '@/components/shared/Modal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from '@tanstack/react-router'
import { useProjects, useDeleteProject } from '@/features/projects/queries/projects.queries'
import { useLayoutStore } from '@/features/layout/store/layout.store'
import { useToast } from '@/features/layout/store/toast.hook'
import { useCreateNewProjectQuery, useProjectPageData } from '@/queries/project.queries'
import type { ProjectPageData } from '@/services/projectPageService'
import type { Project } from '@/types/common'

const INDUSTRY_BADGE: Record<string, 'blue' | 'warn' | 'blue' | 'gray'> = {
  Retail: 'blue', CPG: 'warn', QSR: 'blue', Manufacturing: 'gray',
}

function ProjectCard({
  project,
  isActive,
  onSelect,
  onDelete,
  onDetail,
}: {
  project: Project
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onDetail: () => void
}) {
  const fmt = (n: number) => n.toLocaleString('en-IN')

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-[var(--s1)] border rounded-[var(--rl)] p-3.5 cursor-pointer',
        'grid grid-cols-[1fr_auto_auto_auto] gap-3.5 items-center',
        'shadow-[var(--d1)] transition-all duration-150',
        isActive
          ? 'border-[var(--a4)] shadow-[0_0_0_3px_var(--a3),var(--d2)]'
          : 'border-[var(--s4)] hover:border-[var(--a4)] hover:shadow-[var(--d2)] hover:-translate-y-px'
      )}
    >
      <div>
        <div className="text-[13px] font-bold text-[var(--t1)] mb-0.5">{project.name}</div>
        <div className="text-[11.5px] text-[var(--t2)]">{project.description}</div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <Badge variant={INDUSTRY_BADGE[project.industry] ?? 'gray'}>{project.industry}</Badge>
          <Badge variant="gray">{project.purpose}</Badge>
          <Badge variant="gray" className="capitalize">{project.granularity}</Badge>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[14px] font-bold text-[var(--t1)]">{fmt(project.recordCount)}</div>
        <div className="text-[10px] text-[var(--t3)] font-medium">records</div>
      </div>
      <div className="text-right">
        <div className="text-[14px] font-bold text-[var(--t1)]">{fmt(project.combinations)}</div>
        <div className="text-[10px] text-[var(--t3)] font-medium">combinations</div>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation() }}
          className={cn(
            'h-[26px] px-2.5 rounded-md border text-[11px] font-bold transition-all',
            isActive
              ? 'bg-[var(--a1)] border-[var(--a1)] text-white'
              : 'bg-[var(--s1)] border-[var(--s5)] text-[var(--t3)] hover:border-[var(--a4)] hover:text-[var(--a1)] hover:bg-[var(--a3)]'
          )}
        >
          {isActive ? '✓ Active' : 'Select'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDetail() }}
          className="w-[26px] h-[26px] rounded-md border border-[var(--s4)] bg-[var(--s1)] flex items-center justify-center text-[var(--t3)] hover:text-[var(--a1)] hover:bg-[var(--a3)] hover:border-[var(--a4)] transition-all shadow-[var(--d1)]"
          title="View project details"
        >
          <Eye size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (!isActive) onDelete() }}
          className={cn(
            'w-[26px] h-[26px] rounded-md border border-[var(--s4)] bg-[var(--s1)] flex items-center justify-center transition-all shadow-[var(--d1)]',
            isActive
              ? 'opacity-30 cursor-not-allowed text-[var(--t4)]'
              : 'text-[var(--t3)] hover:bg-[var(--er-t)] hover:text-[var(--er)] hover:border-[var(--er-b)]'
          )}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

// ─── Shared field styles ──────────────────────────────────────────────────────
const inputCls = 'w-full h-9 px-3 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none focus:border-[var(--a1)] focus:shadow-[0_0_0_3px_var(--a3)] transition-all shadow-[var(--di)]'
const selectCls = inputCls + ' appearance-none cursor-pointer'
const labelCls = 'text-[11px] font-semibold text-[var(--t2)] mb-1.5 block'

const WIZARD_STEPS = [
  { id: 1, title: 'Project details',   desc: 'Name, industry and source data' },
  { id: 2, title: 'Configuration',     desc: 'Forecast settings and defaults'  },
  { id: 3, title: 'Review',            desc: 'Confirm and create'              },
]

// ─── Step 1: Project details ──────────────────────────────────────────────────
function Step1({
  name, setName, desc, setDesc, industryId, setIndustryId, purposeId, setPurposeId, granularityId, setGranularityId, pageData,
}: {
  name: string;        setName:           (v: string) => void
  desc: string;        setDesc:           (v: string) => void
  industryId: string;  setIndustryId:     (v: string) => void
  purposeId: string;   setPurposeId:      (v: string) => void
  granularityId: string; setGranularityId:(v: string) => void
  pageData: ProjectPageData
}) {
  const taken = ['Retail_Demand_Q2_2024', 'CPG_Inventory_Planning', 'QSR_Production_Planning']
  const nameError = taken.includes(name) ? 'Name already exists' : ''
  const nameOk    = name.length > 0 && !nameError

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-bold text-[var(--t1)] mb-0.5">Project details</h2>
        <p className="text-[12px] text-[var(--t3)]">Basic information about your forecasting project.</p>
      </div>

      <div>
        <label className={labelCls}>Project name <span className="text-[var(--er)]">*</span></label>
        <input
          className={cn(inputCls, nameOk && 'border-[var(--a1)]', nameError && 'border-[var(--er)]')}
          placeholder="e.g. Retail_Q3_2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && <p className="text-[10.5px] text-[var(--er)] mt-1 font-semibold">⚠ {nameError}</p>}
        {nameOk    && <p className="text-[10.5px] text-[var(--a1)] mt-1 font-semibold">✓ Name available</p>}
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={inputCls + ' !h-16 py-2 resize-none'}
          placeholder="Brief description of the project"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Industry <span className="text-[var(--er)]">*</span></label>
          <select className={selectCls} value={industryId} onChange={(e) => setIndustryId(e.target.value)}>
            <option value="">Select industry</option>
            {pageData.industries.map((o) => <option key={o.id} value={o.id}>{o.value}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Purpose <span className="text-[var(--er)]">*</span></label>
          <select className={selectCls} value={purposeId} onChange={(e) => setPurposeId(e.target.value)}>
            <option value="">Select purpose</option>
            {pageData.purposes.map((o) => <option key={o.id} value={o.id}>{o.value}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Time granularity <span className="text-[var(--er)]">*</span></label>
        <div className="flex gap-2">
          {pageData.granularities.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setGranularityId(o.id)}
              className={cn(
                'flex-1 h-8 rounded-md border text-[11px] font-semibold capitalize transition-all',
                granularityId === o.id
                  ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)] shadow-[var(--d1)]'
                  : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t3)] hover:border-[var(--a4)] hover:text-[var(--a1)] shadow-[var(--di)]'
              )}
            >
              {o.value}
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-dashed border-[var(--s5)] rounded-[var(--rl)] p-5 text-center cursor-pointer hover:border-[var(--a1)] hover:bg-[var(--a3)] transition-all bg-[var(--s2)] shadow-[var(--di)]">
        <Upload size={18} className="mx-auto mb-2 text-[var(--t4)]" />
        <p className="text-[12.5px] font-semibold text-[var(--t2)]">Drop CSV / Excel here</p>
        <p className="text-[10.5px] text-[var(--t3)] mt-0.5">or click to browse · max 200 MB</p>
      </div>
    </div>
  )
}

// ─── Step 2: Configuration ────────────────────────────────────────────────────
function Step2({
  missingFillId, setMissingFillId, outlierMethodId, setOutlierMethodId,
  horizon, setHorizon, confidenceId, setConfidenceId, calendarId, setCalendarId, pageData,
}: {
  missingFillId: string;    setMissingFillId:    (v: string) => void
  outlierMethodId: string;  setOutlierMethodId:  (v: string) => void
  horizon: number;          setHorizon:          (v: number) => void
  confidenceId: string;     setConfidenceId:     (v: string) => void
  calendarId: string;       setCalendarId:       (v: string) => void
  pageData: ProjectPageData
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-bold text-[var(--t1)] mb-0.5">Configuration</h2>
        <p className="text-[12px] text-[var(--t3)]">Set forecast defaults and data processing rules.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Missing data fill</label>
          <select className={selectCls} value={missingFillId} onChange={(e) => setMissingFillId(e.target.value)}>
            <option value="">Select method</option>
            {pageData.missingFillOptions.map((o) => <option key={o.id} value={o.id}>{o.value}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Outlier detection</label>
          <select className={selectCls} value={outlierMethodId} onChange={(e) => setOutlierMethodId(e.target.value)}>
            <option value="">Select method</option>
            {pageData.outlierMethods.map((o) => <option key={o.id} value={o.id}>{o.value}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Forecast horizon (weeks)</label>
          <input
            type="number"
            min={1} max={104}
            className={inputCls}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>Confidence interval</label>
          <select className={selectCls} value={confidenceId} onChange={(e) => setConfidenceId(e.target.value)}>
            <option value="">Select interval</option>
            {pageData.confidenceIntervals.map((o) => <option key={o.id} value={o.id}>{o.value}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Calendar type</label>
        <div className="flex gap-2">
          {pageData.calendarTypes.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setCalendarId(o.id)}
              className={cn(
                'flex-1 h-8 rounded-md border text-[11px] font-semibold transition-all',
                calendarId === o.id
                  ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)] shadow-[var(--d1)]'
                  : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t3)] hover:border-[var(--a4)] hover:text-[var(--a1)] shadow-[var(--di)]'
              )}
            >
              {o.value}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--s2)] border border-[var(--s4)] rounded-[var(--rl)] p-3.5">
        <div className="text-[11px] font-bold text-[var(--t2)] uppercase tracking-[.07em] mb-2">Auto-run on create</div>
        {[
          { label: 'Data quality check',   hint: 'Validates completeness and consistency' },
          { label: 'Outlier scan',          hint: 'Flags anomalies using selected method'  },
          { label: 'Seasonality detection', hint: 'Detects weekly / yearly patterns'       },
        ].map(({ label, hint }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--s3)] last:border-b-0">
            <div>
              <div className="text-[12px] font-semibold text-[var(--t1)]">{label}</div>
              <div className="text-[10.5px] text-[var(--t3)]">{hint}</div>
            </div>
            <input type="checkbox" defaultChecked className="accent-[var(--a1)] w-4 h-4 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3: Review ──────────────────────────────────────────────────────────
function Step3({
  name, desc, industry, purpose, gran,
  missingFill, outlierMethod, horizon, confidence, calendar,
}: {
  name: string; desc: string
  industry: Project['industry']; purpose: Project['purpose']; gran: Project['granularity']
  missingFill: string; outlierMethod: string; horizon: number; confidence: string; calendar: string
}) {
  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-[var(--s2)] border border-[var(--s4)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--s4)] bg-[var(--s1)]">
        <Icon size={14} className="text-[var(--a1)]" />
        <span className="text-[12px] font-bold text-[var(--t2)] uppercase tracking-[.07em]">{title}</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-0">{children}</div>
    </div>
  )
  const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-[var(--s3)] last:border-b-0">
      <span className="text-[12px] text-[var(--t3)]">{label}</span>
      <span className={cn('text-[12px] font-semibold', highlight ? 'text-[var(--a1)]' : 'text-[var(--t1)]')}>{value || '—'}</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-bold text-[var(--t1)] mb-0.5">Review & confirm</h2>
        <p className="text-[12px] text-[var(--t3)]">Confirm your project settings before creating.</p>
      </div>

      {/* Readiness banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--a3)] border border-[var(--a4)] rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[var(--a1)] flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-white" />
        </div>
        <div>
          <div className="text-[12.5px] font-bold text-[var(--a1)]">Ready to create</div>
          <div className="text-[11px] text-[var(--t3)]">All required fields are complete. Review below and submit.</div>
        </div>
      </div>

      <Section icon={FileText} title="Project details">
        <Field label="Project name"   value={name}                  highlight />
        <Field label="Description"    value={desc || 'Not provided'} />
        <Field label="Industry"       value={industry} />
        <Field label="Purpose"        value={purpose} />
        <Field label="Granularity"    value={gran} />
      </Section>

      <Section icon={Sliders} title="Forecast configuration">
        <Field label="Missing data fill"   value={missingFill} />
        <Field label="Outlier detection"   value={outlierMethod} />
        <Field label="Forecast horizon"    value={`${horizon} weeks`} />
        <Field label="Confidence interval" value={confidence} />
      </Section>

      <Section icon={Calendar} title="Calendar & automation">
        <Field label="Calendar type"             value={calendar} />
        <Field label="Auto data quality check"   value="Enabled" highlight />
        <Field label="Auto outlier scan"         value="Enabled" highlight />
        <Field label="Auto seasonality detection"value="Enabled" highlight />
      </Section>

      <div className="flex items-start gap-2 px-3 py-2.5 bg-[var(--s2)] border border-[var(--s3)] rounded-lg">
        <BarChart2 size={13} className="text-[var(--t4)] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[var(--t3)] leading-relaxed">
          After creation, a full pipeline run (data quality → outliers → seasonality) will start automatically. Results will appear in each step within minutes.
        </p>
      </div>
    </div>
  )
}

// ─── Create Project Wizard ────────────────────────────────────────────────────
function CreateProjectWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutateAsync, isPending } = useCreateNewProjectQuery()
  const { data: pageData, isLoading: pageLoading } = useProjectPageData()
  const toast = useToast()
  const [step, setStep] = useState(1)

  // confirmation dialogs
  const [confirmCancel,    setConfirmCancel]    = useState(false)
  const [confirmSaveDraft, setConfirmSaveDraft] = useState(false)

  // Step 1 fields — store IDs, default to first option once pageData loads
  const [name,          setName]          = useState('')
  const [desc,          setDesc]          = useState('')
  const [industryId,    setIndustryId]    = useState('')
  const [purposeId,     setPurposeId]     = useState('')
  const [granularityId, setGranularityId] = useState('')

  // Step 2 fields — store IDs
  const [missingFillId,   setMissingFillId]   = useState('')
  const [outlierMethodId, setOutlierMethodId] = useState('')
  const [horizon,         setHorizon]         = useState(13)
  const [confidenceId,    setConfidenceId]    = useState('')
  const [calendarId,      setCalendarId]      = useState('')

  // Seed defaults from first option once page data arrives
  const data = pageData ?? { industries: [], purposes: [], granularities: [], missingFillOptions: [], outlierMethods: [], confidenceIntervals: [], calendarTypes: [] }

  function reset() {
    setStep(1); setName(''); setDesc('')
    setIndustryId(data.industries[0]?.id ?? '')
    setPurposeId(data.purposes[0]?.id ?? '')
    setGranularityId(data.granularities[0]?.id ?? '')
    setMissingFillId(data.missingFillOptions[0]?.id ?? '')
    setOutlierMethodId(data.outlierMethods[0]?.id ?? '')
    setHorizon(13)
    setConfidenceId(data.confidenceIntervals[0]?.id ?? '')
    setCalendarId(data.calendarTypes[0]?.id ?? '')
  }

  const taken     = ['Retail_Demand_Q2_2024', 'CPG_Inventory_Planning', 'QSR_Production_Planning']
  const nameError = taken.includes(name) ? 'Name already exists' : ''
  const step1Ok   = name.length > 0 && !nameError

  function canGoToStep(target: number) {
    if (target < step)  return true
    if (target === step + 1) return step !== 1 || step1Ok
    return false
  }

  // Create New Project
  async function handleSubmit() {
    if (!step1Ok) return
    await mutateAsync({
      projectName:     name,
      description:     desc,
      industryId,
      purposeId,
      granularityId,
      missingFillId,
      outlierMethodId,
      horizon,
      confidenceId,
      calendarId,
    })
    toast.success('Project created', `"${name}" created successfully.`)
    reset(); onClose()
  }

  async function handleSaveDraft() {
    if (!step1Ok) { toast.error('Name required', 'Enter a project name before saving as draft.'); return }
    await mutateAsync({ projectName: name, description: desc, industryId, purposeId, granularityId, missingFillId, outlierMethodId, horizon, confidenceId, calendarId })
    toast.info('Saved as draft', `"${name}" saved with inactive status. Activate it from the Projects list.`)
    reset(); onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Cancel confirmation */}
      <ConfirmDialog
        open={confirmCancel}
        title="Discard project?"
        message="All entered information will be lost. This cannot be undone."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="danger"
        onConfirm={() => { setConfirmCancel(false); reset(); onClose() }}
        onCancel={() => setConfirmCancel(false)}
      />

      {/* Save as draft confirmation */}
      <ConfirmDialog
        open={confirmSaveDraft}
        title="Save as draft?"
        message={`"${name || 'This project'}" will be saved with an inactive status. You can activate it later from the Projects list.`}
        confirmLabel="Save as draft"
        cancelLabel="Keep editing"
        variant="info"
        onConfirm={() => { setConfirmSaveDraft(false); handleSaveDraft() }}
        onCancel={() => setConfirmSaveDraft(false)}
      />

      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
        <div className="bg-[var(--s0)] rounded-2xl w-full max-w-[880px] h-[600px] flex overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.35)] border border-[var(--s4)]">

          {/* ── Left: Stepper ── */}
          <div className="w-[240px] flex-shrink-0 bg-[var(--s1)] border-r border-[var(--s4)] p-6 flex flex-col">
            <div className="text-[14px] font-bold text-[var(--t1)] mb-0.5">New project</div>
            <div className="text-[11px] text-[var(--t3)] mb-8">Complete all steps to create your project.</div>

            <div className="flex flex-col">
              {WIZARD_STEPS.map((s, i) => {
                const done      = step > s.id
                const active    = step === s.id
                const clickable = canGoToStep(s.id) && !active
                return (
                  <div key={s.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        disabled={!clickable && !active}
                        onClick={() => clickable && setStep(s.id)}
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-200',
                          done   ? 'bg-[var(--a1)] text-white hover:opacity-80' :
                          active ? 'bg-[var(--a1)] text-white ring-4 ring-[var(--a3)]' :
                                   'bg-[var(--s3)] text-[var(--t3)] border border-[var(--s5)]',
                          clickable ? 'cursor-pointer' : 'cursor-default'
                        )}
                      >
                        {done ? <Check size={12} /> : s.id}
                      </button>
                      {i < WIZARD_STEPS.length - 1 && (
                        <div className={cn('w-px my-1.5 flex-1 min-h-[36px] transition-colors duration-200', done ? 'bg-[var(--a1)]' : 'bg-[var(--s4)]')} />
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!clickable && !active}
                      onClick={() => clickable && setStep(s.id)}
                      className={cn(
                        'text-left pb-9 transition-opacity',
                        i === WIZARD_STEPS.length - 1 && 'pb-0',
                        clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                      )}
                    >
                      <div className={cn('text-[12.5px] font-semibold leading-tight', active || done ? 'text-[var(--t1)]' : 'text-[var(--t3)]')}>{s.title}</div>
                      <div className="text-[11px] text-[var(--t3)] mt-0.5 leading-snug">{s.desc}</div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right: Content ── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-6">
              {pageLoading ? (
                <div className="flex items-center justify-center h-40 text-[12px] text-[var(--t3)]">Loading options…</div>
              ) : (
                <>
                  {step === 1 && (
                    <Step1
                      name={name} setName={setName}
                      desc={desc} setDesc={setDesc}
                      industryId={industryId}       setIndustryId={setIndustryId}
                      purposeId={purposeId}         setPurposeId={setPurposeId}
                      granularityId={granularityId} setGranularityId={setGranularityId}
                      pageData={data}
                    />
                  )}
                  {step === 2 && (
                    <Step2
                      missingFillId={missingFillId}     setMissingFillId={setMissingFillId}
                      outlierMethodId={outlierMethodId} setOutlierMethodId={setOutlierMethodId}
                      horizon={horizon}                 setHorizon={setHorizon}
                      confidenceId={confidenceId}       setConfidenceId={setConfidenceId}
                      calendarId={calendarId}           setCalendarId={setCalendarId}
                      pageData={data}
                    />
                  )}
                  {step === 3 && (
                    <Step3
                      name={name} desc={desc}
                      industry={industryId} purpose={purposeId} gran={granularityId}
                      missingFill={missingFillId} outlierMethod={outlierMethodId}
                      horizon={horizon} confidence={confidenceId} calendar={calendarId}
                    />
                  )}
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 border-t border-[var(--s4)] px-6 py-4 flex items-center justify-between bg-[var(--s1)]">
              {/* Left: Cancel */}
              <button
                onClick={() => setConfirmCancel(true)}
                className="h-8 px-4 rounded-md border border-[var(--s5)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors"
              >
                Cancel
              </button>

              {/* Right: Save as draft + navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => step1Ok ? setConfirmSaveDraft(true) : toast.error('Name required', 'Enter a project name before saving as draft.')}
                  className="h-8 px-4 rounded-md border border-[var(--s5)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors"
                >
                  Save as draft
                </button>

                <div className="w-px h-5 bg-[var(--s4)]" />

                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="h-8 px-4 rounded-md border border-[var(--s5)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors"
                  >
                    Back
                  </button>
                )}
                {step < 3 && (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    disabled={step === 1 && !step1Ok}
                    className="h-8 px-4 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--a2)] transition-colors shadow-[0_2px_8px_rgba(74,111,165,.25)]"
                  >
                    Next
                  </button>
                )}
                {step === 3 && (
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="h-8 px-5 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--a2)] transition-colors shadow-[0_2px_8px_rgba(74,111,165,.25)]"
                  >
                    {isPending ? 'Creating…' : 'Create project'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Recent Tab ───────────────────────────────────────────────────────────────
function RecentTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-4">
        <Edit size={20} className="text-[var(--t4)]" />
      </div>
      <div className="text-[14px] font-bold text-[var(--t2)] mb-1">No recent activity</div>
      <div className="text-[12px] text-[var(--t3)]">Recently opened projects and experiments will appear here.</div>
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-4">
        <Plus size={20} className="text-[var(--t4)]" />
      </div>
      <div className="text-[14px] font-bold text-[var(--t2)] mb-1">Analytics coming soon</div>
      <div className="text-[12px] text-[var(--t3)]">Aggregate project performance and usage metrics will appear here.</div>
    </div>
  )
}

type SortField = 'name' | 'recordCount' | 'combinations' | 'updatedAt'

function SortBtn({ field, label, sortField, sortDir, onToggle }: {
  field: SortField; label: string
  sortField: SortField; sortDir: 'asc' | 'desc'
  onToggle: (f: SortField) => void
}) {
  return (
    <button
      onClick={() => onToggle(field)}
      className={cn(
        'flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.07em] transition-colors select-none',
        sortField === field ? 'text-[var(--a1)]' : 'text-[var(--t3)] hover:text-[var(--t2)]'
      )}
    >
      {label}
      {sortField === field
        ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
        : <ChevronDown size={11} className="opacity-40" />}
    </button>
  )
}

// ─── Projects Page ────────────────────────────────────────────────────────────
export function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const { mutateAsync: deleteProject } = useDeleteProject()
  const { activeProjectId, setActiveProjectId, createProjectOpen, setCreateProjectOpen, projectsTab, setProjectsTab } = useLayoutStore()
  const toast    = useToast()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const activeTab = projectsTab
  const setActiveTab = setProjectsTab

  // Search & filter state
  const [search, setSearch]             = useState('')
  const [filterIndustry, setFilterIndustry] = useState<string>('All')
  const [filterStatus, setFilterStatus]   = useState<string>('All')
  const [sortField, setSortField]         = useState<SortField>('name')
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('asc')

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let result = [...projects]
    if (search.trim())          result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    if (filterIndustry !== 'All') result = result.filter(p => p.industry === filterIndustry)
    if (filterStatus   !== 'All') result = result.filter(p => p.status   === filterStatus)
    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'name')         cmp = a.name.localeCompare(b.name)
      else if (sortField === 'recordCount')   cmp = a.recordCount - b.recordCount
      else if (sortField === 'combinations')  cmp = a.combinations - b.combinations
      else if (sortField === 'updatedAt')     cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [projects, search, filterIndustry, filterStatus, sortField, sortDir])

  const stats = [
    { label: 'Total projects', value: projects.length },
    { label: 'Experiments',    value: 12             },
    { label: 'Avg accuracy',   value: '87.4%'        },
    { label: 'Total records',  value: '284k'         },
  ]


  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteProject(deleteTarget.id)
    toast.success('Deleted', `"${deleteTarget.name}" moved to Trash.`)
    setDeleteTarget(null)
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <CreateProjectWizard open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete project?" size="sm">
        <p className="text-[12px] text-[var(--t2)] mb-4">
          This will move <strong>"{deleteTarget?.name}"</strong> to Trash. You can restore it later.
        </p>
        <ModalActions>
          <button onClick={() => setDeleteTarget(null)} className="px-3 h-8 rounded-md border border-[var(--s5)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">
            Cancel
          </button>
          <button onClick={confirmDelete} className="px-3 h-8 rounded-md bg-[var(--er-t)] border border-[var(--er-b)] text-[var(--er)] text-[12px] font-semibold hover:opacity-80 transition-opacity">
            Delete
          </button>
        </ModalActions>
      </Modal>

      {activeTab === 'recent' && <RecentTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}

      {activeTab === 'overview' && <>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Projects</h1>
            <p className="text-[12px] text-[var(--t2)] mt-0.5">Manage forecasting workspaces · {projects.length} projects</p>
          </div>
          <button
            onClick={() => setCreateProjectOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold hover:bg-[var(--a2)] transition-colors shadow-[0_2px_8px_rgba(74,111,165,.3)]"
          >
            <Plus size={13} /> New project
          </button>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-3.5 shadow-[var(--d1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--rl)] bg-[var(--a1)]" />
              <div className="text-[9.5px] font-bold text-[var(--t3)] uppercase tracking-[.07em] mb-1">{s.label}</div>
              <div className="text-[22px] font-bold text-[var(--t1)] tracking-tight leading-none">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search / filter / sort toolbar */}
        <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] shadow-[var(--d1)] mb-3 overflow-hidden">
          {/* Search row */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--s3)]">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--t4)] pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects by name or description…"
                className={cn(inputCls, 'pl-8')}
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--t4)] hover:text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
          {/* Filter chips + sort row */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Industry filter */}
              <span className="text-[10px] font-semibold text-[var(--t4)] uppercase tracking-[.07em]">Industry:</span>
              {['All', 'Retail', 'CPG', 'QSR', 'Manufacturing'].map(ind => (
                <button
                  key={ind}
                  onClick={() => setFilterIndustry(ind)}
                  className={cn(
                    'h-6 px-2.5 rounded-full text-[10.5px] font-semibold border transition-all',
                    filterIndustry === ind
                      ? 'bg-[var(--a1)] border-[var(--a1)] text-white'
                      : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)] hover:text-[var(--a1)]'
                  )}
                >{ind}</button>
              ))}
            </div>
            <div className="w-px h-4 bg-[var(--s4)]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-[var(--t4)] uppercase tracking-[.07em]">Status:</span>
              {['All', 'active', 'idle'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={cn(
                    'h-6 px-2.5 rounded-full text-[10.5px] font-semibold border capitalize transition-all',
                    filterStatus === st
                      ? 'bg-[var(--a1)] border-[var(--a1)] text-white'
                      : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)] hover:text-[var(--a1)]'
                  )}
                >{st}</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] font-semibold text-[var(--t4)] uppercase tracking-[.07em]">Sort:</span>
              <SortBtn field="name"         label="Name"       sortField={sortField} sortDir={sortDir} onToggle={toggleSort} />
              <SortBtn field="recordCount"  label="Records"    sortField={sortField} sortDir={sortDir} onToggle={toggleSort} />
              <SortBtn field="combinations" label="Combos"     sortField={sortField} sortDir={sortDir} onToggle={toggleSort} />
              <SortBtn field="updatedAt"    label="Updated"    sortField={sortField} sortDir={sortDir} onToggle={toggleSort} />
            </div>
          </div>
          {/* Active filter summary */}
          {(search || filterIndustry !== 'All' || filterStatus !== 'All') && (
            <div className="px-3 py-1.5 bg-[var(--a3)] border-t border-[var(--a4)] flex items-center gap-2 text-[11px] text-[var(--a1)] font-semibold">
              Showing {filtered.length} of {projects.length} projects
              <button onClick={() => { setSearch(''); setFilterIndustry('All'); setFilterStatus('All') }} className="ml-auto text-[10.5px] font-bold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>

        {isLoading ? (
          <PageLoading message="Loading projects…" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] shadow-[var(--d1)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-3">
              <Search size={18} className="text-[var(--t4)]" />
            </div>
            <div className="text-[13px] font-bold text-[var(--t2)] mb-1">No projects found</div>
            <div className="text-[12px] text-[var(--t3)]">Try adjusting your search or filters.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isActive={p.id === activeProjectId}
                onSelect={() => { setActiveProjectId(p.id); toast.success('Activated', `"${p.name}" is now active.`) }}
                onDelete={() => setDeleteTarget(p)}
                onDetail={() => navigate({ to: `/dashboard/projects/${p.id}` as never })}
              />
            ))}
          </div>
        )}
      </>}
    </DashboardLayout>
  )
}
