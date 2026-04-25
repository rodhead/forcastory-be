// src/types/common/index.ts
// Shared domain types used across features

export type Role = 'admin' | 'analyst' | 'viewer' | 'manager'
export type Theme = 'light' | 'dark'
export type Granularity = 'hourly' | 'daily' | 'weekly' | 'monthly'

export interface User {
  id: string
  name: string
  email: string
  picture?: string
  role: Role
  organisation: string
  initials: string
}

export interface Project {
  id: string
  name: string
  description: string
  industry: 'CPG' | 'Retail' | 'QSR' | 'Manufacturing'
  purpose: 'Demand Planning' | 'Inventory Planning' | 'Replenishment' | 'Production Planning'
  granularity: Granularity
  recordCount: number
  combinations: number
  status: 'active' | 'idle' | 'archived'
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface QualityScore {
  overall: number
  completeness: number
  consistency: number
  variability: number
  intermittency: number
  outlierScore: number
  issueCount: number
}

export interface Experiment {
  id: string
  projectId: string
  name: string
  description?: string
  models: string[]
  status: 'queued' | 'running' | 'done' | 'failed'
  bestMape?: number
  bestWmape?: number
  trainUntil: string
  validateUntil: string
  durationMs?: number
  createdAt: string
}

export interface ProjectFile {
  id: string
  projectId: string
  name: string
  type: 'csv' | 'json' | 'folder'
  sizeBytes: number
  rowCount?: number
  modifiedAt: string
  protected?: boolean
  children?: ProjectFile[]
}

export interface SupportTicket {
  id: string
  title: string
  type: 'Bug Fix' | 'Enhancement Request' | 'Application Error'
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface TicketComment {
  id: string
  author: string
  authorInitials: string
  authorRole: string
  body: string
  createdAt: string
  isInternal?: boolean
}

export interface TicketEvent {
  id: string
  type: 'created' | 'status_changed' | 'assigned' | 'priority_changed' | 'resolved' | 'reopened' | 'escalated' | 'comment'
  actor: string
  detail: string
  timestamp: string
}

export interface TicketDetail extends SupportTicket {
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  assigneeInitials?: string
  createdBy: string
  createdByInitials: string
  description: string
  projectRef?: string
  events: TicketEvent[]
  comments: TicketComment[]
}

// API response wrapper
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    perPage?: number
  }
}

// Generic async state
export interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}
