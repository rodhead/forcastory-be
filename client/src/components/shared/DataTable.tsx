// src/components/shared/DataTable.tsx
import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { PageLoading } from './Loading'

export interface ColumnDef<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  className?: string
  headerClassName?: string
  render?: (row: T, index: number) => React.ReactNode
  getValue?: (row: T) => string | number   // used for sorting
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  getRowKey: (row: T) => string
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (row: T) => void
  // Tree table support
  getChildren?: (row: T) => T[] | undefined
  defaultExpanded?: boolean
  // Toolbar — passed through as-is
  toolbar?: React.ReactNode
  className?: string
}

type SortDir = 'asc' | 'desc' | null

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc')  return <ChevronUp   size={12} className="text-[var(--a1)]" />
  if (dir === 'desc') return <ChevronDown  size={12} className="text-[var(--a1)]" />
  return <ChevronsUpDown size={12} className="text-[var(--t4)] group-hover:text-[var(--t3)]" />
}

function DataRow<T>({
  row, columns, depth, getRowKey, getChildren, defaultExpanded, onRowClick, index,
}: {
  row: T
  columns: ColumnDef<T>[]
  depth: number
  index: number
  getRowKey: (row: T) => string
  getChildren?: (row: T) => T[] | undefined
  defaultExpanded?: boolean
  onRowClick?: (row: T) => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)
  const children = getChildren?.(row)
  const hasChildren = children && children.length > 0

  return (
    <>
      <tr
        className={cn(
          'border-b border-[var(--s3)] last:border-b-0 transition-colors',
          onRowClick ? 'cursor-pointer hover:bg-[var(--s2)]' : 'hover:bg-[var(--s2)]'
        )}
        onClick={() => onRowClick?.(row)}
      >
        {columns.map((col, ci) => (
          <td
            key={col.key}
            className={cn('py-2.5 px-3 text-[12px] text-[var(--t2)]', col.className)}
            style={{ width: col.width }}
          >
            {ci === 0 && depth > 0 && (
              <span
                className="inline-block"
                style={{ width: depth * 20 + 'px', flexShrink: 0 }}
              />
            )}
            {ci === 0 && hasChildren && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(p => !p) }}
                className="mr-1.5 inline-flex items-center justify-center w-4 h-4 rounded text-[var(--t3)] hover:text-[var(--a1)] hover:bg-[var(--s3)] transition-colors"
              >
                <ChevronRight size={12} className={cn('transition-transform', expanded && 'rotate-90')} />
              </button>
            )}
            {ci === 0 && !hasChildren && depth === 0 && getChildren && (
              <span className="inline-block w-[22px]" />
            )}
            {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '—')}
          </td>
        ))}
      </tr>
      {hasChildren && expanded && children.map((child, ci) => (
        <DataRow
          key={getRowKey(child)}
          row={child}
          columns={columns}
          depth={depth + 1}
          index={ci}
          getRowKey={getRowKey}
          getChildren={getChildren}
          defaultExpanded={defaultExpanded}
          onRowClick={onRowClick}
        />
      ))}
    </>
  )
}

export function DataTable<T extends object>({
  columns,
  data,
  getRowKey,
  loading,
  emptyMessage = 'No data',
  emptyIcon,
  onRowClick,
  getChildren,
  defaultExpanded,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<SortDir>(null)

  function toggleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return }
    if (sortDir === 'asc')  { setSortDir('desc'); return }
    setSortKey(null); setSortDir(null)
  }

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data
    const col = columns.find(c => c.key === sortKey)
    return [...data].sort((a, b) => {
      const av = col?.getValue ? col.getValue(a) : ((a as Record<string, unknown>)[sortKey] ?? '')
      const bv = col?.getValue ? col.getValue(b) : ((b as Record<string, unknown>)[sortKey] ?? '')
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir, columns])

  return (
    <div className={cn('bg-[var(--s1)] border border-[var(--s4)] rounded-[var(--rl)] overflow-hidden shadow-[var(--d1)]', className)}>
      {toolbar && (
        <div className="px-3 py-2.5 border-b border-[var(--s3)] bg-[var(--s2)]">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--s4)] bg-[var(--s2)]">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left text-[10px] font-bold text-[var(--t3)] uppercase tracking-[.07em] px-3 py-2.5 select-none',
                    col.sortable && 'cursor-pointer group hover:text-[var(--t1)]',
                    col.headerClassName
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon dir={sortKey === col.key ? sortDir : null} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-10">
                  <PageLoading message="Loading…" />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    {emptyIcon && <div className="w-10 h-10 rounded-xl bg-[var(--s2)] border border-[var(--s4)] flex items-center justify-center">{emptyIcon}</div>}
                    <p className="text-[12px] text-[var(--t3)]">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <DataRow
                  key={getRowKey(row)}
                  row={row}
                  columns={columns}
                  depth={0}
                  index={i}
                  getRowKey={getRowKey}
                  getChildren={getChildren}
                  defaultExpanded={defaultExpanded}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && sorted.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--s3)] flex items-center bg-[var(--s2)]">
          <span className="text-[10.5px] text-[var(--t4)]">{sorted.length} {sorted.length === 1 ? 'row' : 'rows'}</span>
        </div>
      )}
    </div>
  )
}
