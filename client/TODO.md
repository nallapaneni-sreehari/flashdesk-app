# FlashDesk MVP Progress Tracker

> Last Updated: March 12, 2026

## Workspace Setup (Frontend)

- [ ] Setup page — `/setup` route (shown when no workspace exists)
  - Step 1: Workspace name, slug (auto-generated from name)
  - Step 2: Admin user — first name, last name, email, password
  - Submit: calls `POST /api/setup`
  - On success: store JWT, redirect to dashboard
- [ ] Setup guard — redirects to `/setup` if `GET /api/setup/check` returns `setupComplete: false`
- [ ] Clean, minimal design (like Notion/Linear onboarding)

---

## Overview

FlashDesk is a modern SaaS helpdesk/ticketing system built with Angular 18+, PrimeNG, and TailwindCSS.

---

## ✅ Completed Features

### Core Infrastructure
- [x] Angular 18+ project setup with standalone components
- [x] PrimeNG v19 integration
- [x] TailwindCSS v4 with CSS variables
- [x] Dark mode support with semantic color tokens
- [x] Main layout with sidebar navigation
- [x] Top navigation bar
- [x] Route configuration
- [x] Toast notification service
- [x] Loader service with overlay
- [x] Confirm dialog service
- [x] Theme configurator (brand colors)

### Ticket Management
- [x] Ticket list page
  - [x] List view (table with sorting, pagination)
  - [x] Card view (responsive grid)
  - [x] Kanban view (status-based columns)
  - [x] View toggle buttons
  - [x] Search functionality
  - [x] Status/Priority quick filters
  - [x] Advanced filters sidebar (date ranges, channels, agents, types)
  - [x] Quick filter pills (Assigned to me, Unassigned, etc.)
  - [x] Bulk selection & actions (assign, resolve, delete)
  - [x] Custom workflow-based sorting (status/priority)
  - [x] Inline agent assignment (double-click)

- [x] Ticket detail page
  - [x] Ticket header with ID, type badge, priority indicator
  - [x] Workflow status pills with chevron navigation
  - [x] Status transitions (Open → In Progress → Waiting → Resolved → Closed)
  - [x] Priority selector
  - [x] Type selector (Incident, Issue, Bug, Request, etc.)
  - [x] Agent assignment with search
  - [x] Followers multi-select
  - [x] Customer info display
  - [x] Rich text description with edit mode
  - [x] Conversation thread (public messages)
  - [x] Internal notes (agent-only)
  - [x] Reply composer with rich text editor
  - [x] SLA indicators (First Response, Resolution)
  - [x] Timeline/Timestamps
  - [x] Tags display
  - [x] Change tracking with unsaved indicator
  - [x] Confirm dialog for pending changes
  - [x] More actions menu (refresh, duplicate, print, export PDF, etc.)
  - [x] History accordion (activity log)

### Agent Management
- [x] Agents list page (basic table)
- [x] Agent dialog (create/edit)
- [x] Agent avatars

### Dashboard
- [x] Dashboard page with full widgets
  - [x] Summary stats cards (Open, Resolved Today, Unassigned, Overdue, Avg Response, Total)
  - [x] Ticket count by status with progress bars
  - [x] Tickets created over time (bar chart)
  - [x] SLA compliance (circular gauge + progress bars)
  - [x] Top agents by resolved tickets leaderboard
  - [x] Recent activity feed

### Data Layer
- [x] Mock data service with interfaces
- [x] Ticket, Agent, Customer, Message interfaces
- [x] Generated mock tickets (75+)
- [x] Multiple customers and agents

### UI/UX
- [x] Global search component (UI only)
- [x] Form field styling (inputs, selects, datepickers)
- [x] Responsive design
- [x] Loading states
- [x] Empty states
- [x] Keyboard shortcuts indicator (Ctrl+K)

---

## 🔄 In Progress

*Nothing currently in progress*

---

## 📋 TODO - MVP Features

### Priority 1 - Critical Path
- [x] **Create Ticket Dialog**
  - Modal form for creating new tickets
  - Fields: Subject, Description, Customer, Type, Priority, Assigned Agent
  - Validation and submission
  
- [x] **Authentication & Login**
  - Login page UI (manual + SSO)
  - Auth service (mock)
  - Route guards (authGuard, guestGuard, roleGuard)
  - Session management (localStorage)
  - Logout functionality

### Priority 2 - Core Functionality
- [ ] **Customer Portal**
  - Separate layout for customers
  - Submit new ticket form
  - View own tickets list
  - View ticket detail & replies
  - Add reply to ticket

- [x] **Dashboard Widgets** ✅
  - [x] Ticket count by status (cards)
  - [x] Tickets created over time (chart)
  - [x] SLA compliance percentage
  - [x] Top agents by resolved tickets
  - [x] Recent activity feed

- [x] **Canned Responses** ✅
  - [x] Manage response templates (CRUD)
  - [x] Insert template in reply composer
  - [x] Template categories

### Priority 3 - Enhancement
- [x] **User Profile & Settings**
  - Profile page
  - Change password
  - Notification preferences
  - Personal settings

- [x] **Knowledge Base**
  - Article list
  - Article detail with rich content
  - Category organization
  - Search functionality
  - Link articles to tickets

- [x] **SLA Policy Configuration**
  - Define SLA policies (admin)
  - Set response/resolution times by priority
  - Business hours configuration

- [ ] **Email Notifications**
  - Notification triggers (new ticket, reply, assignment)
  - Email templates
  - Follower notifications

### Priority 4 - Nice to Have
- [ ] **Automation Rules**
  - Rule builder UI
  - Trigger conditions
  - Actions (assign, tag, change status)

- [ ] **Ticket Merge**
  - Select tickets to merge
  - Combine conversations

- [ ] **Ticket Split**
  - Split conversation into new ticket

- [ ] **Real-time Updates**
  - WebSocket integration
  - Live ticket updates
  - Agent presence indicators

- [ ] **Reporting & Analytics**
  - Ticket volume reports
  - Agent performance
  - SLA reports
  - Export to CSV/PDF

- [ ] **Implement Scroll Pagination for Customer/Agent in Ticket Creatation**
  - get first 100 users
  - get others as user scrolls all 100 users, or searches for particular user
---

## 🐛 Known Issues

*None reported*

---

## 📝 Notes

- Admin can load support agents data from settings using CSV, or setup agent manually
- All UI follows PrimeNG + Tailwind design system
- Dark mode uses CSS variables (no Tailwind `dark:` variants)
- Form styling uses `--input-shadow` and `--input-focus-shadow` tokens

---

## 📊 Progress Summary

| Category | Completed | Total | Progress |
|----------|-----------|-------|----------|
| Core Infrastructure | 11 | 11 | 100% |
| Ticket Management | 33 | 33 | 100% |
| Agent Management | 3 | 3 | 100% |
| Dashboard | 7 | 7 | 100% |
| Authentication | 5 | 5 | 100% |
| Customer Portal | 0 | 5 | 0% |
| Knowledge Base | 0 | 5 | 0% |
| **Overall MVP** | **59** | **69** | **~86%** |