# Dashboard Module — Technical Documentation

> Last Updated: March 14, 2026

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [1. Welcome Header](#1-welcome-header)
- [2. Priority Alerts Banner](#2-priority-alerts-banner)
- [3. KPI Cards Row](#3-kpi-cards-row)
- [4. Ticket Volume Chart](#4-ticket-volume-chart)
- [5. Needs Attention / Your Priorities](#5-needs-attention--your-priorities)
- [6. Recent Activity](#6-recent-activity)
- [7. Top Performers](#7-top-performers)
- [Data Flow](#data-flow)
- [File Inventory](#file-inventory)

---

## Overview

The Dashboard is the landing page after login. It provides a real-time operational overview of the support system. The view is **role-aware** — admins and agents see different data in certain sections.

**Route:** `/dashboard`
**Guard:** `authGuard` (requires authenticated user)
**Layout:** Rendered inside `MainLayoutComponent` (sidebar + topbar)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome Header   (greeting, date, actions)                 │
├─────────────────────────────────────────────────────────────┤
│  Priority Alerts Banner   (conditional, red banner)         │
├──────────┬──────────┬──────────┬───────────────────────────┤
│  Open    │ Resolved │ Avg Resp │  SLA Compliance           │
│  Tickets │ Today    │ Time     │                           │
├──────────┴──────────┴──────────┴───────────────────────────┤
│                                │                           │
│  Ticket Volume Chart           │  Recent Activity          │
│  (line chart, configurable)    │  (scrollable list)        │
│                                │                           │
├────────────────────────────────┤                           │
│                                ├───────────────────────────┤
│  Needs Attention (admin)       │  Top Performers           │
│  — OR —                        │  (admin only)             │
│  Your Priorities (agent)       │                           │
│                                │                           │
└────────────────────────────────┴───────────────────────────┘
```

**Grid Layout:** 3-column grid on `xl` breakpoints. Left column spans 2/3, right column spans 1/3.

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header. All are scoped to the authenticated user's workspace.

| Method | Endpoint                       | Description                             | Data Source |
|--------|--------------------------------|-----------------------------------------|-------------|
| GET    | `/api/dashboard/summary`       | KPI card metrics + SLA compliance       | Real API    |
| GET    | `/api/dashboard/activity`      | Recent ticket history entries           | Real API    |
| GET    | `/api/dashboard/needs-attention` | Role-aware priority tickets           | Real API    |

---

## 1. Welcome Header

**Data Source:** Client-side (AuthService, browser clock)

### What is displayed

| Element              | Value                                                             | Example                         |
|----------------------|-------------------------------------------------------------------|---------------------------------|
| Greeting             | Time-of-day greeting (computed signal)                            | "Good morning"                  |
| User first name      | `currentUser().name.split(' ')[0]`                                | "Jane"                          |
| Wave emoji           | Static `👋`                                                       | 👋                              |
| Date                 | `formatDate(currentDate)` — weekday, month, day                   | "Thursday, March 14"            |
| Subtitle             | Static text                                                       | "Here's what's happening..."    |

### Greeting logic

```
Before 12:00 → "Good morning"
12:00–16:59  → "Good afternoon"
17:00+       → "Good evening"
```

### Action buttons

| Button       | Icon           | Action                                          |
|--------------|----------------|--------------------------------------------------|
| New Ticket   | `pi pi-plus`   | Navigates to `/tickets?action=new`               |
| Refresh      | `pi pi-refresh`| Calls `loadDashboardData()`, shows success toast |

---

## 2. Priority Alerts Banner

**Data Source:** `GET /api/dashboard/summary` (fields: `overdueTickets`, `unassigned`)
**Visibility:** Conditional — only shown when problems exist

### Display conditions

The red alert banner appears when **either** condition is true:

| Condition                   | Who sees it       |
|-----------------------------|-------------------|
| `overdueTickets > 0`        | All users         |
| `unassigned > 3` (admins)   | Admins only       |

### What is displayed

- **Icon:** `pi pi-exclamation-triangle` in a red circle
- **Title:** "Attention needed"
- **Body text (dynamic):**
  - `"{X} overdue ticket(s)"` — if overdue tickets exist
  - Separator ` · ` — if both conditions met
  - `"{X} unassigned tickets"` — if admin and unassigned > 3
- **Action button:** "View" → navigates to `/tickets?filter=overdue`

### Styling

- Background: `bg-red-50` (light) / `bg-red-900/20` (dark)
- Border: `border-red-200` (light) / `border-red-800` (dark)

---

## 3. KPI Cards Row

**Data Source:** `GET /api/dashboard/summary`
**Layout:** 4-column grid (`grid-cols-2` on mobile, `lg:grid-cols-4` on desktop)
**Loading state:** 4 skeleton cards with animated placeholders

### API Response Shape

```json
{
  "totalOpen": 12,
  "resolvedToday": 5,
  "unassigned": 3,
  "overdueTickets": 2,
  "avgResponseHours": 1.8,
  "totalTickets": 150,
  "sla": {
    "firstResponse": 92,
    "resolution": 85,
    "overall": 88
  }
}
```

### Card 1: Open Tickets

| Property        | Value                                                   |
|-----------------|---------------------------------------------------------|
| Icon            | `pi pi-inbox` (primary color)                           |
| Label           | "Open Tickets"                                          |
| Value           | `summary.totalOpen` — count of tickets with status `open`, `in_progress`, or `waiting` |
| Sub-label       | `"{X} unassigned"` in amber — shown only when `unassigned > 0` |
| Hover action    | "View all →"                                             |
| Click           | Navigates to `/tickets?status=open`                      |

**Backend query:**
```sql
COUNT(*) FROM tickets
WHERE workspace_id = $1
  AND status IN ('open', 'in_progress', 'waiting')
```

### Card 2: Resolved Today

| Property        | Value                                                   |
|-----------------|---------------------------------------------------------|
| Icon            | `pi pi-check-circle` (emerald)                          |
| Label           | "Resolved Today"                                        |
| Value           | `summary.resolvedToday` — count of tickets resolved/closed since midnight today |
| Sub-label       | "tickets" (static)                                       |
| Hover action    | "View resolved →"                                        |
| Click           | Navigates to `/tickets?status=resolved`                  |

**Backend query:**
```sql
COUNT(*) FROM tickets
WHERE workspace_id = $1
  AND status IN ('resolved', 'closed')
  AND resolved_at >= TODAY_MIDNIGHT
```

### Card 3: Avg Response

| Property        | Value                                                   |
|-----------------|---------------------------------------------------------|
| Icon            | `pi pi-stopwatch` (blue)                                |
| Label           | "Avg Response"                                          |
| Value           | `summary.avgResponseHours` — average first response time in hours (1 decimal) |
| Unit            | "hrs"                                                    |
| Progress bar    | Color-coded bar indicating performance                   |
| Not clickable   | Static card (no navigation)                              |

**Progress bar color logic:**

| Avg Response Hours | Bar Color | Interpretation |
|--------------------|-----------|----------------|
| ≤ 1 hour           | Emerald   | Excellent      |
| ≤ 2 hours          | Blue      | Good           |
| ≤ 4 hours          | Amber     | Needs improvement |
| > 4 hours          | Red       | Poor           |

**Bar width:** `100% - min((avgResponseHours / 8) × 100, 100)%` — inversely proportional (faster = fuller bar)

**Backend calculation:**
1. Fetch all tickets with `firstResponseAt` not null
2. For each: `responseTime = firstResponseAt - createdAt`
3. Average all response times, convert to hours, round to 1 decimal

### Card 4: SLA Compliance

| Property        | Value                                                   |
|-----------------|---------------------------------------------------------|
| Icon            | `pi pi-shield` (violet)                                 |
| Label           | "SLA Compliance"                                        |
| Value           | `slaCompliance.overall` — average of first response + resolution compliance |
| Unit            | "%"                                                      |
| Progress bar    | Two-segment bar (first response %, resolution %)         |
| Sub-labels      | "Response X%" and "Resolution X%" below the bar          |
| Not clickable   | Static card                                              |

**Value color logic:**

| Overall % | Text Color | Blob Color |
|-----------|------------|------------|
| ≥ 80%     | Emerald    | Emerald    |
| ≥ 60%     | Amber      | Amber      |
| < 60%     | Red        | Red        |

**Backend SLA calculation:**

1. Fetch all tickets that have `firstResponseDue` or `resolutionDue` set
2. **First Response compliance:**
   - Met: `firstResponseAt ≤ firstResponseDue`
   - Or: no response yet but `now ≤ firstResponseDue` (still within window)
3. **Resolution compliance:**
   - Met: `resolvedAt ≤ resolutionDue`
   - Or: not yet resolved but `now ≤ resolutionDue` (still within window)
4. `firstResponse% = (met / total) × 100`
5. `resolution% = (met / total) × 100`
6. `overall = average(firstResponse%, resolution%)`
7. If no SLA tickets exist, defaults to 100%

### Card UI Details

All 4 cards share these visual properties:
- Rounded corners: `rounded-2xl`
- Hover: lifts up (`-translate-y-0.5`), shadow increases
- Decorative gradient blob appears on hover (top-right corner)
- Skeleton loader during loading state

---

## 4. Ticket Volume Chart

**Data Source:** Mock data (not yet API-backed)
**Chart Library:** Chart.js (line chart)
**Location:** Left column, top

### What is displayed

A dual-line chart showing:
- **Created** line — tickets created per day (primary brand color, gradient fill)
- **Resolved** line — tickets resolved per day (emerald, gradient fill)

### Time range selector

PrimeNG `p-select` dropdown with options:

| Label           | Value (days) |
|-----------------|-------------|
| Last 7 days     | 7           |
| Last 14 days    | 14 (default)|
| Last 30 days    | 30          |
| Last 90 days    | 90          |
| Last year       | 365         |

Changing the range re-fetches data and rebuilds the chart.

### Chart configuration

| Property            | Value                                           |
|---------------------|-------------------------------------------------|
| Type                | `line`                                          |
| Tension             | `0.4` (smooth curves)                           |
| Point radius        | `0` (hidden), `5` on hover                     |
| Fill                | Gradient (brand color → transparent)            |
| Tooltip             | Dark background, rounded, shows both datasets   |
| X-axis grid         | Hidden                                           |
| Y-axis              | Starts at 0, integer steps                       |
| Max X ticks         | 7 (auto-skipped for larger ranges)              |
| Legend               | Custom HTML (colored dots + labels, not Chart.js legend) |
| Height              | 224px (`h-56`)                                   |
| Responsive          | Yes, `maintainAspectRatio: false`                |

### Legend (custom, above chart)

- 🟣 Primary color dot → "Created"
- 🟢 Emerald dot → "Resolved"

---

## 5. Needs Attention / Your Priorities

**Data Source:** `GET /api/dashboard/needs-attention`
**Location:** Left column, below chart
**Behavior:** Role-aware — different title, content, and empty states for admin vs agent

### API Response Shape

```json
{
  "unassigned": [
    {
      "id": "cuid...",
      "ticketNumber": 5,
      "subject": "Cannot login after password reset",
      "status": "open",
      "priority": "high",
      "createdAt": "2026-03-14T10:30:00.000Z",
      "customer": { "id": "cuid...", "name": "John Smith" },
      "assignedAgent": null
    }
  ],
  "escalated": [
    {
      "id": "cuid...",
      "ticketNumber": 3,
      "subject": "API rate limiting 429 errors",
      "status": "open",
      "priority": "urgent",
      "createdAt": "2026-03-13T08:15:00.000Z",
      "customer": { "id": "cuid...", "name": "Mike Chen" },
      "assignedAgent": { "id": "cuid...", "name": "David Kim", "avatar": null }
    }
  ],
  "myTickets": []
}
```

### Section header

| Role   | Title              | Subtitle                              | Icon         | "View all" link                    |
|--------|--------------------|---------------------------------------|--------------|------------------------------------|
| Admin  | "Needs Attention"  | "Tickets requiring admin action"      | `pi pi-bell` | `/tickets?filter=unassigned`       |
| Agent  | "Your Priorities"  | "Tickets that need your attention"    | `pi pi-flag` | `/tickets?filter=assigned-to-me`   |

### Admin view — Two sub-sections

#### Unassigned tickets

| Field                | Data shown                                                      |
|----------------------|-----------------------------------------------------------------|
| **Query**            | `assignedAgentId = null`, status in (`open`, `in_progress`, `waiting`), ordered by `createdAt desc`, limit 5 |
| Section label        | "UNASSIGNED" with amber count badge                              |
| Icon                 | `pi pi-user-plus` (amber background)                            |
| Row line 1           | `#ticketNumber` + priority badge (color-coded)                   |
| Row line 2           | Ticket subject (truncated, bold)                                 |
| Row line 3           | Customer name · relative time (e.g., "5m ago")                   |
| Click action         | Navigates to `/tickets/{ticketNumber}`                           |

#### Escalated tickets

| Field                | Data shown                                                      |
|----------------------|-----------------------------------------------------------------|
| **Query**            | Priority in (`urgent`, `high`), status in (`open`, `in_progress`, `waiting`), ordered by priority asc then `createdAt desc`, limit 5 |
| Section label        | "ESCALATED" with red count badge                                 |
| Icon                 | `pi pi-flag` (priority-colored background)                       |
| Row line 1           | `#ticketNumber` + priority badge                                 |
| Row line 2           | Ticket subject (truncated, bold)                                 |
| Row line 3           | Agent name (if assigned) · status label · relative time          |
| Click action         | Navigates to `/tickets/{ticketNumber}`                           |

#### Admin empty state

When both lists are empty:
- Icon: `pi pi-check-circle` (green)
- Title: "Everything looks good!"
- Subtitle: "No tickets need your attention right now"

### Agent view — My Tickets

| Field                | Data shown                                                      |
|----------------------|-----------------------------------------------------------------|
| **Query**            | `assignedAgentId = currentUserId`, status in (`open`, `in_progress`, `waiting`), ordered by priority asc then `createdAt desc`, limit 5 |
| Icon                 | `pi pi-flag` (priority-colored background)                       |
| Row line 1           | `#ticketNumber` + priority badge                                 |
| Row line 2           | Ticket subject (truncated, bold)                                 |
| Row line 3           | Customer name · status label                                     |
| Click action         | Navigates to `/tickets/{ticketNumber}`                           |

#### Agent empty state

- Icon: `pi pi-check-circle` (green)
- Title: "You're all caught up!"
- Subtitle: "No tickets assigned to you right now"

### Priority badge colors

| Priority | Text Color      | Background                             |
|----------|-----------------|----------------------------------------|
| Urgent   | `text-red-600`  | `bg-red-100` / `dark:bg-red-900/30`   |
| High     | `text-orange-500`| `bg-orange-100` / `dark:bg-orange-900/30` |
| Medium   | `text-yellow-500`| `bg-yellow-100` / `dark:bg-yellow-900/30` |
| Low      | `text-blue-500` | `bg-blue-100` / `dark:bg-blue-900/30` |

---

## 6. Recent Activity

**Data Source:** `GET /api/dashboard/activity?limit=10`
**Location:** Right column, top
**Database table:** `history_entries`

### API Response Shape

```json
[
  {
    "id": "cuid...",
    "type": "assigned",
    "description": "Assigned to Alice Cooper",
    "fromValue": null,
    "toValue": "Alice Cooper",
    "timestamp": "2026-03-14T10:31:00.000Z",
    "ticketId": "cuid...",
    "ticketNumber": 5,
    "ticketPrefix": "TKT",
    "subject": "Cannot login after password reset",
    "user": {
      "id": "cuid...",
      "name": "Jane Doe",
      "avatar": null
    }
  }
]
```

### What is displayed per entry

| Element        | Value                                                      |
|----------------|------------------------------------------------------------|
| Icon           | Type-specific icon in a colored circle                      |
| Description    | `entry.description` (from `history_entries.description`)    |
| Time           | Relative time from `entry.timestamp` (e.g., "2h ago")      |
| Click action   | Navigates to `/tickets/{ticketNumber}`                      |

### Activity type icons and colors

| Type              | Icon              | Background                             | Icon Color        |
|-------------------|-------------------|----------------------------------------|-------------------|
| `created`         | `pi pi-plus`      | `bg-blue-100` / `dark:bg-blue-900/30` | `text-blue-600`   |
| `status_changed`  | `pi pi-sync`      | `bg-purple-100` / `dark:bg-purple-900/30` | `text-purple-600` |
| `priority_changed`| `pi pi-flag`      | `bg-orange-100` / `dark:bg-orange-900/30` | `text-orange-600` |
| `assigned`        | `pi pi-user`      | `bg-green-100` / `dark:bg-green-900/30` | `text-green-600`  |
| `reply`           | `pi pi-comment`   | `bg-cyan-100` / `dark:bg-cyan-900/30`  | `text-cyan-600`   |
| `note`            | `pi pi-file-edit` | `bg-amber-100` / `dark:bg-amber-900/30`| `text-amber-600`  |
| `updated`         | `pi pi-pencil`    | `bg-gray-100` / `dark:bg-gray-700`     | `text-gray-600`   |

### Backend query

```sql
SELECT h.*, t.ticket_number, t.subject, w.ticket_prefix,
       u.first_name, u.last_name, u.avatar
FROM history_entries h
JOIN tickets t ON h.ticket_id = t.id
LEFT JOIN workspaces w ON t.workspace_id = w.id
LEFT JOIN users u ON h.user_id = u.id
WHERE t.workspace_id = $1
ORDER BY h.timestamp DESC
LIMIT $2  -- default 15, frontend requests 10
```

### Section details

- **Header:** "Recent Activity" with "Last 24h" label
- **Container:** max height 320px (`max-h-80`), scrollable overflow
- **Dividers:** between each entry
- **Empty state:** `pi pi-history` icon + "No recent activity"
- **Loading state:** 4 skeleton rows (circle + text lines)

---

## 7. Top Performers

**Data Source:** Mock data (not yet API-backed)
**Location:** Right column, below Recent Activity
**Visibility:** Admin only (`@if (isAdmin())`)

### What is displayed

A ranked list of agents by number of resolved tickets.

| Element       | Value                                                |
|---------------|------------------------------------------------------|
| Avatar        | Agent's profile image                                |
| Rank badge    | 1st (gold), 2nd (silver), 3rd (bronze) — top 3 only |
| Name          | Agent's full name                                    |
| Progress bar  | Width proportional to resolved count vs top performer|
| Count         | Number of resolved tickets                           |

### Empty state
- Icon: `pi pi-users`
- Text: "No resolved tickets yet"

---

## Data Flow

### Loading Sequence

```
1. Component ngOnInit()
   └─ loadDashboardData()
       ├─ API: GET /dashboard/summary
       │   ├─ Success → populate KPI cards + SLA
       │   └─ Failure → fallback to mock data
       │
       └─ .finally() — runs after summary settles:
           ├─ Mock: statusCounts, ticketsOverTime, resolvedOverTime, topAgents
           ├─ API: GET /dashboard/activity?limit=10  (async, non-blocking)
           ├─ API: GET /dashboard/needs-attention     (async, non-blocking)
           ├─ Set isLoading = false
           └─ Build Chart.js chart (via setTimeout)
```

### Refresh flow

`refreshData()` → calls `loadDashboardData()` + shows toast "Dashboard data has been refreshed"

### Time formatting

The `formatTimeAgo()` function handles both `Date` objects and ISO strings:

| Time difference | Output              |
|-----------------|----------------------|
| < 1 minute      | "Just now"           |
| < 60 minutes    | "{X}m ago"           |
| < 24 hours      | "{X}h ago"           |
| < 7 days        | "{X}d ago"           |
| ≥ 7 days        | "Mar 7" (short date) |

---

## File Inventory

### Backend

| File | Purpose |
|------|---------|
| `backend/src/services/dashboard.service.js` | Business logic: `getSummary()`, `getRecentActivity()`, `getNeedsAttention()` |
| `backend/src/controllers/dashboard.controller.js` | HTTP handlers: extract `req.user`, call service, return `res.ok()` |
| `backend/src/routes/dashboard.routes.js` | Route registration: 3 GET routes behind `authenticate` middleware |

### Frontend

| File | Purpose |
|------|---------|
| `client/src/app/core/services/dashboard-api.service.ts` | API service: `getSummary()`, `getRecentActivity()`, `getNeedsAttention()` |
| `client/src/app/modules/dashboard/dashboard.component.ts` | Component logic: data loading, chart building, helper methods |
| `client/src/app/modules/dashboard/dashboard.component.html` | Template: all sections with role-aware conditional rendering |

### Shared types (defined in `dashboard-api.service.ts`)

| Interface               | Used by                         |
|-------------------------|----------------------------------|
| `DashboardSummary`      | KPI cards, priority alerts       |
| `ActivityEntry`         | Recent activity list             |
| `AttentionTicket`       | Needs attention / your priorities|
| `NeedsAttentionResponse`| API response wrapper             |

---

## Loading States

Every section has a skeleton loading state using PrimeNG's `p-skeleton`:

| Section            | Skeleton pattern                              |
|--------------------|-----------------------------------------------|
| KPI Cards          | 4 cards with icon + text placeholders         |
| Ticket Volume      | Full-width rectangle (220px)                  |
| Needs Attention    | 3 rows with rectangle + text                  |
| Recent Activity    | 4 rows with circle + text lines               |
| Top Performers     | 3 rows with circle + text                     |

---

## Still Using Mock Data

| Section            | Mock service method                         | Status        |
|--------------------|---------------------------------------------|---------------|
| Ticket Volume chart| `getTicketsCreatedOverTime(days)`           | Needs API     |
|                    | `getTicketsResolvedOverTime(days)`          | Needs API     |
| Status counts      | `getTicketCountsByStatus()`                 | Needs API     |
| Top Performers     | `getTopAgentsByResolvedTickets(5)`          | Needs API     |
