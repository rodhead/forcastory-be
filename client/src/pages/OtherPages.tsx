// src/pages/OtherPages.tsx
// File manager, Support, Settings, Admin, Profile, Preferences
import { useState, useMemo } from 'react'
import {
  Download, Trash2, Folder, FileText, Upload, Plus, ChevronDown, Check,
  HelpCircle, AlertCircle, Tag, MessageSquare, X, Shield,
  Grid, List, ChevronRight, FolderOpen, Eye, FolderPlus, HardDrive, Search,
  Users, UserPlus, Activity, Server, ShieldCheck, BarChart2, Pencil,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { supportMessages } from './support.message'
import { PageLoading } from '@/components/shared/Loading'
import { cn } from '@/utils/cn'
import { DashboardLayout } from '@/features/layout/components/DashboardLayout'
import { useLayoutStore } from '@/features/layout/store/layout.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useToast } from '@/features/layout/store/toast.hook'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { useFiles, useFileContent } from '@/features/filemanager/queries/files.queries'
import { useTickets, useCreateTicket } from '@/features/support/queries/support.queries'
import { useUsers } from '@/features/admin/queries/admin.queries'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { ProjectFile, User } from '@/types/common'

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)]', className)}>{children}</div>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-bold text-[var(--t1)] mb-3">{children}</div>
}
function SectionHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-[12.5px] font-bold text-[var(--t1)] mb-2.5 pb-2 border-b border-[var(--s3)]', className)}>{children}</div>
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--s3)] last:border-b-0">
      <div className="text-[12.5px] font-semibold text-[var(--t1)]">{label}</div>
      {children}
    </div>
  )
}
function Toggle({ id, defaultOn }: { id?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <button onClick={() => setOn((p) => !p)} id={id}
      className={cn('w-8 h-[18px] rounded-full relative transition-colors', on ? 'bg-[var(--a1)]' : 'bg-[var(--s5)]')}>
      <span className={cn('absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-[left]', on ? 'left-[17px]' : 'left-[2px]')} />
    </button>
  )
}
const inputCls = 'w-full h-9 px-3 rounded-md bg-[var(--s2)] border border-[var(--s4)] text-[12px] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none focus:border-[var(--a1)] focus:shadow-[0_0_0_3px_var(--a3)] shadow-[var(--di)] transition-all'
const selectCls = inputCls + ' appearance-none cursor-pointer'

