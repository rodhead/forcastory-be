// src/pages/support.message.ts
// All translatable strings for the Support page and Ticket wizard.
// Run `npm run message:extract` to sync new messages into en.json.
import { defineMessages } from 'react-intl'

export const supportMessages = defineMessages({
  // ── Page header ─────────────────────────────────────────────────────────────
  title: {
    id: 'support.title',
    defaultMessage: 'Support',
  },
  subtitle: {
    id: 'support.subtitle',
    defaultMessage: 'Raise tickets · track issues · browse FAQ',
  },
  newTicket: {
    id: 'support.newTicket',
    defaultMessage: 'New ticket',
  },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  tabTickets: {
    id: 'support.tab.tickets',
    defaultMessage: 'Tickets ({count})',
  },
  tabFaq: {
    id: 'support.tab.faq',
    defaultMessage: 'FAQ',
  },

  // ── Ticket list ─────────────────────────────────────────────────────────────
  sectionOpen: {
    id: 'support.section.open',
    defaultMessage: 'Open',
  },
  sectionResolved: {
    id: 'support.section.resolved',
    defaultMessage: 'Resolved',
  },
  emptyTitle: {
    id: 'support.empty.title',
    defaultMessage: 'No tickets yet',
  },
  emptyBody: {
    id: 'support.empty.body',
    defaultMessage: 'Click "New ticket" to raise a support request.',
  },

  // ── Quick stats ──────────────────────────────────────────────────────────────
  statsOpenTickets: {
    id: 'support.stats.openTickets',
    defaultMessage: 'Open tickets',
  },
  statsResolved: {
    id: 'support.stats.resolved',
    defaultMessage: 'Resolved',
  },
  statsAvgResponse: {
    id: 'support.stats.avgResponse',
    defaultMessage: 'Avg response',
  },
  statsSla: {
    id: 'support.stats.sla',
    defaultMessage: 'SLA compliance',
  },

  // ── FAQ section ──────────────────────────────────────────────────────────────
  faqTitle: {
    id: 'support.faq.title',
    defaultMessage: 'Frequently asked questions',
  },
  faqSubtitle: {
    id: 'support.faq.subtitle',
    defaultMessage: '{count} articles · Forecasting platform',
  },

  // ── Wizard shell ─────────────────────────────────────────────────────────────
  wizardTitle: {
    id: 'support.wizard.title',
    defaultMessage: 'New support ticket',
  },
  wizardSubtitle: {
    id: 'support.wizard.subtitle',
    defaultMessage: 'Complete all steps to submit.',
  },

  // ── Wizard steps (sidebar labels) ───────────────────────────────────────────
  step1Title: {
    id: 'support.wizard.step1.title',
    defaultMessage: 'Category',
  },
  step1Desc: {
    id: 'support.wizard.step1.desc',
    defaultMessage: 'Issue type and priority',
  },
  step2Title: {
    id: 'support.wizard.step2.title',
    defaultMessage: 'Details',
  },
  step2Desc: {
    id: 'support.wizard.step2.desc',
    defaultMessage: 'Title and description',
  },
  step3Title: {
    id: 'support.wizard.step3.title',
    defaultMessage: 'Review',
  },
  step3Desc: {
    id: 'support.wizard.step3.desc',
    defaultMessage: 'Confirm and submit',
  },

  // ── Wizard step 1 content ───────────────────────────────────────────────────
  step1Heading: {
    id: 'support.wizard.step1.heading',
    defaultMessage: 'Category & priority',
  },
  step1Subheading: {
    id: 'support.wizard.step1.subheading',
    defaultMessage: "Select the type of issue you're experiencing.",
  },
  labelPriority: {
    id: 'support.wizard.label.priority',
    defaultMessage: 'Priority',
  },

  // ── Wizard step 2 content ───────────────────────────────────────────────────
  step2Heading: {
    id: 'support.wizard.step2.heading',
    defaultMessage: 'Ticket details',
  },
  step2Subheading: {
    id: 'support.wizard.step2.subheading',
    defaultMessage: 'Describe the issue clearly so the team can help quickly.',
  },
  labelTitle: {
    id: 'support.wizard.label.title',
    defaultMessage: 'Title',
  },
  labelDescription: {
    id: 'support.wizard.label.description',
    defaultMessage: 'Description',
  },
  labelAttachments: {
    id: 'support.wizard.label.attachments',
    defaultMessage: 'Attachments',
  },
  placeholderTitle: {
    id: 'support.wizard.placeholder.title',
    defaultMessage: 'Brief description of the issue',
  },
  placeholderDescription: {
    id: 'support.wizard.placeholder.description',
    defaultMessage: 'Steps to reproduce, expected vs actual behavior, screenshots…',
  },
  dropzone: {
    id: 'support.wizard.dropzone',
    defaultMessage: 'Drop files here or click to browse',
  },
  dropzoneHint: {
    id: 'support.wizard.dropzone.hint',
    defaultMessage: 'PNG, JPG, PDF · max 10 MB',
  },

  // ── Wizard step 3 content ───────────────────────────────────────────────────
  step3Heading: {
    id: 'support.wizard.step3.heading',
    defaultMessage: 'Review & submit',
  },
  step3Subheading: {
    id: 'support.wizard.step3.subheading',
    defaultMessage: 'Confirm your ticket details before submitting.',
  },
  reviewCategory: {
    id: 'support.wizard.review.category',
    defaultMessage: 'Category',
  },
  reviewPriority: {
    id: 'support.wizard.review.priority',
    defaultMessage: 'Priority',
  },
  reviewTitle: {
    id: 'support.wizard.review.title',
    defaultMessage: 'Title',
  },
  reviewDescription: {
    id: 'support.wizard.review.description',
    defaultMessage: 'Description',
  },
  reviewNotProvided: {
    id: 'support.wizard.review.notProvided',
    defaultMessage: 'Not provided',
  },
  wizardNotice: {
    id: 'support.wizard.notice',
    defaultMessage: "The support team typically responds within 4 hours. You'll receive an email notification when they reply.",
  },

  // ── Wizard footer buttons ────────────────────────────────────────────────────
  cancel: {
    id: 'support.wizard.cancel',
    defaultMessage: 'Cancel',
  },
  back: {
    id: 'support.wizard.back',
    defaultMessage: 'Back',
  },
  next: {
    id: 'support.wizard.next',
    defaultMessage: 'Next',
  },
  submit: {
    id: 'support.wizard.submit',
    defaultMessage: 'Submit ticket',
  },
  submitting: {
    id: 'support.wizard.submitting',
    defaultMessage: 'Submitting…',
  },

  // ── Toast notifications ──────────────────────────────────────────────────────
  toastTitle: {
    id: 'support.wizard.toast.title',
    defaultMessage: 'Ticket submitted',
  },
  toastBody: {
    id: 'support.wizard.toast.body',
    defaultMessage: 'Your ticket has been created and the team has been notified.',
  },

  // ── Category labels ──────────────────────────────────────────────────────────
  categoryBugFix: {
    id: 'support.category.bugFix',
    defaultMessage: 'Bug Fix',
  },
  categoryEnhancement: {
    id: 'support.category.enhancement',
    defaultMessage: 'Enhancement Request',
  },
  categoryAppError: {
    id: 'support.category.appError',
    defaultMessage: 'Application Error',
  },
  categoryOther: {
    id: 'support.category.other',
    defaultMessage: 'Other',
  },

  // ── Priority labels ──────────────────────────────────────────────────────────
  priorityLow: {
    id: 'support.priority.low',
    defaultMessage: 'Low',
  },
  priorityMedium: {
    id: 'support.priority.medium',
    defaultMessage: 'Medium',
  },
  priorityHigh: {
    id: 'support.priority.high',
    defaultMessage: 'High',
  },
  priorityCritical: {
    id: 'support.priority.critical',
    defaultMessage: 'Critical',
  },
})