// ─── Spreadsheet viewer ───────────────────────────────────────────────────────
function SpreadsheetViewer({ fileId }: { fileId: string }) {
  const { data, isLoading } = useFileContent(fileId)
  if (isLoading) return <div className="p-4"><PageLoading message="Loading file content…" /></div>
  if (!data) return null
  return (
    <div className="overflow-auto max-h-[320px]">
      <table className="border-collapse w-max min-w-full text-[11px]">
        <thead>
          <tr>
            <th className="bg-[var(--s3)] border border-[var(--s4)] px-3 py-1.5 text-[10px] font-bold text-[var(--t3)] text-center min-w-[36px] sticky top-0 z-10">#</th>
            {data.headers.map((h: string) => (
              <th key={h} className="bg-[var(--s2)] border border-[var(--s4)] px-3 py-1.5 text-left text-[10px] font-bold text-[var(--t2)] sticky top-0 z-10 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: string[], ri: number) => (
            <tr key={ri} className="hover:[&>td:not(.ri)]:bg-[var(--a3)]">
              <td className="ri bg-[var(--s2)] border border-[var(--s4)] px-3 py-1 text-center text-[var(--t4)] font-bold sticky left-0 border-r-2">{ri + 1}</td>
              {row.map((cell, ci) => {
                const isNum = /^[\d,\\.%+\-]+$/.test(cell) && cell !== '—'
                return (
                  <td key={ci} className={cn('border border-[var(--s3)] px-3 py-1 font-mono text-[var(--t2)] whitespace-nowrap', isNum && 'text-right', cell === '—' && 'text-[var(--t4)]')}>
                    {cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Folder tree node (recursive) ────────────────────────────────────────────
function FolderTreeNode({
  file, depth, parentPath, currentPath, onNavigate,
}: {
  file: ProjectFile
  depth: number
  parentPath: string[]
  currentPath: string[]
  onNavigate: (path: string[]) => void
}) {
  const myPath = [...parentPath, file.id]
  const isSelected = myPath.length === currentPath.length && myPath.every((id, i) => id === currentPath[i])
  const subFolders = file.children?.filter(c => c.type === 'folder') ?? []
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => { onNavigate(myPath); if (subFolders.length) setOpen(p => !p) }}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        className={cn(
          'w-full flex items-center gap-1.5 h-[28px] pr-3 text-left transition-colors',
          isSelected
            ? 'bg-[var(--a3)] text-[var(--a1)]'
            : 'text-[var(--t2)] hover:bg-[var(--s2)] hover:text-[var(--t1)]',
        )}
      >
        {subFolders.length > 0
          ? <ChevronRight size={10} className={cn('flex-shrink-0 text-[var(--t4)] transition-transform duration-150', open && 'rotate-90')} />
          : <span className="w-2.5 flex-shrink-0" />}
        {(open || isSelected)
          ? <FolderOpen size={12} className="flex-shrink-0 text-[var(--a1)]" />
          : <Folder size={12} className="flex-shrink-0 text-[var(--t4)]" />}
        <span className="text-[11.5px] font-medium truncate">{file.name}</span>
        {file.children && (
          <span className="ml-auto text-[9px] font-bold px-1.5 py-px rounded-full bg-[var(--s3)] text-[var(--t4)]">
            {file.children.length}
          </span>
        )}
      </button>
      {open && subFolders.map(child => (
        <FolderTreeNode
          key={child.id}
          file={child}
          depth={depth + 1}
          parentPath={myPath}
          currentPath={currentPath}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

// ─── FILE MANAGER PAGE ────────────────────────────────────────────────────────
export function FileManagerPage() {
  const activeProjectId = useLayoutStore((s) => s.activeProjectId)
  const { data: files = [], isLoading } = useFiles(activeProjectId)
  const toast = useToast()

  const [currentPath, setCurrentPath]       = useState<string[]>([])
  const [viewMode,    setViewMode]          = useState<'list' | 'grid'>('list')
  const [search,      setSearch]            = useState('')
  const [showNewFolder, setShowNewFolder]   = useState(false)
  const [newFolderName, setNewFolderName]   = useState('')
  const [openTabs,    setOpenTabs]          = useState<string[]>([])
  const [activeViewTab, setActiveViewTab]   = useState<string | null>(null)

  // flatten for viewer lookup
  function flatten(items: ProjectFile[]): ProjectFile[] {
    return items.flatMap(f => f.children ? [f, ...flatten(f.children)] : [f])
  }
  const allFiles = useMemo(() => flatten(files), [files])

  // items at current path
  const currentItems = useMemo(() => {
    let items = files
    for (const id of currentPath) {
      const folder = items.find(f => f.id === id)
      items = folder?.children ?? []
    }
    return items
  }, [files, currentPath])

  // breadcrumb segments
  const breadcrumb = useMemo(() => {
    let items = files
    const segs: ProjectFile[] = []
    for (const id of currentPath) {
      const folder = items.find(f => f.id === id)
      if (folder) { segs.push(folder); items = folder.children ?? [] }
    }
    return segs
  }, [files, currentPath])

  const filteredItems = useMemo(() =>
    search.trim() ? currentItems.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : currentItems,
    [currentItems, search],
  )

  const topLevelFolders = files.filter(f => f.type === 'folder')
  const totalFiles = allFiles.filter(f => f.type !== 'folder').length
  const totalSize  = allFiles.filter(f => f.type !== 'folder').reduce((s, f) => s + f.sizeBytes, 0)
  const fmt        = (b: number) => b === 0 ? '—' : b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`
  const fmtDate    = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const FILE_CFG: Record<string, { bg: string; color: string }> = {
    csv:    { bg: 'var(--in-t)',  color: 'var(--in)'  },
    json:   { bg: 'var(--wa-t)', color: 'var(--wa)'  },
    folder: { bg: 'var(--a3)',   color: 'var(--a1)'  },
  }

  function openFile(id: string) {
    if (!openTabs.includes(id)) setOpenTabs(p => [...p, id])
    setActiveViewTab(id)
  }
  function closeTab(id: string) {
    const next = openTabs.filter(t => t !== id)
    setOpenTabs(next)
    setActiveViewTab(next.length ? next[next.length - 1] : null)
  }

  return (
    <DashboardLayout>
      {/* New folder modal */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-[var(--s0)] rounded-2xl w-full max-w-[380px] p-6 shadow-[0_24px_64px_rgba(0,0,0,.4)] border border-[var(--s4)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--a3)] border border-[var(--a4)] flex items-center justify-center">
                <FolderPlus size={16} className="text-[var(--a1)]" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[var(--t1)]">New folder</div>
                <div className="text-[11px] text-[var(--t3)]">
                  Inside: {breadcrumb.length ? breadcrumb[breadcrumb.length - 1].name : 'Root'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[var(--s4)] bg-[var(--s2)] focus-within:border-[var(--a1)] focus-within:shadow-[0_0_0_3px_var(--a3)] transition-all mb-4">
              <Folder size={12} className="text-[var(--t4)] flex-shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-[12.5px] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none"
                placeholder="Folder name…"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    toast.success('Folder created', `"${newFolderName}" added.`)
                    setShowNewFolder(false); setNewFolderName('')
                  }
                  if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className="h-8 px-4 rounded-md border border-[var(--s4)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Cancel</button>
              <button
                disabled={!newFolderName.trim()}
                onClick={() => { toast.success('Folder created', `"${newFolderName}" added.`); setShowNewFolder(false); setNewFolderName('') }}
                className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors disabled:opacity-40"
              >Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">File manager</h1>
          <p className="text-[12px] text-[var(--t2)] mt-0.5">{totalFiles} files · {fmt(totalSize)} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.info('Upload', 'File picker.')} className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--s5)] bg-[var(--s1)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] shadow-[var(--d1)] transition-colors">
            <Upload size={13} /> Upload
          </button>
          <button onClick={() => setShowNewFolder(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] shadow-[var(--d1)] transition-colors">
            <FolderPlus size={13} /> New folder
          </button>
        </div>
      </div>

      {/* File viewer tabs */}
      {openTabs.length > 0 && (
        <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d2)] mb-3.5">
          <div className="bg-[var(--s2)] border-b border-[var(--s4)] flex overflow-x-auto">
            {openTabs.map(tabId => {
              const f = allFiles.find(fi => fi.id === tabId)
              const isAct = tabId === activeViewTab
              return (
                <div key={tabId} onClick={() => setActiveViewTab(tabId)}
                  className={cn('h-[35px] px-3.5 flex items-center gap-2 border-r border-[var(--s4)] cursor-pointer whitespace-nowrap transition-all text-[11.5px] font-medium border-b-2',
                    isAct ? 'bg-[var(--s1)] text-[var(--a1)] border-b-[var(--a1)]' : 'bg-[var(--s2)] text-[var(--t3)] border-b-transparent hover:text-[var(--t2)] hover:bg-[var(--s3)]',
                  )}>
                  <span className={cn('text-[9px] font-bold px-1.5 py-px rounded-sm', isAct ? 'bg-[var(--in-t)] text-[var(--in)]' : 'bg-[var(--s3)] text-[var(--t3)]')}>
                    {f?.name.split('.').pop()?.toUpperCase()}
                  </span>
                  {f?.name}
                  <button onClick={e => { e.stopPropagation(); closeTab(tabId) }}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[var(--t4)] hover:bg-[var(--er-t)] hover:text-[var(--er)] transition-colors ml-1">
                    ×
                  </button>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--s2)] border-b border-[var(--s3)]">
            <button onClick={() => toast.success('Downloaded', 'Saved.')} className="h-6 px-2.5 rounded-md border border-[var(--s4)] bg-[var(--s1)] text-[11px] font-semibold text-[var(--t2)] shadow-[var(--d1)] hover:bg-[var(--s2)] transition-colors">↓ Download</button>
            <span className="ml-auto font-mono text-[10.5px] text-[var(--t3)]">
              {allFiles.find(f => f.id === activeViewTab)?.rowCount?.toLocaleString('en-IN') ?? '—'} rows
            </span>
          </div>
          {activeViewTab && <SpreadsheetViewer fileId={activeViewTab} />}
        </div>
      )}

      {/* Main layout: tree + content */}
      <div className="flex gap-3">

        {/* ── Tree sidebar ── */}
        <div className="w-[220px] flex-shrink-0 bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)] flex flex-col">
          <div className="px-3.5 py-2.5 border-b border-[var(--s3)] bg-[var(--s2)]">
            <div className="text-[9.5px] font-bold text-[var(--t4)] uppercase tracking-[.09em]">Navigator</div>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {/* Root */}
            <button
              onClick={() => setCurrentPath([])}
              className={cn(
                'w-full flex items-center gap-1.5 h-[28px] px-3 text-left transition-colors',
                currentPath.length === 0
                  ? 'bg-[var(--a3)] text-[var(--a1)]'
                  : 'text-[var(--t2)] hover:bg-[var(--s2)]',
              )}
            >
              <HardDrive size={12} className="flex-shrink-0" />
              <span className="text-[11.5px] font-semibold">Root</span>
              <span className="ml-auto text-[9px] font-bold px-1.5 py-px rounded-full bg-[var(--s3)] text-[var(--t4)]">{files.length}</span>
            </button>

            {topLevelFolders.map(folder => (
              <FolderTreeNode
                key={folder.id}
                file={folder}
                depth={0}
                parentPath={[]}
                currentPath={currentPath}
                onNavigate={setCurrentPath}
              />
            ))}
          </div>

          <div className="px-3 py-2 border-t border-[var(--s3)] bg-[var(--s2)]">
            <div className="text-[10px] font-medium text-[var(--t4)]">{totalFiles} files · {fmt(totalSize)}</div>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex-1 bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)] flex flex-col min-w-0">

          {/* Toolbar row */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[var(--s3)] bg-[var(--s2)] flex-shrink-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-[11.5px] flex-1 min-w-0 overflow-hidden">
              <button
                onClick={() => setCurrentPath([])}
                className={cn('font-semibold transition-colors hover:text-[var(--a1)] flex-shrink-0', currentPath.length === 0 ? 'text-[var(--t1)]' : 'text-[var(--t3)]')}
              >Root</button>
              {breadcrumb.map((seg, i) => (
                <span key={seg.id} className="flex items-center gap-1 flex-shrink-0">
                  <ChevronRight size={10} className="text-[var(--t4)]" />
                  <button
                    onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                    className={cn('font-semibold transition-colors hover:text-[var(--a1)]', i === breadcrumb.length - 1 ? 'text-[var(--t1)]' : 'text-[var(--t3)]')}
                  >{seg.name}</button>
                </span>
              ))}
            </div>

            {/* Search */}
            <div className={cn('flex items-center gap-1.5 h-7 px-2.5 rounded-lg border bg-[var(--s1)] shadow-[var(--di)] w-[150px] transition-all', search ? 'border-[var(--a4)]' : 'border-[var(--s4)]')}>
              <Search size={11} className="text-[var(--t4)] flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-[11px] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch('')}><X size={10} className="text-[var(--t4)] hover:text-[var(--t2)]" /></button>}
            </div>

            {/* View toggle */}
            <div className="flex rounded-md border border-[var(--s4)] overflow-hidden flex-shrink-0">
              {([['list', List], ['grid', Grid]] as [string, React.ElementType][]).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as 'list' | 'grid')}
                  className={cn('w-7 h-7 flex items-center justify-center transition-colors', viewMode === mode ? 'bg-[var(--a1)] text-black' : 'bg-[var(--s1)] text-[var(--t3)] hover:bg-[var(--s2)]')}
                >
                  <Icon size={12} />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="p-8 flex-1"><PageLoading message="Loading files…" /></div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-3">
                <Folder size={18} className="text-[var(--t4)]" />
              </div>
              <div className="text-[13px] font-semibold text-[var(--t2)]">{search ? 'No files match your search' : 'This folder is empty'}</div>
              {!search && (
                <button onClick={() => setShowNewFolder(true)} className="mt-3 flex items-center gap-1.5 h-7 px-3 rounded-md bg-[var(--a1)] text-black text-[11px] font-bold hover:bg-[var(--a2)] transition-colors">
                  <FolderPlus size={11} /> Create folder
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col overflow-y-auto">
              {/* List header */}
              <div className="grid gap-0 px-3.5 py-2 border-b border-[var(--s3)] bg-[var(--s2)] flex-shrink-0" style={{ gridTemplateColumns: '1fr 64px 88px 88px 80px' }}>
                {['Name', 'Type', 'Size', 'Modified', ''].map(h => (
                  <div key={h} className="text-[9.5px] font-bold text-[var(--t4)] uppercase tracking-[.07em]">{h}</div>
                ))}
              </div>
              {filteredItems.map(file => {
                const cfg = FILE_CFG[file.type] ?? FILE_CFG.csv
                const isFolder = file.type === 'folder'
                return (
                  <div
                    key={file.id}
                    onClick={() => isFolder ? setCurrentPath([...currentPath, file.id]) : openFile(file.id)}
                    className="grid gap-0 px-3.5 py-2.5 border-b border-[var(--s3)] last:border-b-0 hover:bg-[var(--s2)] cursor-pointer transition-colors group"
                    style={{ gridTemplateColumns: '1fr 64px 88px 88px 80px' }}
                  >
                    {/* Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                        {isFolder
                          ? <Folder size={13} style={{ color: cfg.color }} />
                          : <FileText size={13} style={{ color: cfg.color }} />}
                      </div>
                      <span className={cn('text-[12.5px] font-semibold truncate', isFolder ? 'text-[var(--t1)]' : 'text-[var(--t1)] group-hover:text-[var(--a1)] transition-colors')}>
                        {file.name}
                      </span>
                      {file.protected && (
                        <span className="text-[9px] font-bold px-1.5 py-px rounded bg-[var(--wa-t)] text-[var(--wa)] border border-[var(--wa-b)] flex-shrink-0">protected</span>
                      )}
                      {isFolder && file.children && (
                        <span className="text-[9px] text-[var(--t4)] flex-shrink-0 ml-1">{file.children.length} items</span>
                      )}
                    </div>
                    {/* Type */}
                    <div className="flex items-center">
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                        {file.type.toUpperCase()}
                      </span>
                    </div>
                    {/* Size */}
                    <div className="flex items-center">
                      <span className="font-mono text-[11.5px] text-[var(--t2)]">{file.sizeBytes > 0 ? fmt(file.sizeBytes) : '—'}</span>
                    </div>
                    {/* Modified */}
                    <div className="flex items-center">
                      <span className="text-[11.5px] text-[var(--t2)]">{fmtDate(file.modifiedAt)}</span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {!isFolder && (
                        <button onClick={() => openFile(file.id)} title="Preview" className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--t4)] hover:text-[var(--in)] hover:bg-[var(--in-t)] transition-all"><Eye size={10} /></button>
                      )}
                      <button onClick={() => toast.success('Downloaded', `${file.name} saved.`)} title="Download" className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--t4)] hover:text-[var(--t2)] hover:bg-[var(--s3)] transition-all"><Download size={10} /></button>
                      <button
                        onClick={() => file.protected ? toast.error('Protected', 'Cannot delete.') : toast.success('Deleted', 'Moved to trash.')}
                        title="Delete"
                        className={cn('w-6 h-6 rounded-md flex items-center justify-center transition-all', file.protected ? 'opacity-25 cursor-not-allowed text-[var(--t4)]' : 'text-[var(--t4)] hover:text-[var(--er)] hover:bg-[var(--er-t)]')}
                      ><Trash2 size={10} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Grid view */
            <div className="p-3.5 grid grid-cols-3 gap-2.5 overflow-y-auto">
              {filteredItems.map(file => {
                const cfg = FILE_CFG[file.type] ?? FILE_CFG.csv
                const isFolder = file.type === 'folder'
                return (
                  <div
                    key={file.id}
                    onClick={() => isFolder ? setCurrentPath([...currentPath, file.id]) : openFile(file.id)}
                    className="bg-[var(--s2)] border border-[var(--s4)] rounded-[var(--rl)] p-3.5 cursor-pointer hover:border-[var(--a4)] hover:shadow-[var(--d2)] transition-all group flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2.5" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      {isFolder ? <Folder size={20} style={{ color: cfg.color }} /> : <FileText size={20} style={{ color: cfg.color }} />}
                    </div>
                    <div className="text-[12px] font-semibold text-[var(--t1)] truncate w-full group-hover:text-[var(--a1)] transition-colors">{file.name}</div>
                    <div className="text-[10px] text-[var(--t4)] font-mono mt-0.5">
                      {file.sizeBytes > 0 ? fmt(file.sizeBytes) : isFolder ? `${file.children?.length ?? 0} items` : '—'}
                    </div>
                    {file.protected && (
                      <span className="mt-1.5 text-[9px] font-bold px-1.5 py-px rounded bg-[var(--wa-t)] text-[var(--wa)] border border-[var(--wa-b)]">protected</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Ticket wizard steps ──────────────────────────────────────────────────────
const TICKET_STEPS = [
  { id: 1, title: 'Category',    desc: 'Issue type and priority' },
  { id: 2, title: 'Details',     desc: 'Title and description'   },
  { id: 3, title: 'Review',      desc: 'Confirm and submit'      },
]

const TICKET_CATEGORIES = [
  { id: 'bug',     label: 'Bug Fix',               icon: AlertCircle,   color: 'var(--er)' },
  { id: 'enhance', label: 'Enhancement Request',   icon: Tag,           color: 'var(--in)' },
  { id: 'error',   label: 'Application Error',     icon: AlertCircle,   color: 'var(--wa)' },
  { id: 'other',   label: 'Other',                 icon: MessageSquare, color: 'var(--t3)' },
]

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const

function TicketWizard({ onClose }: { onClose: () => void }) {
  const { mutateAsync: createTicket, isPending } = useCreateTicket()
  const toast = useToast()
  const intl  = useIntl()
  const fm    = intl.formatMessage.bind(intl)

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('Medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const labelCls = 'text-[11px] font-semibold text-[var(--t2)] mb-1.5 block'

  const WIZARD_STEPS = [
    { id: 1, title: fm(supportMessages.step1Title), desc: fm(supportMessages.step1Desc) },
    { id: 2, title: fm(supportMessages.step2Title), desc: fm(supportMessages.step2Desc) },
    { id: 3, title: fm(supportMessages.step3Title), desc: fm(supportMessages.step3Desc) },
  ]

  const WIZARD_CATEGORIES = [
    { id: 'bug',     label: fm(supportMessages.categoryBugFix),       icon: AlertCircle,   color: 'var(--er)' },
    { id: 'enhance', label: fm(supportMessages.categoryEnhancement),  icon: Tag,           color: 'var(--in)' },
    { id: 'error',   label: fm(supportMessages.categoryAppError),     icon: AlertCircle,   color: 'var(--wa)' },
    { id: 'other',   label: fm(supportMessages.categoryOther),        icon: MessageSquare, color: 'var(--t3)' },
  ]

  async function handleSubmit() {
    if (!title || !category) return
    const catLabel = TICKET_CATEGORIES.find(c => c.id === category)?.label ?? category
    await createTicket({ title, type: catLabel as 'Bug Fix' | 'Enhancement Request' | 'Application Error' })
    toast.success(fm(supportMessages.toastTitle), fm(supportMessages.toastBody))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-[var(--s0)] rounded-2xl w-full max-w-[820px] h-[540px] flex overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.35)] border border-[var(--s4)]">

        {/* stepper */}
        <div className="w-[220px] flex-shrink-0 bg-[var(--s1)] border-r border-[var(--s4)] p-6 flex flex-col">
          <div className="text-[14px] font-bold text-[var(--t1)] mb-0.5">{fm(supportMessages.wizardTitle)}</div>
          <div className="text-[11px] text-[var(--t3)] mb-8">{fm(supportMessages.wizardSubtitle)}</div>
          <div className="flex flex-col">
            {WIZARD_STEPS.map((s, i) => {
              const done = step > s.id; const active = step === s.id
              return (
                <div key={s.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${done ? 'bg-[var(--a1)] text-white' : active ? 'bg-[var(--a1)] text-white ring-4 ring-[var(--a3)]' : 'bg-[var(--s3)] text-[var(--t3)] border border-[var(--s5)]'}`}>
                      {done ? <Check size={12} /> : s.id}
                    </div>
                    {i < WIZARD_STEPS.length - 1 && <div className={`w-px my-1.5 flex-1 min-h-[36px] transition-colors ${done ? 'bg-[var(--a1)]' : 'bg-[var(--s4)]'}`} />}
                  </div>
                  <div className="pb-9 last:pb-0">
                    <div className={`text-[12.5px] font-semibold leading-tight ${active || done ? 'text-[var(--t1)]' : 'text-[var(--t3)]'}`}>{s.title}</div>
                    <div className="text-[11px] text-[var(--t3)] mt-0.5">{s.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--t1)] mb-0.5">{fm(supportMessages.step1Heading)}</h2>
                  <p className="text-[12px] text-[var(--t3)]">{fm(supportMessages.step1Subheading)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {WIZARD_CATEGORIES.map(c => {
                    const Icon = c.icon
                    const sel = category === c.id
                    return (
                      <button key={c.id} onClick={() => setCategory(c.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${sel ? 'border-[var(--a4)] bg-[var(--a3)]' : 'border-[var(--s4)] hover:border-[var(--a4)] hover:bg-[var(--s2)]'}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--s2)] border border-[var(--s4)]">
                          <Icon size={14} style={{ color: c.color }} />
                        </div>
                        <span className={`text-[12.5px] font-semibold ${sel ? 'text-[var(--a1)]' : 'text-[var(--t1)]'}`}>{c.label}</span>
                      </button>
                    )
                  })}
                </div>
                <div>
                  <label className={labelCls}>{fm(supportMessages.labelPriority)}</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => {
                      const colors: Record<string, string> = { Low: 'var(--ok)', Medium: 'var(--in)', High: 'var(--wa)', Critical: 'var(--er)' }
                      const sel = priority === p
                      return (
                        <button key={p} type="button" onClick={() => setPriority(p)}
                          className={`flex-1 h-8 rounded-md border text-[11px] font-semibold capitalize transition-all ${sel ? 'bg-[var(--a3)] border-[var(--a4)] text-[var(--a1)]' : 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t3)] hover:border-[var(--a4)]'}`}>
                          <span style={{ color: sel ? undefined : colors[p] }}>● </span>{p}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--t1)] mb-0.5">{fm(supportMessages.step2Heading)}</h2>
                  <p className="text-[12px] text-[var(--t3)]">{fm(supportMessages.step2Subheading)}</p>
                </div>
                <div>
                  <label className={labelCls}>{fm(supportMessages.labelTitle)} <span className="text-[var(--er)]">*</span></label>
                  <input className={inputCls} placeholder={fm(supportMessages.placeholderTitle)} value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{fm(supportMessages.labelDescription)}</label>
                  <textarea className={inputCls + ' !h-28 py-2 resize-none'} placeholder={fm(supportMessages.placeholderDescription)} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{fm(supportMessages.labelAttachments)}</label>
                  <div className="border-2 border-dashed border-[var(--s5)] rounded-xl p-5 text-center cursor-pointer hover:border-[var(--a1)] hover:bg-[var(--a3)] transition-all bg-[var(--s2)]">
                    <p className="text-[12px] font-semibold text-[var(--t2)]">{fm(supportMessages.dropzone)}</p>
                    <p className="text-[10.5px] text-[var(--t3)] mt-0.5">{fm(supportMessages.dropzoneHint)}</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--t1)] mb-0.5">{fm(supportMessages.step3Heading)}</h2>
                  <p className="text-[12px] text-[var(--t3)]">{fm(supportMessages.step3Subheading)}</p>
                </div>
                <div className="bg-[var(--s2)] border border-[var(--s4)] rounded-xl overflow-hidden">
                  {[
                    [fm(supportMessages.reviewCategory),    WIZARD_CATEGORIES.find(c => c.id === category)?.label ?? '—'],
                    [fm(supportMessages.reviewPriority),    priority],
                    [fm(supportMessages.reviewTitle),       title || '—'],
                    [fm(supportMessages.reviewDescription), description || fm(supportMessages.reviewNotProvided)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-start gap-4 px-4 py-3 border-b border-[var(--s3)] last:border-b-0">
                      <span className="text-[11px] font-semibold text-[var(--t3)] w-24 flex-shrink-0 pt-0.5">{l}</span>
                      <span className="text-[12px] text-[var(--t1)] font-medium flex-1">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--in-t)] border border-[var(--in-b)] rounded-lg">
                  <HelpCircle size={13} className="text-[var(--in)] flex-shrink-0" />
                  <p className="text-[11px] text-[var(--t2)]">{fm(supportMessages.wizardNotice)}</p>
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex-shrink-0 border-t border-[var(--s4)] px-6 py-4 flex items-center justify-between bg-[var(--s1)]">
            <button onClick={onClose} className="h-8 px-4 rounded-md border border-[var(--s5)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">{fm(supportMessages.cancel)}</button>
            <div className="flex items-center gap-2">
              {step > 1 && <button onClick={() => setStep(s => s - 1)} className="h-8 px-4 rounded-md border border-[var(--s5)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">{fm(supportMessages.back)}</button>}
              {step < 3 && (
                <button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !category) || (step === 2 && !title)}
                  className="h-8 px-4 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--a2)] transition-colors">
                  {fm(supportMessages.next)}
                </button>
              )}
              {step === 3 && (
                <button onClick={handleSubmit} disabled={isPending}
                  className="h-8 px-5 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--a2)] transition-colors">
                  {isPending ? fm(supportMessages.submitting) : fm(supportMessages.submit)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'What does MAPE mean and how is it calculated?',                    a: 'MAPE (Mean Absolute Percentage Error) measures forecast accuracy as a percentage. It is calculated as the mean of |actual − forecast| / actual × 100 across all periods. Lower is better — below 10% is excellent for retail demand.' },
  { q: 'How do I switch the active project?',                              a: 'Click the project switcher in the top of the left sidebar. You can switch between projects at any time. Switching mid-workflow will not affect saved experiments or data.' },
  { q: 'Why is my forecast accuracy low on CZ SKUs?',                     a: 'CZ SKUs have low volume and intermittent (lumpy) demand, which is inherently hard to forecast with standard models. Use the Croston method or apply safety stock rules for these SKUs instead of point forecasts.' },
  { q: 'How often is data refreshed?',                                     a: 'Data is refreshed on upload. You can trigger a manual re-run from the Data quality page. For live data integrations (S3, SFTP), refreshes are scheduled in Settings → Integrations.' },
  { q: 'Can I export forecast results?',                                   a: 'Yes. Navigate to Post-forecast → Export tab. You can export as CSV, Excel, or PDF. Bulk exports can be configured to push directly to your S3 bucket via integrations.' },
  { q: 'What is the difference between forecast horizon and lead time?',   a: 'Forecast horizon is how far ahead you are predicting (e.g., 13 weeks). Lead time is the operational constraint (supplier lead time). The horizon should be ≥ lead time to be actionable for replenishment.' },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--s3)] last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-[var(--s2)] transition-colors group"
      >
        <span className="text-[12.5px] font-semibold text-[var(--t1)] group-hover:text-[var(--a1)] transition-colors">{q}</span>
        <ChevronDown size={14} className={`text-[var(--t3)] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-[12px] text-[var(--t2)] leading-relaxed bg-[var(--s2)] rounded-lg px-3.5 py-3 border border-[var(--s3)]">{a}</p>
        </div>
      )}
    </div>
  )
}

// ─── SUPPORT PAGE ─────────────────────────────────────────────────────────────
export function SupportPage() {
  const { data: tickets = [] } = useTickets()
  const toast = useToast()
  const navigate = useNavigate()
  const intl = useIntl()
  const fm   = intl.formatMessage.bind(intl)
  const [showWizard, setShowWizard] = useState(false)
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>('tickets')

  const open     = tickets.filter(t => t.status !== 'resolved')
  const resolved = tickets.filter(t => t.status === 'resolved')
  const statusBadge = { open: 'blue' as const, 'in-progress': 'warn' as const, resolved: 'gray' as const }

  return (
    <DashboardLayout>
      {showWizard && <TicketWizard onClose={() => setShowWizard(false)} />}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">{fm(supportMessages.title)}</h1>
          <p className="text-[12px] text-[var(--t2)] mt-0.5">{fm(supportMessages.subtitle)}</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold hover:bg-[var(--a2)] shadow-[0_2px_8px_rgba(74,111,165,.3)] transition-colors"
        >
          <Plus size={13} /> {fm(supportMessages.newTicket)}
        </button>
      </div>

      {/* tab switcher */}
      <div className="flex gap-1 mb-4 bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-1 w-fit shadow-[var(--d1)]">
        {(['tickets', 'faq'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`h-7 px-4 rounded-md text-[12px] font-semibold transition-all capitalize ${activeTab === t ? 'bg-[var(--a1)] text-white shadow-[var(--d1)]' : 'text-[var(--t2)] hover:bg-[var(--s2)]'}`}
          >
            {t === 'tickets' ? fm(supportMessages.tabTickets, { count: open.length }) : fm(supportMessages.tabFaq)}
          </button>
        ))}
      </div>

      {/* Tickets tab */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-[1fr_360px] gap-4">
          <div>
            {open.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[13px] font-bold text-[var(--t1)]">{fm(supportMessages.sectionOpen)}</div>
                  <Badge variant="danger">{open.length}</Badge>
                </div>
                {open.map(t => (
                  <div
                    key={t.id}
                    onClick={() => navigate({ to: '/dashboard/support/$ticketId' as never, params: { ticketId: t.id } })}
                    className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-3.5 mb-2 shadow-[var(--d1)] hover:border-[var(--a4)] hover:bg-[var(--s2)] cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-[var(--t4)] bg-[var(--s2)] px-2 py-px rounded">#{t.id}</span>
                      <Badge variant={statusBadge[t.status]}>{t.status}</Badge>
                    </div>
                    <div className="text-[13px] font-semibold text-[var(--t1)] mb-0.5">{t.title}</div>
                    <div className="text-[11px] text-[var(--t3)]">{t.type} · {t.createdAt}</div>
                  </div>
                ))}
              </>
            )}
            {resolved.length > 0 && (
              <>
                <div className="text-[13px] font-bold text-[var(--t1)] mt-4 mb-2.5">{fm(supportMessages.sectionResolved)}</div>
                {resolved.map(t => (
                  <div
                    key={t.id}
                    onClick={() => navigate({ to: '/dashboard/support/$ticketId' as never, params: { ticketId: t.id } })}
                    className="bg-[var(--s1)] border border-[var(--s4)] rounded-xl p-3.5 mb-2 shadow-[var(--d1)] opacity-55 hover:opacity-100 hover:border-[var(--a4)] cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-[var(--t4)] bg-[var(--s2)] px-2 py-px rounded">#{t.id}</span>
                      <Badge>Resolved</Badge>
                    </div>
                    <div className="text-[13px] font-semibold text-[var(--t1)] mb-0.5">{t.title}</div>
                    <div className="text-[11px] text-[var(--t3)]">{t.createdAt}</div>
                  </div>
                ))}
              </>
            )}
            {tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center mb-4">
                  <HelpCircle size={20} className="text-[var(--t4)]" />
                </div>
                <div className="text-[14px] font-bold text-[var(--t2)] mb-1">{fm(supportMessages.emptyTitle)}</div>
                <div className="text-[12px] text-[var(--t3)]">{fm(supportMessages.emptyBody)}</div>
              </div>
            )}
          </div>

          {/* quick stats */}
          <div className="flex flex-col gap-3">
            {[
              { label: fm(supportMessages.statsOpenTickets), value: open.length,     color: 'var(--er)' },
              { label: fm(supportMessages.statsResolved),   value: resolved.length, color: 'var(--ok)' },
              { label: fm(supportMessages.statsAvgResponse),value: '< 4 hrs',       color: 'var(--a1)' },
              { label: fm(supportMessages.statsSla),        value: '98.4%',         color: 'var(--a1)' },
            ].map(s => (
              <Card key={s.label} className="flex items-center justify-between py-3">
                <span className="text-[12px] text-[var(--t2)]">{s.label}</span>
                <span className="text-[16px] font-bold" style={{ color: s.color }}>{s.value}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ tab */}
      {activeTab === 'faq' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[var(--s3)] bg-[var(--s2)]">
            <div className="text-[13px] font-bold text-[var(--t1)]">{fm(supportMessages.faqTitle)}</div>
            <div className="text-[11px] text-[var(--t3)] mt-0.5">{fm(supportMessages.faqSubtitle, { count: FAQ_ITEMS.length })}</div>
          </div>
          {FAQ_ITEMS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </Card>
      )}
    </DashboardLayout>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
const SETTINGS_TABS = [
  { id: 'general',        label: 'General',         icon: '⚙' },
  { id: 'project',        label: 'Project defaults', icon: '📊' },
  { id: 'integrations',   label: 'Integrations',    icon: '🔌' },
  { id: 'notifications',  label: 'Notifications',   icon: '🔔' },
  { id: 'security',       label: 'Security',        icon: '🔐' },
  { id: 'danger',         label: 'Danger zone',     icon: '⚠' },
] as const
type SettingsTab = typeof SETTINGS_TABS[number]['id']

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--s3)] last:border-b-0 gap-4">
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-[var(--t1)]">{label}</div>
        {hint && <div className="text-[11px] text-[var(--t3)] mt-0.5 leading-snug">{hint}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function IntegrationCard({ name, logo, desc, status, onConfigure }: { name: string; logo: string; desc: string; status: 'connected' | 'not-connected'; onConfigure: () => void }) {
  const connected = status === 'connected'
  return (
    <div className={cn('bg-[var(--s1)] border rounded-[var(--rl)] p-4 shadow-[var(--d1)] transition-all hover:shadow-[var(--d2)]', connected ? 'border-[var(--a4)]' : 'border-[var(--s4)]')}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center text-[18px] flex-shrink-0">{logo}</div>
          <div>
            <div className="text-[13px] font-bold text-[var(--t1)]">{name}</div>
            <div className={cn('text-[9.5px] font-bold px-1.5 py-px rounded-full w-fit mt-0.5', connected ? 'bg-[var(--ok-t)] text-[var(--ok)]' : 'bg-[var(--s3)] text-[var(--t4)]')}>
              {connected ? '● Connected' : '○ Not configured'}
            </div>
          </div>
        </div>
        <button onClick={onConfigure} className={cn('h-7 px-3 rounded-md text-[11px] font-bold transition-colors border', connected ? 'bg-[var(--s2)] border-[var(--s4)] text-[var(--t2)] hover:bg-[var(--s3)]' : 'bg-[var(--a1)] border-[var(--a1)] text-black hover:bg-[var(--a2)]')}>
          {connected ? 'Manage' : 'Connect'}
        </button>
      </div>
      <p className="text-[11.5px] text-[var(--t3)] leading-relaxed">{desc}</p>
    </div>
  )
}

export function SettingsPage() {
  const toast  = useToast()
  const nav    = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const { theme, toggleTheme } = useLayoutStore()

  const save = () => toast.success('Saved', 'Your settings have been updated.')

  return (
    <DashboardLayout>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Settings</h1>
          <p className="text-[12px] text-[var(--t2)] mt-0.5">Workspace, project and integration configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-5 items-start">
        {/* ── Left nav ── */}
        <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)] sticky top-4">
          {SETTINGS_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-3 text-[12.5px] font-semibold border-b border-[var(--s3)] last:border-b-0 transition-all text-left',
                activeTab === t.id
                  ? 'bg-[var(--a3)] text-[var(--a1)] border-l-2 border-l-[var(--a1)]'
                  : 'text-[var(--t2)] hover:bg-[var(--s2)] border-l-2 border-l-transparent',
                t.id === 'danger' && activeTab !== 'danger' && 'text-[var(--er)]'
              )}
            >
              <span className="text-[14px] leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Right content ── */}
        <div className="flex flex-col gap-4">

          {/* General */}
          {activeTab === 'general' && (
            <>
              <Card>
                <SectionHead>Appearance</SectionHead>
                <SettingRow label="Dark mode" hint="Switch between light and dark interface themes.">
                  <button
                    onClick={toggleTheme}
                    className={cn('w-10 h-5 rounded-full relative transition-colors', theme === 'dark' ? 'bg-[var(--a1)]' : 'bg-[var(--s5)]')}
                  >
                    <span className={cn('absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-[left]', theme === 'dark' ? 'left-[21px]' : 'left-[3px]')} />
                  </button>
                </SettingRow>
                <SettingRow label="Compact density" hint="Reduce spacing across tables and lists.">
                  <Toggle />
                </SettingRow>
                <SettingRow label="Collapsed sidebar by default" hint="Start with the sidebar collapsed on load.">
                  <Toggle />
                </SettingRow>
              </Card>
              <Card>
                <SectionHead>Localisation</SectionHead>
                <SettingRow label="Locale & timezone" hint="Affects date, number and currency display.">
                  <select className={selectCls + ' w-44'}><option>en-IN / Asia/Kolkata</option><option>en-US / UTC</option><option>en-GB / Europe/London</option></select>
                </SettingRow>
                <SettingRow label="Date format" hint="How dates are displayed throughout the app.">
                  <select className={selectCls + ' w-36'}><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
                </SettingRow>
                <SettingRow label="Number format" hint="Thousand separator style.">
                  <select className={selectCls + ' w-28'}><option>1,00,000</option><option>100,000</option><option>100.000</option></select>
                </SettingRow>
              </Card>
              <div className="flex justify-end">
                <button onClick={save} className="h-9 px-5 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] shadow-[var(--d1)] transition-colors">Save changes</button>
              </div>
            </>
          )}

          {/* Project defaults */}
          {activeTab === 'project' && (
            <>
              <Card>
                <SectionHead>Forecast defaults</SectionHead>
                <SettingRow label="Default missing data fill" hint="Applied automatically to new projects.">
                  <select className={selectCls + ' w-40'}><option>Forward fill</option><option>Backward fill</option><option>Interpolate</option><option>Zero fill</option></select>
                </SettingRow>
                <SettingRow label="Default outlier method" hint="Detection algorithm used in data quality step.">
                  <select className={selectCls + ' w-40'}><option>IQR (1.5×)</option><option>Z-score (3σ)</option><option>Modified Z-score</option><option>None</option></select>
                </SettingRow>
                <SettingRow label="Default forecast horizon" hint="Number of periods to forecast ahead.">
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue={13} min={1} max={104} className={inputCls + ' w-20'} />
                    <span className="text-[11.5px] text-[var(--t3)]">weeks</span>
                  </div>
                </SettingRow>
                <SettingRow label="Default confidence interval" hint="Statistical confidence band around point forecast.">
                  <select className={selectCls + ' w-24'}><option>80%</option><option>90%</option><option>95%</option><option>99%</option></select>
                </SettingRow>
                <SettingRow label="Default calendar" hint="Fiscal or retail calendar alignment.">
                  <select className={selectCls + ' w-40'}><option>Gregorian</option><option>Fiscal (4-4-5)</option><option>Retail (NRF)</option></select>
                </SettingRow>
              </Card>
              <Card>
                <SectionHead>Automation</SectionHead>
                <SettingRow label="Auto-save" hint="Automatically save experiment configurations.">
                  <Toggle defaultOn />
                </SettingRow>
                <SettingRow label="Email alerts on completion" hint="Notify on experiment complete, quality issues.">
                  <Toggle defaultOn />
                </SettingRow>
                <SettingRow label="Run quality check on upload" hint="Trigger automatic data quality analysis on file upload.">
                  <Toggle defaultOn />
                </SettingRow>
                <SettingRow label="SMTP configuration" hint="Outbound email server for alerts.">
                  <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ok)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" /> Configured
                  </span>
                </SettingRow>
              </Card>
              <div className="flex justify-end">
                <button onClick={save} className="h-9 px-5 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] shadow-[var(--d1)] transition-colors">Save changes</button>
              </div>
            </>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <IntegrationCard name="Amazon S3"       logo="🪣" desc="Store and retrieve forecast outputs, data files and experiment artifacts directly in your S3 bucket." status="not-connected" onConfigure={() => toast.info('S3', 'Enter your bucket credentials.')} />
                <IntegrationCard name="Microsoft Teams" logo="🟦" desc="Post experiment completion and data quality alerts directly to your Teams channel via webhook." status="connected"     onConfigure={() => toast.info('Teams', 'Manage your webhook URL.')} />
                <IntegrationCard name="SFTP Server"     logo="📂" desc="Automated scheduled pulls from your SFTP server to refresh demand data without manual uploads." status="not-connected" onConfigure={() => toast.info('SFTP', 'Enter SFTP host and credentials.')} />
                <IntegrationCard name="Slack"           logo="💬" desc="Real-time notifications to Slack channels when experiments finish or quality alerts are triggered." status="not-connected" onConfigure={() => toast.info('Slack', 'Connect your Slack workspace.')} />
                <IntegrationCard name="Power BI"        logo="📈" desc="Push forecast outputs directly to a Power BI dataset for dashboard integration." status="not-connected" onConfigure={() => toast.info('Power BI', 'Configure Power BI workspace.')} />
                <IntegrationCard name="SAP / ERP"       logo="🏭" desc="Bi-directional sync with SAP S/4HANA or Oracle ERP for demand plan publishing." status="not-connected" onConfigure={() => toast.info('SAP', 'Configure ERP connector.')} />
              </div>
              <Card className="border-[var(--a4)] bg-[var(--a3)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-[var(--a1)] mb-0.5">Plans &amp; billing</div>
                    <div className="text-[11.5px] text-[var(--t2)]">Upgrade to Enterprise to unlock all integrations and unlimited experiments.</div>
                  </div>
                  <button onClick={() => nav({ to: '/dashboard/settings/plans' as never })} className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors flex-shrink-0">Manage plan</button>
                </div>
              </Card>
            </>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <SectionHead>Notification preferences</SectionHead>
              {[
                { label: 'Experiment complete',   hint: 'When a training run finishes (success or failure)',    defaultOn: true  },
                { label: 'Data quality alerts',   hint: 'Missing values, outliers or consistency issues found', defaultOn: true  },
                { label: 'Ticket updates',        hint: 'When a support ticket status changes',                defaultOn: false },
                { label: 'Forecast published',    hint: 'When a forecast output is approved and published',    defaultOn: true  },
                { label: 'New user added',        hint: 'When a team member joins your workspace',             defaultOn: false },
                { label: 'Storage warnings',      hint: 'When storage usage exceeds 80%',                      defaultOn: true  },
                { label: 'Weekly digest',         hint: 'Summary of activity every Monday morning',           defaultOn: false },
              ].map(item => (
                <SettingRow key={item.label} label={item.label} hint={item.hint}>
                  <Toggle defaultOn={item.defaultOn} />
                </SettingRow>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={save} className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] shadow-[var(--d1)] transition-colors">Save preferences</button>
              </div>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <>
              <Card>
                <SectionHead>Authentication</SectionHead>
                <SettingRow label="Two-factor authentication" hint="Require a second factor on every sign-in.">
                  <button onClick={() => toast.info('2FA', 'Setup coming soon.')} className="h-7 px-3 rounded-md border border-[var(--s5)] text-[11px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Enable 2FA</button>
                </SettingRow>
                <SettingRow label="Session timeout" hint="Automatically sign out after inactivity.">
                  <select className={selectCls + ' w-32'}><option>30 minutes</option><option>1 hour</option><option>4 hours</option><option>Never</option></select>
                </SettingRow>
                <SettingRow label="IP allowlist" hint="Restrict access to specific IP ranges.">
                  <Toggle />
                </SettingRow>
              </Card>
              <Card>
                <SectionHead>API keys</SectionHead>
                <div className="flex items-center justify-between py-2.5 border-b border-[var(--s3)]">
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--t1)] font-mono">sk_live_•••••••••••••••••xyz4</div>
                    <div className="text-[10.5px] text-[var(--t3)]">Created 12 Jan 2024 · Last used 2h ago</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toast.info('Copied', 'Key copied to clipboard.')} className="h-6 px-2.5 rounded-md border border-[var(--s4)] text-[10.5px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Copy</button>
                    <button onClick={() => toast.error('Revoked', 'API key revoked.')} className="h-6 px-2.5 rounded-md border border-[var(--er-b)] text-[10.5px] font-semibold text-[var(--er)] hover:bg-[var(--er-t)] transition-colors">Revoke</button>
                  </div>
                </div>
                <div className="pt-3">
                  <button onClick={() => toast.success('Created', 'New API key generated.')} className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] shadow-[var(--d1)] transition-colors">+ Generate new key</button>
                </div>
              </Card>
            </>
          )}

          {/* Danger zone */}
          {activeTab === 'danger' && (
            <div className="bg-[var(--s1)] border border-[var(--er-b)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
              <div className="px-4 py-3 bg-[var(--er-t)] border-b border-[var(--er-b)]">
                <div className="text-[12.5px] font-bold text-[var(--er)]">Danger zone</div>
                <div className="text-[11px] text-[var(--t2)] mt-0.5">These actions are irreversible. Proceed with caution.</div>
              </div>
              {[
                { label: 'Reset all preferences',  desc: 'Restore all settings to their factory defaults.',                action: () => toast.info('Reset', 'Preferences reset to defaults.') },
                { label: 'Export all data',        desc: 'Download a full archive of all projects and experiments.',      action: () => toast.success('Export', 'Your export is being prepared.') },
                { label: 'Revoke all sessions',    desc: 'Sign out of all devices and invalidate all active sessions.',   action: () => toast.error('Sessions revoked', 'All sessions ended.') },
                { label: 'Delete workspace',       desc: 'Permanently delete this workspace and all data. Cannot be undone.', action: () => toast.error('Confirm required', 'Contact support to delete your workspace.') },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-5 py-4 border-b border-[var(--s3)] last:border-b-0">
                  <div>
                    <div className="text-[12.5px] font-bold text-[var(--t1)]">{item.label}</div>
                    <div className="text-[11px] text-[var(--t3)] mt-0.5">{item.desc}</div>
                  </div>
                  <button onClick={item.action} className="h-8 px-4 rounded-md border border-[var(--er-b)] text-[12px] font-semibold text-[var(--er)] bg-[var(--er-t)] hover:opacity-80 transition-opacity flex-shrink-0 ml-4">
                    {item.label.split(' ')[0]}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
const ROLE_BADGE: Record<string, string> = {
  admin:   'text-[var(--a1)] bg-[var(--a3)] border border-[var(--a4)]',
  analyst: 'text-[var(--in)] bg-[var(--in-t)] border border-[var(--in-b)]',
  manager: 'text-[var(--wa)] bg-[var(--wa-t)] border border-[var(--wa-b)]',
  viewer:  'text-[var(--t3)] bg-[var(--s2)] border border-[var(--s4)]',
}

const MOCK_AUDIT = [
  { id: 'a1', user: 'Ganit',    initials: 'G',  action: 'Spoofed user',      target: 'Priya S.',               time: '5 min ago',  type: 'security' },
  { id: 'a2', user: 'Priya S.', initials: 'PS', action: 'Ran experiment',    target: 'Exp_003_Neural',          time: '22 min ago', type: 'action'   },
  { id: 'a3', user: 'Ganit',    initials: 'G',  action: 'Invited user',      target: 'neha.k@hksinc.com',      time: '1h ago',     type: 'user'     },
  { id: 'a4', user: 'Neha K.',  initials: 'NK', action: 'Uploaded file',     target: 'Retail_Q2_Updated.csv',  time: '2h ago',     type: 'file'     },
  { id: 'a5', user: 'Rahul M.', initials: 'RM', action: 'Viewed forecast',   target: 'Post-forecast results',  time: '3h ago',     type: 'view'     },
  { id: 'a6', user: 'Ganit',    initials: 'G',  action: 'Changed role',      target: 'Rahul M. → viewer',      time: '1d ago',     type: 'security' },
  { id: 'a7', user: 'Priya S.', initials: 'PS', action: 'Exported results',  target: 'CPG_Export_Jun.csv',     time: '2d ago',     type: 'file'     },
  { id: 'a8', user: 'Ganit',    initials: 'G',  action: 'Updated settings',  target: 'Notification prefs.',    time: '3d ago',     type: 'action'   },
]

const AUDIT_STYLE: Record<string, string> = {
  security: 'text-[var(--er)] bg-[var(--er-t)]',
  action:   'text-[var(--in)] bg-[var(--in-t)]',
  user:     'text-[var(--a1)] bg-[var(--a3)]',
  file:     'text-[var(--ok)] bg-[var(--ok-t)]',
  view:     'text-[var(--t3)] bg-[var(--s3)]',
}

type AdminTab = 'users' | 'system' | 'audit'

export function AdminPage() {
  const { data: users = [] } = useUsers()
  const toast = useToast()

  const [activeTab,   setActiveTab]   = useState<AdminTab>('users')
  const [roleFilter,  setRoleFilter]  = useState('all')
  const [userSearch,  setUserSearch]  = useState('')
  const [showInvite,  setShowInvite]  = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole,  setInviteRole]  = useState('viewer')

  const filteredUsers = useMemo(() =>
    users
      .filter(u => roleFilter === 'all' || u.role === roleFilter)
      .filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())),
    [users, roleFilter, userSearch],
  )

  const roleCounts = useMemo(() => ({
    admin:   users.filter(u => u.role === 'admin').length,
    analyst: users.filter(u => u.role === 'analyst').length,
    manager: users.filter(u => u.role === 'manager').length,
    viewer:  users.filter(u => u.role === 'viewer').length,
  }), [users])

  return (
    <DashboardLayout>
      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-[var(--s0)] rounded-2xl w-full max-w-[400px] p-6 shadow-[0_24px_64px_rgba(0,0,0,.4)] border border-[var(--s4)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--a3)] border border-[var(--a4)] flex items-center justify-center">
                <UserPlus size={16} className="text-[var(--a1)]" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[var(--t1)]">Invite team member</div>
                <div className="text-[11px] text-[var(--t3)]">Send an invitation by email</div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Email address</label>
                <input className={inputCls} placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Role</label>
                <select className={selectCls} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="viewer">Viewer — read only</option>
                  <option value="analyst">Analyst — run experiments</option>
                  <option value="manager">Manager — approve forecasts</option>
                  <option value="admin">Admin — full access</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowInvite(false); setInviteEmail(''); setInviteRole('viewer') }} className="h-8 px-4 rounded-md border border-[var(--s4)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Cancel</button>
              <button
                disabled={!inviteEmail.trim()}
                onClick={() => { toast.success('Invitation sent', `${inviteEmail} invited as ${inviteRole}.`); setShowInvite(false); setInviteEmail(''); setInviteRole('viewer') }}
                className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors disabled:opacity-40"
              >Send invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Admin panel</h1>
          <p className="text-[12px] text-[var(--t2)] mt-0.5">User management · system health · audit log</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors shadow-[var(--d2)]">
          <UserPlus size={13} /> Invite user
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {([
          { label: 'Total users',    value: users.length,       icon: Users,      accent: true,  color: 'var(--a1)'  },
          { label: 'Admins',         value: roleCounts.admin,   icon: ShieldCheck, accent: false, color: 'var(--a1)'  },
          { label: 'Analysts',       value: roleCounts.analyst, icon: BarChart2,   accent: false, color: 'var(--in)'  },
          { label: 'Viewers / Mgrs', value: roleCounts.viewer + roleCounts.manager, icon: Eye, accent: false, color: 'var(--t3)' },
        ] as { label: string; value: number; icon: React.ElementType; accent: boolean; color: string }[]).map(({ label, value, icon: Icon, accent, color }) => (
          <div key={label} className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-4 shadow-[var(--d1)] relative overflow-hidden">
            {accent && <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--a1)] rounded-t-[var(--rl)]" />}
            <div className="flex items-start justify-between mb-1.5">
              <div className="text-[9.5px] font-bold text-[var(--t4)] uppercase tracking-[.09em]">{label}</div>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                <Icon size={11} style={{ color }} />
              </div>
            </div>
            <div className="text-[22px] font-bold text-[var(--t1)] leading-none">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-1 w-fit shadow-[var(--d1)]">
        {([
          ['users',  Users,    'Users'        ],
          ['system', Server,   'System health'],
          ['audit',  Activity, 'Audit log'    ],
        ] as [AdminTab, React.ElementType, string][]).map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn('flex items-center gap-1.5 h-7 px-3.5 rounded-md text-[12px] font-semibold transition-all', activeTab === id ? 'bg-[var(--a1)] text-black shadow-[var(--d1)]' : 'text-[var(--t2)] hover:bg-[var(--s2)]')}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Users tab ── */}
      {activeTab === 'users' && (
        <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
            <div className={cn('flex items-center gap-1.5 flex-1 h-8 px-3 rounded-lg border bg-[var(--s1)] shadow-[var(--di)] transition-all', userSearch ? 'border-[var(--a4)]' : 'border-[var(--s4)]')}>
              <Search size={12} className="text-[var(--t4)] flex-shrink-0" />
              <input className="flex-1 bg-transparent text-[12px] text-[var(--t1)] placeholder:text-[var(--t4)] outline-none" placeholder="Search users…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              {userSearch && <button onClick={() => setUserSearch('')}><X size={10} className="text-[var(--t4)]" /></button>}
            </div>
            <div className="flex gap-1">
              {(['all', 'admin', 'analyst', 'manager', 'viewer'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={cn('h-7 px-2.5 rounded-md text-[10.5px] font-semibold border capitalize transition-all',
                    roleFilter === r ? 'bg-[var(--a1)] border-[var(--a1)] text-black' : 'bg-[var(--s1)] border-[var(--s4)] text-[var(--t2)] hover:border-[var(--a4)]',
                  )}
                >{r === 'all' ? 'All roles' : r}</button>
              ))}
            </div>
          </div>

          {filteredUsers.map((user, i) => (
            <div key={user.id} className={cn('flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--s2)] transition-colors', i < filteredUsers.length - 1 && 'border-b border-[var(--s3)]')}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-[var(--a1)] flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0 shadow-[var(--d1)]">
                {user.initials}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-[var(--t1)]">{user.name}</span>
                  <span className={cn('text-[9.5px] font-bold px-2 py-0.5 rounded-md capitalize', ROLE_BADGE[user.role] ?? ROLE_BADGE.viewer)}>
                    {user.role}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--ok)] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" /> Active
                  </span>
                </div>
                <div className="text-[11px] text-[var(--t3)] mt-0.5">{user.email} · {user.organisation}</div>
              </div>
              {/* Last login */}
              <div className="text-right flex-shrink-0 hidden lg:block">
                <div className="text-[10px] text-[var(--t4)] font-medium">Last login</div>
                <div className="text-[11.5px] font-semibold text-[var(--t2)] mt-0.5">Today, 9:30 AM</div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toast.info('Edit user', `Editing ${user.name}.`)} className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-[var(--s4)] text-[11px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] hover:border-[var(--s5)] transition-colors">
                  <Pencil size={10} /> Edit
                </button>
                <button onClick={() => toast.info('Spoof', `Viewing as ${user.name}.`)} className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-[var(--a4)] bg-[var(--a3)] text-[11px] font-semibold text-[var(--a1)] hover:bg-[var(--a1)] hover:text-black transition-colors">
                  <Shield size={10} /> Spoof
                </button>
                <button onClick={() => toast.error('Remove', `${user.name} removed.`)} className="w-7 h-7 rounded-md border border-[var(--s4)] flex items-center justify-center text-[var(--t4)] hover:bg-[var(--er-t)] hover:text-[var(--er)] hover:border-[var(--er-b)] transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="py-10 text-center text-[12px] text-[var(--t3)]">No users match your filter.</div>
          )}
        </div>
      )}

      {/* ── System tab ── */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-[1fr_300px] gap-4">
          <div className="flex flex-col gap-3">
            {/* Resource bars */}
            <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
              <div className="px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
                <span className="text-[12px] font-bold text-[var(--t1)]">Resource usage</span>
              </div>
              {([
                { label: 'Storage', used: '12.4 GB', total: '50 GB', pct: 24.8, color: 'var(--a1)' },
                { label: 'Memory',  used: '4.2 GB',  total: '16 GB', pct: 26.3, color: 'var(--in)' },
                { label: 'CPU',     used: '18%',      total: '100%',  pct: 18,   color: 'var(--ok)' },
              ]).map(({ label, used, total, pct, color }) => (
                <div key={label} className="px-4 py-3.5 border-b border-[var(--s3)] last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[var(--t1)]">{label}</span>
                    <span className="text-[11.5px] font-mono text-[var(--t2)]">{used} / {total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--s3)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="text-[10px] text-[var(--t4)] mt-1">{pct.toFixed(1)}% used</div>
                </div>
              ))}
            </div>

            {/* Active jobs */}
            <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
                <span className="text-[12px] font-bold text-[var(--t1)]">Background jobs</span>
                <span className="text-[9.5px] font-bold px-2 py-px rounded-full bg-[var(--in-t)] text-[var(--in)]">3 running</span>
              </div>
              {([
                { name: 'Exp_003_Neural training',  project: 'Retail_Demand_Q2_2024',    pct: 68, started: '12 min ago' },
                { name: 'Data quality scan',        project: 'CPG_Inventory_Planning',   pct: 45, started: '4 min ago'  },
                { name: 'Export: Jun_2024.csv',     project: 'QSR_Production_Planning',  pct: 91, started: '1 min ago'  },
              ]).map(job => (
                <div key={job.name} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--s3)] last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-[var(--in)] flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[var(--t1)] truncate">{job.name}</div>
                    <div className="text-[10.5px] text-[var(--t3)] mb-1.5">{job.project} · started {job.started}</div>
                    <div className="h-1 rounded-full bg-[var(--s3)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--in)]" style={{ width: `${job.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold font-mono text-[var(--in)] flex-shrink-0">{job.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: service status + info */}
          <div className="flex flex-col gap-3">
            <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
              <div className="px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
                <span className="text-[12px] font-bold text-[var(--t1)]">Service status</span>
              </div>
              {([
                { label: 'API server',    ok: true  },
                { label: 'Database',      ok: true  },
                { label: 'Job scheduler', ok: true  },
                { label: 'Storage layer', ok: false },
                { label: 'Email service', ok: true  },
                { label: 'Auth service',  ok: true  },
              ]).map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--s3)] last:border-b-0">
                  <span className="text-[12px] text-[var(--t2)]">{label}</span>
                  <span className={cn('flex items-center gap-1.5 text-[10.5px] font-bold', ok ? 'text-[var(--ok)]' : 'text-[var(--wa)]')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', ok ? 'bg-[var(--ok)]' : 'bg-[var(--wa)] animate-pulse')} />
                    {ok ? 'Operational' : 'Degraded'}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
              <div className="px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
                <span className="text-[12px] font-bold text-[var(--t1)]">System info</span>
              </div>
              {([
                ['Version',     'v2.1.0'      ],
                ['Last backup', '2h ago'      ],
                ['Uptime',      '14d 6h 22m'  ],
                ['Environment', 'Production'  ],
                ['Region',      'ap-south-1'  ],
              ]).map(([l, v]) => (
                <div key={l} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--s3)] last:border-b-0">
                  <span className="text-[12px] text-[var(--t3)]">{l}</span>
                  <span className="font-mono text-[11.5px] font-semibold text-[var(--t1)]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Audit log ── */}
      {activeTab === 'audit' && (
        <div className="bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--s3)] bg-[var(--s2)]">
            <span className="text-[12px] font-bold text-[var(--t1)]">Recent activity</span>
            <span className="text-[10.5px] text-[var(--t3)]">Last 7 days · {MOCK_AUDIT.length} events</span>
          </div>
          {MOCK_AUDIT.map((entry, i) => (
            <div key={entry.id} className={cn('flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--s2)] transition-colors', i < MOCK_AUDIT.length - 1 && 'border-b border-[var(--s3)]')}>
              <div className="w-8 h-8 rounded-xl bg-[var(--a1)] flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0 mt-0.5 shadow-[var(--d1)]">
                {entry.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-bold text-[var(--t1)]">{entry.user}</span>
                  <span className="text-[11.5px] text-[var(--t2)]">{entry.action}</span>
                  <span className="text-[11.5px] font-semibold text-[var(--a1)] font-mono">{entry.target}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize', AUDIT_STYLE[entry.type])}>{entry.type}</span>
                  <span className="text-[10.5px] text-[var(--t4)]">{entry.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const toast = useToast()
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'sessions'>('profile')

  const SECTIONS = [
    { id: 'profile'  as const, label: 'Profile'  },
    { id: 'security' as const, label: 'Security' },
    { id: 'sessions' as const, label: 'Sessions' },
  ]

  const SESSIONS = [
    { device: 'Chrome on macOS',  location: 'Mumbai, IN',    time: 'Active now',  current: true  },
    { device: 'Safari on iPhone', location: 'Bangalore, IN', time: '2h ago',      current: false },
    { device: 'Chrome on Windows',location: 'Delhi, IN',     time: '3 days ago',  current: false },
  ]

  return (
    <DashboardLayout>
      {/* Hero */}
      <div className="relative bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rxl)] overflow-hidden mb-5 shadow-[var(--d1)]">
        {/* Gradient bar */}
        <div className="h-[80px] bg-gradient-to-r from-[var(--a1)] via-[var(--a2)] to-[var(--a3)]" />
        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-9 mb-4">
            <UserAvatar
              picture={user?.picture}
              initials={user?.initials}
              name={user?.name}
              className="w-16 h-16 rounded-2xl bg-[var(--a1)] border-4 border-[var(--s1)] text-[22px] text-black shadow-[var(--d2)] flex-shrink-0"
            />
            <div className="pb-1">
              <div className="text-[17px] font-bold text-[var(--t1)] leading-tight">{user?.name ?? 'User'}</div>
              <div className="text-[12px] text-[var(--t3)] capitalize">{user?.role ?? 'viewer'} · {user?.organisation ?? 'HKS Inc.'}</div>
            </div>
            <div className="ml-auto flex items-center gap-2 pb-1">
              <span className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-[var(--ok-t)] border border-[var(--ok-b)] text-[10.5px] font-bold text-[var(--ok)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" />Active
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Projects',    value: '4'        },
              { label: 'Experiments', value: '12'       },
              { label: 'Member since',value: 'Jan 2024' },
              { label: 'Last login',  value: 'Today'    },
            ].map(s => (
              <div key={s.label} className="bg-[var(--s2)] rounded-[var(--rl)] px-3 py-2.5 border border-[var(--s3)]">
                <div className="text-[9.5px] font-bold text-[var(--t3)] uppercase tracking-[.07em] mb-0.5">{s.label}</div>
                <div className="text-[14px] font-bold text-[var(--t1)]">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-4 bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] p-1 w-fit shadow-[var(--d1)]">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              'h-7 px-4 rounded-md text-[12px] font-semibold transition-all',
              activeSection === s.id
                ? 'bg-[var(--a1)] text-black shadow-[var(--d1)]'
                : 'text-[var(--t2)] hover:bg-[var(--s2)]'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Profile section */}
      {activeSection === 'profile' && (
        <div className="grid grid-cols-[1fr_360px] gap-4">
          <Card className="flex flex-col gap-4">
            <SectionHead>Personal information</SectionHead>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Full name</label><input className={inputCls} defaultValue={user?.name ?? ''} /></div>
              <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Display name</label><input className={inputCls} defaultValue={user?.name ?? ''} /></div>
            </div>
            <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Email address</label><input className={inputCls} defaultValue={user?.email ?? ''} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Organisation</label><input className={inputCls} defaultValue={user?.organisation ?? ''} /></div>
              <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Department</label><input className={inputCls} defaultValue="Data Science" /></div>
            </div>
            <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Bio</label><textarea className={inputCls + ' !h-16 py-2 resize-none'} placeholder="Short bio…" /></div>
            <div className="flex justify-end pt-1">
              <button onClick={() => toast.success('Saved', 'Profile updated.')} className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors shadow-[var(--d1)]">Save changes</button>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <SectionHead>Avatar</SectionHead>
              <div className="flex flex-col items-center gap-3 py-2">
                <UserAvatar
                  picture={user?.picture}
                  initials={user?.initials}
                  name={user?.name}
                  className="w-16 h-16 rounded-2xl bg-[var(--a1)] text-[22px] text-black shadow-[var(--d2)]"
                />
                <button onClick={() => toast.info('Upload', 'Image picker coming soon.')} className="h-7 px-3 rounded-md border border-[var(--s4)] text-[11.5px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Upload photo</button>
                <p className="text-[10px] text-[var(--t4)] text-center">PNG, JPG or GIF · max 2 MB</p>
              </div>
            </Card>
            <Card>
              <SectionHead>Role & access</SectionHead>
              {([
                ['Role',         user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Viewer'],
                ['Access level', user?.role === 'admin' ? 'Full access' : user?.role === 'analyst' ? 'Read / Write' : user?.role === 'manager' ? 'Approve / Export' : 'Read only'],
                ['Organisation', user?.organisation ?? 'HKS Inc.'],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-[var(--s3)] last:border-b-0 text-[12px]">
                  <span className="text-[var(--t3)]">{l}</span>
                  <span className="font-semibold text-[var(--t1)]">{v}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* Security section */}
      {activeSection === 'security' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col gap-3.5">
            <SectionHead>Change password</SectionHead>
            <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Current password</label><input type="password" className={inputCls} placeholder="••••••••" /></div>
            <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">New password</label><input type="password" className={inputCls} placeholder="••••••••" /></div>
            <div><label className="text-[11px] font-semibold text-[var(--t2)] mb-1.5 block">Confirm new password</label><input type="password" className={inputCls} placeholder="••••••••" /></div>
            <button onClick={() => toast.success('Changed', 'Password updated.')} className="h-8 px-4 rounded-md bg-[var(--a1)] text-black text-[12px] font-bold hover:bg-[var(--a2)] transition-colors shadow-[var(--d1)]">Update password</button>
          </Card>
          <Card className="self-start">
            <SectionHead>Two-factor authentication</SectionHead>
            <div className="flex items-start gap-3 p-3 bg-[var(--s2)] rounded-[var(--rl)] border border-[var(--s3)] mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--wa-t)] flex items-center justify-center flex-shrink-0"><Download size={14} className="text-[var(--wa)]" /></div>
              <div><div className="text-[12px] font-bold text-[var(--t1)]">2FA not enabled</div><div className="text-[11px] text-[var(--t3)] mt-0.5">Add an extra layer of security to your account.</div></div>
            </div>
            <button onClick={() => toast.info('2FA', 'Setup coming soon.')} className="w-full h-8 rounded-md border border-[var(--s4)] text-[12px] font-semibold text-[var(--t2)] hover:bg-[var(--s2)] transition-colors">Enable 2FA</button>
          </Card>
        </div>
      )}

      {/* Sessions section */}
      {activeSection === 'sessions' && (
        <Card>
          <SectionHead>Active sessions</SectionHead>
          <div className="flex flex-col gap-2">
            {SESSIONS.map((s, i) => (
              <div key={i} className={cn('flex items-center gap-3 p-3 rounded-[var(--rl)] border transition-all', s.current ? 'bg-[var(--a3)] border-[var(--a4)]' : 'bg-[var(--s2)] border-[var(--s3)]')}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', s.current ? 'bg-[var(--a1)]' : 'bg-[var(--s3)]')}>
                  <Folder size={14} className={s.current ? 'text-black' : 'text-[var(--t3)]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[var(--t1)]">{s.device}</span>
                    {s.current && <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-[var(--ok-t)] text-[var(--ok)] border border-[var(--ok-b)]">Current</span>}
                  </div>
                  <div className="text-[11px] text-[var(--t3)]">{s.location} · {s.time}</div>
                </div>
                {!s.current && (
                  <button onClick={() => toast.success('Revoked', 'Session ended.')} className="h-6 px-2.5 rounded-md border border-[var(--er-b)] text-[10.5px] font-semibold text-[var(--er)] hover:bg-[var(--er-t)] transition-colors">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}

// ─── PREFERENCES PAGE ─────────────────────────────────────────────────────────
export function PreferencesPage() {
  const toast = useToast()
  return (
    <DashboardLayout>
      <div className="flex items-start justify-between mb-4"><div><h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Preferences</h1><p className="text-[12px] text-[var(--t2)] mt-0.5">Personalise your experience</p></div></div>
      <Card className="max-w-[480px]">
        <SectionHead>Display</SectionHead>
        <Row label="Dark mode"><Toggle /></Row>
        <Row label="Collapsed sidebar by default"><Toggle /></Row>
        <Row label="Date format"><select className={selectCls + ' w-40'}><option>DD MMM YYYY</option><option>MM/DD/YYYY</option></select></Row>
        <SectionHead className="mt-4">Notifications</SectionHead>
        <Row label="Experiment complete"><Toggle defaultOn /></Row>
        <Row label="Quality alerts"><Toggle defaultOn /></Row>
        <Row label="Ticket updates"><Toggle /></Row>
        <button onClick={() => toast.success('Saved', 'Preferences saved.')} className="mt-4 h-9 px-5 rounded-md bg-[var(--a1)] text-white text-[12px] font-bold hover:bg-[var(--a2)] shadow-[0_2px_8px_rgba(74,111,165,.3)] transition-colors">Save preferences</button>
      </Card>
    </DashboardLayout>
  )
}
