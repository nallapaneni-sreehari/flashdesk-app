# Tickets Module — Comprehensive Documentation

> Last updated: 2025-06-15

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Enums](#enums)
4. [API Endpoints](#api-endpoints)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Ticket List Page](#ticket-list-page)
8. [Create Ticket Dialog](#create-ticket-dialog)
9. [Ticket Detail Page](#ticket-detail-page)
10. [Notification Triggers](#notification-triggers)
11. [History Tracking](#history-tracking)
12. [Email-to-Ticket](#email-to-ticket)
13. [Data Mapping](#data-mapping)
14. [File Inventory](#file-inventory)

---

## Overview

The Tickets module is the core of Flashdesk. It handles the entire lifecycle of support tickets: creation, listing with filters, detailed views, updates with history tracking, SLA monitoring, conversation threads, canned response insertion, and multi-ticket navigation.

**Key capabilities:**

- CRUD operations on tickets (create, read, update — no hard delete via API)
- Rich filtering: search, status, priority, type, channel, agent, customer
- Three view modes: List (table), Card (grid), Kanban (columns by status)
- Ticket detail with conversation, internal notes, SLA indicators
- Inline agent assignment on the list page (double-click)
- Bulk actions: export, resolve, delete (admin only)
- Quick filters (assigned to me, open & mine, last 24h, awaiting response, unassigned, high/urgent)
- Advanced filters sidebar (multi-select statuses/priorities, date ranges, customer name, unassigned toggle)
- Unsaved changes guard with confirmation dialog
- Keyboard shortcut integration (B T → browse tickets drawer)
- Canned response insertion via template picker panel or `/shortcut` autocomplete
- Automatic notifications on create, assign, status change, priority change

---

## Database Schema

### Ticket Model

```prisma
model Ticket {
  id               String         @id @default(cuid())
  ticketNumber     Int            @unique @default(autoincrement())
  subject          String
  description      String
  type             TicketType     @default(question)
  status           TicketStatus   @default(open)
  priority         TicketPriority @default(medium)
  channel          TicketChannel  @default(portal)
  eta              Int?           // estimated hours to resolution
  firstResponseDue DateTime?
  resolutionDue    DateTime?
  firstResponseAt  DateTime?
  resolvedAt       DateTime?
  closedAt         DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  customerId      String?
  customer        Customer?  @relation(...)

  assignedAgentId String?
  assignedAgent   User?      @relation("AssignedAgent", ...)

  workspaceId     String?
  workspace       Workspace? @relation(...)

  slaPolicyId     String?
  slaPolicy       SLAPolicy? @relation(...)

  followers       TicketFollower[]
  messages        Message[]
  history         HistoryEntry[]
  tags            TicketTag[]

  @@index([status])
  @@index([assignedAgentId])
  @@index([customerId])
  @@index([workspaceId])
  @@map("tickets")
}
```

**Key points:**

- `ticketNumber` is auto-incrementing and globally unique — used in URLs and display (e.g. `TKT-42`)
- `ticketPrefix` is NOT on the Ticket model; it comes from the related `Workspace.ticketPrefix` field
- All nullable foreign keys use `onDelete: SetNull` except `workspaceId` which is `Cascade`
- Four database indexes on `status`, `assignedAgentId`, `customerId`, `workspaceId`

### TicketFollower

```prisma
model TicketFollower {
  ticketId String
  userId   String
  @@id([ticketId, userId])
  @@map("ticket_followers")
}
```

Composite primary key — a user can only follow a ticket once.

### Tag & TicketTag

```prisma
model Tag {
  id          String @id @default(cuid())
  name        String
  workspaceId String
  @@unique([workspaceId, name])
  @@map("tags")
}

model TicketTag {
  ticketId String
  tagId    String
  @@id([ticketId, tagId])
  @@map("ticket_tags")
}
```

Tags are workspace-scoped (unique constraint on `[workspaceId, name]`). They are `connectOrCreate`'d during ticket creation and `upsert`'d during ticket update.

### Message

```prisma
model Message {
  id         String            @id @default(cuid())
  content    String
  isInternal Boolean           @default(false)
  authorType MessageAuthorType // customer | agent | system
  createdAt  DateTime          @default(now())
  ticketId   String
  userId     String?           // set when authorType = agent
  customerId String?           // set when authorType = customer
  @@index([ticketId])
  @@map("messages")
}
```

- `isInternal = true` → internal note visible only to agents
- `isInternal = false` → public reply visible to customer

### HistoryEntry

```prisma
model HistoryEntry {
  id          String           @id @default(cuid())
  type        HistoryEntryType
  description String
  fromValue   String?
  toValue     String?
  timestamp   DateTime         @default(now())
  ticketId    String
  userId      String?
  @@index([ticketId])
  @@map("history_entries")
}
```

---

## Enums

### TicketStatus

| Value                | Frontend Display | PrimeNG Severity |
|----------------------|------------------|------------------|
| `open`               | Open             | `info` (blue)    |
| `in_progress`        | In Progress      | `warn` (yellow)  |
| `waiting`            | Waiting          | `warn` (orange)  |
| `resolved`           | Resolved         | `success` (green)|
| `closed`             | Closed           | `secondary` (gray)|

**Frontend mapping:** Backend `in_progress` → Frontend `in-progress` (underscore → hyphen). The conversion happens in `mapTicketDto()` and `mapApiTicket()`. When sending back to the API, the frontend converts `in-progress` → `in_progress`.

### TicketPriority

| Value    | Icon                        | Color          | Sort Order |
|----------|-----------------------------|----------------|------------|
| `low`    | `pi pi-angle-down`          | `text-blue-500`| 4          |
| `medium` | `pi pi-minus`               | `text-yellow-500`| 3        |
| `high`   | `pi pi-angle-up`            | `text-orange-500`| 2        |
| `urgent` | `pi pi-angle-double-up`     | `text-red-600` | 1          |

### TicketType

| Value             | Icon                           | Color               |
|-------------------|--------------------------------|----------------------|
| `incident`        | `pi pi-exclamation-circle`     | `text-red-500`       |
| `issue`           | `pi pi-exclamation-triangle`   | `text-orange-500`    |
| `bug`             | `pi pi-bug`                    | `text-rose-500`      |
| `request`         | `pi pi-inbox`                  | `text-blue-500`      |
| `question`        | `pi pi-question-circle`        | `text-purple-500`    |
| `task`            | `pi pi-check-square`           | `text-green-500`     |
| `feature_request` | `pi pi-star`                   | `text-amber-500`     |

**Frontend mapping:** Backend `feature_request` → Frontend `feature-request`.

### TicketChannel

| Value    | Icon              | Label   |
|----------|-------------------|---------|
| `email`  | `pi pi-envelope`  | Email   |
| `chat`   | `pi pi-comments`  | Chat    |
| `phone`  | `pi pi-phone`     | Phone   |
| `portal` | `pi pi-globe`     | Portal  |

### HistoryEntryType

| Value              | Icon                    | Color class                    |
|--------------------|-------------------------|--------------------------------|
| `created`          | `pi pi-plus-circle`     | green-100/green-600            |
| `status_changed`   | `pi pi-sync`            | blue-100/blue-600              |
| `priority_changed` | `pi pi-flag`            | orange-100/orange-600          |
| `assigned`         | `pi pi-user-plus`       | purple-100/purple-600          |
| `reply`            | `pi pi-reply`           | indigo-100/indigo-600          |
| `note`             | `pi pi-file-edit`       | amber-100/amber-600            |
| `updated`          | `pi pi-pencil`          | gray-100/gray-600              |

---

## API Endpoints

All endpoints require authentication (`authenticate` middleware). The JWT provides `req.user = { userId, email, role, workspaceId, sessionId }`.

### POST /tickets — Create Ticket

**Request body:**

```json
{
  "subject": "Login button not working",        // required
  "description": "When I click login...",        // required
  "customerId": "clxyz...",                      // required
  "type": "bug",                                 // optional, default: question
  "priority": "high",                            // optional, default: medium
  "channel": "portal",                           // optional, default: portal
  "assignedAgentId": "clxyz...",                 // optional
  "followerIds": ["clxyz...", "clxyz..."],       // optional
  "tags": ["billing", "urgent"]                  // optional, connectOrCreate'd
}
```

**Validation:** `subject`, `description`, and `customerId` are required. Returns 400 if missing.

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clxyz...",
    "ticketNumber": 42,
    "subject": "Login button not working",
    "description": "When I click login...",
    "type": "bug",
    "status": "open",
    "priority": "high",
    "channel": "portal",
    "eta": null,
    "firstResponseDue": null,
    "resolutionDue": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "closedAt": null,
    "createdAt": "2025-06-15T...",
    "updatedAt": "2025-06-15T...",
    "customer": { "id": "...", "name": "John Doe", "email": "john@example.com", "avatar": null },
    "assignedAgent": { "id": "...", "firstName": "Amy", "lastName": "Elsner", "avatar": "..." },
    "followers": [{ "user": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." } }],
    "tags": [{ "tag": { "id": "...", "name": "billing" } }]
  },
  "message": "Ticket created successfully"
}
```

**Side effects:**

1. Creates a history entry: `{ type: "created", description: "Ticket created" }`
2. Fires `notifyNewTicket()` asynchronously
3. If `assignedAgentId` is set, fires `notifyTicketAssigned()` asynchronously

**Tag handling:** For each tag name, uses `connectOrCreate` with compound key `{ workspaceId, name }` — creates the tag if it doesn't exist in the workspace, otherwise attaches the existing one.

---

### GET /tickets — List Tickets

**Query parameters:**

| Param            | Type    | Default      | Description                                   |
|------------------|---------|--------------|-----------------------------------------------|
| `search`         | string  | —            | Searches subject, customer name, email, ticketNumber |
| `status`         | string  | —            | Filter by exact status enum value             |
| `priority`       | string  | —            | Filter by exact priority enum value           |
| `type`           | string  | —            | Filter by exact type enum value               |
| `channel`        | string  | —            | Filter by exact channel enum value            |
| `assignedAgentId`| string  | —            | Filter by assigned agent ID                   |
| `customerId`     | string  | —            | Filter by customer ID                         |
| `page`           | number  | 1            | Page number (1-based)                         |
| `pageSize`       | number  | 20           | Items per page                                |
| `sortBy`         | string  | `createdAt`  | Column to sort by                             |
| `sortOrder`      | string  | `desc`       | `asc` or `desc`                               |

**Search logic:** The `search` param creates an `OR` condition:
- `subject CONTAINS search` (case-insensitive)
- `customer.name CONTAINS search` (case-insensitive)
- `customer.email CONTAINS search` (case-insensitive)
- If `search` parses as a number: `ticketNumber = parsedNumber`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz...",
      "ticketNumber": 42,
      "ticketPrefix": "TKT",
      "subject": "...",
      "description": "...",
      "type": "bug",
      "status": "open",
      "priority": "high",
      "channel": "portal",
      "eta": null,
      "firstResponseDue": null,
      "resolutionDue": null,
      "firstResponseAt": null,
      "resolvedAt": null,
      "closedAt": null,
      "createdAt": "...",
      "updatedAt": "...",
      "customerId": "...",
      "customer": { "id": "...", "name": "...", "email": "...", "avatar": null },
      "assignedAgentId": "...",
      "assignedAgent": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
      "tags": ["billing", "urgent"],
      "messageCount": 5
    }
  ],
  "message": "Tickets retrieved successfully",
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

**Enrichment:** The service transforms the raw Prisma result:
- `ticketPrefix`: Extracted from `workspace.ticketPrefix` (the prefix is on the Workspace, not the Ticket)
- `tags`: Flattened from `[{ tag: { name: "billing" } }]` → `["billing"]`
- `messageCount`: From Prisma `_count.messages`

**Includes per ticket:**
- `customer` → `{ id, name, email, avatar }`
- `assignedAgent` → `{ id, firstName, lastName, avatar }`
- `workspace` → `{ ticketPrefix }`
- `tags` → `[{ tag: { id, name } }]`
- `_count` → `{ messages: number }`

---

### GET /tickets/:ticketNumber — Get Ticket Detail

**Params:** `ticketNumber` — must be a valid integer (validated in controller)

**Response (200):** Returns the full ticket with all relations:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "ticketNumber": 42,
    "subject": "...",
    "description": "...",
    "type": "bug",
    "status": "open",
    "priority": "high",
    "channel": "portal",
    "eta": null,
    "firstResponseDue": "...",
    "resolutionDue": "...",
    "firstResponseAt": null,
    "resolvedAt": null,
    "closedAt": null,
    "createdAt": "...",
    "updatedAt": "...",
    "customer": { "id": "...", "name": "...", "email": "...", "avatar": null },
    "assignedAgent": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
    "workspace": { "ticketPrefix": "TKT" },
    "followers": [
      { "user": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." } }
    ],
    "tags": [{ "tag": { "id": "...", "name": "billing" } }],
    "messages": [
      {
        "id": "...",
        "content": "Hello, I need help...",
        "isInternal": false,
        "authorType": "customer",
        "createdAt": "...",
        "user": null,
        "customer": { "id": "...", "name": "...", "avatar": null }
      }
    ],
    "history": [
      {
        "id": "...",
        "type": "created",
        "description": "Ticket created",
        "fromValue": null,
        "toValue": null,
        "timestamp": "...",
        "user": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." }
      }
    ]
  }
}
```

**Includes:**
- `customer` → `{ id, name, email, avatar }`
- `assignedAgent` → `{ id, firstName, lastName, avatar }`
- `workspace` → `{ ticketPrefix }`
- `followers` → with `user` → `{ id, firstName, lastName, avatar }`
- `tags` → with `tag` → `{ id, name }`
- `messages` → ordered by `createdAt ASC`, includes `user` and `customer`
- `history` → ordered by `timestamp DESC`, includes `user`

---

### PATCH /tickets/:ticketNumber — Update Ticket

**Params:** `ticketNumber` — must be a valid integer

**Request body (all fields optional):**

```json
{
  "status": "in_progress",
  "priority": "urgent",
  "type": "incident",
  "assignedAgentId": "clxyz...",
  "description": "Updated description...",
  "subject": "Updated subject",
  "eta": 24,
  "followerIds": ["clxyz...", "clxyz..."],
  "tags": ["billing", "escalated"]
}
```

**Validation flow:**

1. Parse and validate `ticketNumber` (400 if NaN)
2. Look up ticket by number, verify `workspaceId` matches (404 if not found or wrong workspace)
3. Compare each field against existing values — only changed fields are processed
4. Execute all DB operations within a `$transaction` for atomicity

**Field-by-field update logic:**

| Field            | History Type      | Extra Logic                                           |
|------------------|-------------------|-------------------------------------------------------|
| `status`         | `status_changed`  | If → `resolved`: sets `resolvedAt = now()` (once). If → `closed`: sets `closedAt = now()` (once) |
| `priority`       | `priority_changed`| Records `fromValue` and `toValue`                     |
| `type`           | `updated`         | Records `fromValue` and `toValue`                     |
| `assignedAgentId`| `assigned`        | Looks up new agent name for history description       |
| `description`    | `updated`         | Description = "Description updated" (no from/to)      |
| `subject`        | `updated`         | Records `fromValue` and `toValue`                     |
| `eta`            | —                 | No history entry created                              |
| `followerIds`    | `updated`         | Full sync: delete all → recreate. Inside transaction  |
| `tags`           | —                 | Full sync: delete all → upsert + create. Inside transaction |

**Transaction contents:**
1. Delete + recreate followers (if changed)
2. Delete + upsert + create tags (if changed)
3. Create all history entries via `createMany`
4. Update the ticket with changed `data` fields
5. Return the full ticket with all includes (same as detail endpoint)

**Post-transaction notifications (async, fire-and-forget):**
- Assignment change → `notifyTicketAssigned()`
- Status change → `notifyTicketStatusChanged()`
- Priority change → `notifyTicketPriorityChanged()`

**Response (200):** Same shape as GET detail — full ticket with messages, history, followers, tags.

---

## Backend Architecture

### Route → Controller → Service flow

```
ticket.routes.js
  └─ authenticate middleware
  └─ TicketController methods
       └─ TicketService methods
            └─ Prisma ORM queries
            └─ NotificationService (async)
```

### TicketService class

**File:** `backend/src/services/ticket.service.js`

**Constant:**

```javascript
const USER_SUMMARY = { id: true, firstName: true, lastName: true, avatar: true };
```

This select object is reused across all queries to consistently return minimal user data.

**Methods:**

| Method                    | Description                                               |
|---------------------------|-----------------------------------------------------------|
| `createTicket(data)`      | Creates ticket with followers, tags, history. Fires notifications |
| `getTickets(params)`      | Paginated list with filters. Returns `{ tickets, pagination }` |
| `getTicketByNumber(num)`  | Single ticket with all relations (messages, history, etc.) |
| `updateTicket(params)`    | Transactional update with diff-based history tracking     |
| `_sendUpdateNotifications(existing, updates, result, userId)` | Private helper for post-update notifications |
| `createTicketFromEmail(params)` | Creates ticket from incoming email with customer upsert |

### TicketController class

**File:** `backend/src/controllers/ticket.controller.js`

All methods follow the pattern:
1. Extract/validate input
2. Call service method
3. Return `res.ok(statusCode, data, message, pagination?)`
4. Catch → `res.handleError(error, logContext)`

---

## Frontend Architecture

### Services

#### TicketApiService

**File:** `client/src/app/core/services/ticket-api.service.ts`

**Interfaces:**

```typescript
interface TicketDto {
  id: string;
  ticketNumber: number;
  ticketPrefix: string | null;
  subject: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  channel: string;
  eta: number | null;
  firstResponseDue: string | null;
  resolutionDue: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customerId: string | null;
  customer: { id: string; name: string; email: string; avatar: string | null } | null;
  assignedAgentId: string | null;
  assignedAgent: { id: string; firstName: string; lastName: string; avatar: string | null } | null;
  tags: string[];
  messageCount: number;
}

interface PaginatedTicketResponse extends ApiResponse<TicketDto[]> {
  pagination?: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

interface CreateTicketPayload {
  subject: string;
  description: string;
  customerId: string;
  type: string;
  priority: string;
  channel: string;
  assignedAgentId?: string;
  followerIds?: string[];
  tags?: string[];
}

interface UpdateTicketPayload {
  status?: string;
  priority?: string;
  type?: string;
  assignedAgentId?: string | null;
  description?: string;
  subject?: string;
  eta?: number | null;
  followerIds?: string[];
  tags?: string[];
}
```

**Methods:**

| Method | HTTP | Path | Returns |
|--------|------|------|---------|
| `getTickets(params?)` | GET | `/tickets?...` | `Observable<PaginatedTicketResponse>` |
| `createTicket(payload)` | POST | `/tickets` | `Observable<any>` (unwrapped `res.data`) |
| `getTicketByNumber(num)` | GET | `/tickets/:num` | `Observable<any>` (unwrapped `res.data`) |
| `updateTicket(num, payload)` | PATCH | `/tickets/:num` | `Observable<any>` (unwrapped `res.data`) |

### Routing

```typescript
{ path: 'tickets',        component: TicketsComponent }          // list
{ path: 'tickets/:ticketNumber', component: TicketDetailComponent,
  canDeactivate: [unsavedChangesGuard] }                          // detail
```

Both routes are lazy-loaded via `loadComponent`. The detail route has an `unsavedChangesGuard` that warns the user before navigating away with pending changes.

---

## Ticket List Page

**Component:** `TicketsComponent`  
**Files:** `tickets.component.ts`, `tickets.component.html`

### Header

- Title: "Tickets" with subtitle "Manage and respond to customer support tickets"
- View toggle buttons: List | Card | Kanban (hidden on mobile)
- "New Ticket" button → opens create dialog

### Data Loading

On init:
1. `loadTickets()` → calls `ticketApi.getTickets({ pageSize: 100 })`, maps `TicketDto[]` → `Ticket[]` via `mapTicketDto()`
2. `loadAgents()` → calls `agentApi.getAgents({ pageSize: 100 })` for the agent assignment dropdown
3. Checks `queryParams.action === 'new'` → auto-opens create dialog (then clears the param)

On error, falls back to mock data from `MockDataService`.

### Filter Bar

Located inside a rounded card at the top.

**Search:** `<p-iconfield>` with search icon. Searches client-side against `subject`, `ticketNumber`, and `customer.name`.

**Status dropdown:** `<p-select>` with options: All Status, Open, In Progress, Waiting, Resolved, Closed.

**Priority dropdown:** `<p-select>` with icon+color per option (see priority table above).

**Advanced Filters button:** Opens the filter sidebar. Shows a badge with `activeFilterCount` when filters are active.

**Clear button:** Appears when any filter is active. Clears search, status, priority, advanced filters, and quick filters.

### Quick Filters

Row of pill buttons below the filter bar, separated by a border-top:

| ID                   | Label                    | Icon                            | Logic                                           |
|----------------------|--------------------------|---------------------------------|-------------------------------------------------|
| `assigned-to-me`     | Assigned to me           | `pi pi-user`                    | `assignedAgent.name === currentUser.name`        |
| `open-assigned-to-me`| Open & Assigned to me    | `pi pi-inbox`                   | status=open AND agent matches current user       |
| `last-24h`           | Last 24 hours            | `pi pi-clock`                   | `createdAt >= 24h ago`                           |
| `awaiting-response`  | Awaiting first response  | `pi pi-comments`                | (open OR waiting) AND `createdAt === updatedAt`  |
| `unassigned`         | Unassigned               | `pi pi-user-minus`              | `!assignedAgent`                                 |
| `high-priority`      | High & Urgent            | `pi pi-exclamation-triangle`    | priority = high OR urgent                        |

Toggle behavior: clicking an active quick filter deactivates it.

### Advanced Filters Sidebar

Opened via "Advanced Filters" button. Rendered as a `<p-drawer>` (400px, right side).

**Filter fields:**

| Field            | Component       | Description                            |
|------------------|-----------------|----------------------------------------|
| Status           | `p-multiselect` | Multi-select with chip display         |
| Priority         | `p-multiselect` | Multi-select with chip display         |
| Assigned Agent   | `p-multiselect` | Multi-select agents + "Show Unassigned" checkbox |
| Created Date     | `p-datepicker`  | Date range picker                      |
| Updated Date     | `p-datepicker`  | Date range picker                      |
| Customer         | `p-inputText`   | Free text search on name/email         |

Footer: "Clear All" (secondary) + "Apply Filters" (primary) buttons.

### Filtering Logic

All filtering is **client-side** via the `filteredTickets` computed getter. The getter chains:

1. Quick filter match (if active)
2. Search query match (subject, ticketNumber, customer name — case insensitive)
3. Status dropdown match
4. Priority dropdown match
5. Advanced filter matches: statuses, priorities, agents, unassigned, created date range, updated date range, customer name

### Bulk Actions

When `selectedTickets.length > 0`, a bar appears with:

- **Export** → shows toast (placeholder for CSV/Excel export)
- **Resolve** → sets all selected tickets to `status: 'resolved'` (client-side only currently)
- **Delete** → removes selected tickets from the local list (admin only, client-side only)

### View Modes

#### List View (default)

`<p-table>` with columns:

| Column      | Sortable | Notes                                     |
|-------------|----------|-------------------------------------------|
| Checkbox    | No       | Multi-select via `p-tableHeaderCheckbox`   |
| Ticket ID   | Yes      | Displays `{prefix}-{number}`, clickable   |
| Subject     | Yes      | Truncated, clickable                       |
| Customer    | No       | Avatar + name + email                     |
| Status      | Yes      | `<p-tag>` with severity color             |
| Priority    | Yes      | Icon + label with color                    |
| Assigned To | No       | Avatar + name; double-click to reassign    |
| Created     | Yes      | Relative date with tooltip for full date   |
| Actions     | No       | View, Edit, Delete (admin) icon buttons    |

**Sorting:** Uses custom sort function for `status` (workflow order 1-5) and `priority` (urgency order 1-4). Other fields use standard comparison.

**Pagination:** Client-side. Rows per page: 5, 10, 25, 50. Shows "Showing {first} to {last} of {totalRecords} tickets".

**Empty state:** "No tickets found" with clear filters button.

#### Card View

Responsive grid: 1 col → 2 cols (sm) → 3 cols (lg) → 4 cols (xl).

Each card shows:
- Header: Ticket ID + Status tag
- Subject (2-line clamp)
- Customer avatar + name
- Footer: Priority icon + Assigned agent avatar
- Created date

#### Kanban View

Horizontal scrolling columns, one per status in workflow order:

| Column       | Status Value  |
|--------------|---------------|
| Open         | `open`        |
| In Progress  | `in_progress` |
| Waiting      | `waiting`     |
| Resolved     | `resolved`    |
| Closed       | `closed`      |

Each column: header with count badge, scrollable ticket cards (max-height: `calc(100vh-300px)`).

### Inline Agent Assignment

On the list view, the "Assigned To" column supports:
- **Double-click** → enters edit mode
- Shows `<p-select>` with agent list (filterable), confirm (✓) and cancel (✗) buttons
- Currently updates client-side only (no API call)

---

## Create Ticket Dialog

**Component:** `CreateTicketDialogComponent`  
**Files:** `create-ticket-dialog.component.ts`, `create-ticket-dialog.component.html`

**Trigger:** "New Ticket" button on list page, OR `?action=new` query param.

### Form Fields

| Field          | Component         | Required | Default    | Notes                          |
|----------------|-------------------|----------|------------|--------------------------------|
| Subject        | `p-inputText`     | Yes      | —          | Plain text input               |
| Description    | `p-editor`        | Yes      | —          | Rich text editor (150px height)|
| Customer       | `p-select`        | Yes      | —          | Filterable by name/email, with avatar |
| Source         | `p-select`        | No       | `portal`   | Portal, Email, Chat, Phone     |
| Type           | `p-select`        | No       | `request`  | 7 type options with icons      |
| Priority       | `p-select`        | No       | `medium`   | 4 priority options with icons  |
| Assigned Agent | `p-select`        | No       | —          | Filterable by name/email, with avatar |
| Followers      | `p-multiselect`   | No       | —          | Multi-select agents, max 2 labels shown |

### Data Loading

When dialog becomes visible (`ngOnChanges` on `visible`):
1. `loadData()` → fetches customers and agents from their respective APIs (pageSize: 100)
2. `resetForm()` → clears all fields to defaults

### Validation

`isValid` computed: `subject.trim() && description.trim() && selectedCustomer` must all be truthy.

On submit with invalid form: shows toast error "Please fill in all required fields". Validation messages appear below each required field after first submit attempt (`submitted` flag).

### Submit Flow

1. Shows loader with text "Creating ticket..."
2. Calls `ticketApi.createTicket({ ... })`
3. On success: hides loader, shows success toast, emits `ticketCreated` event, closes dialog
4. On error: hides loader (error interceptor handles toast)

The parent `TicketsComponent.onTicketCreated(ticket)`:
1. Reloads the ticket list
2. Navigates to `/tickets/{ticketNumber}`

---

## Ticket Detail Page

**Component:** `TicketDetailComponent`  
**Files:** `ticket-detail.component.ts`, `ticket-detail.component.html`

**Route:** `/tickets/:ticketNumber`  
**Guards:** `canDeactivate: [unsavedChangesGuard]`

### Initialization

On init:
1. Builds more-menu items (role-aware — admin sees Moderation and Danger Zone)
2. Subscribes to keyboard shortcut context actions (`browse-tickets` → toggle drawer)
3. Loads agents from API (for assignment dropdown)
4. Loads all tickets (for prev/next navigation)
5. Loads canned responses from mock data
6. Subscribes to route params → loads ticket detail on `ticketNumber` change

### Data Loading

`loadTicketDetail(ticketNumber)`:
1. Calls `ticketApi.getTicketByNumber(num)`
2. Maps response → sets `ticket`, `messages`, `history` signals
3. Stores original values for change detection: `originalStatus`, `originalPriority`, `originalType`, `originalAgentId`, `originalFollowerIds`, `originalDescription`

### Layout Sections

The page is divided into:

1. **Header bar** — Back button, ticket ID, navigation (prev/next/browse drawer), more menu
2. **Workflow stepper** — Visual status progression (Open → In Progress → Waiting → Resolved → Closed)
3. **Main content area** — Two-column layout:
   - **Left column:** Conversation thread
   - **Right column:** Ticket properties sidebar

### Conversation Thread

Tabbed view: **Public Replies** | **Internal Notes**

- `publicMessages` → computed: `messages().filter(m => !m.isInternal)`
- `internalNotes` → computed: `messages().filter(m => m.isInternal)`

Each message shows:
- Author avatar + name + type (agent/customer/system)
- Timestamp (formatted with `formatDate`)
- HTML content (sanitized via `DomSanitizer.bypassSecurityTrustHtml`)

### Reply Composer

At the bottom of the conversation:

- Toggle: "Reply" / "Internal Note" (sets `isInternalNote` flag)
- `<textarea>` for reply content
- Template picker button → opens panel with searchable/filterable canned responses
- Shortcut autocomplete: typing `/` triggers suggestions (matched against canned response shortcuts, max 6)
- "Clear" button with confirmation
- "Send" button → currently simulates API call (setTimeout)

### Canned Response / Template System

**Template Picker Panel:** Modal panel with:
- Search by title/shortcut
- Category filter (from mock data categories)
- Click to insert template

**Shortcut Autocomplete:** When typing in the reply textarea:
- Detects words starting with `/`
- Shows dropdown of matching canned responses
- Arrow keys to navigate, Enter/Tab to select, Escape to dismiss

**Placeholder replacement:** Both insertion methods replace these placeholders:
- `{{customer_name}}` → ticket customer name
- `{{agent_name}}` → assigned agent name or "Agent"
- `{{ticket_id}}` → `#ticketId`
- `{{company_name}}` → "your company"

### Ticket Properties Panel (Right Sidebar)

**Editable fields:**

| Field          | Component         | Tracks Changes | History |
|----------------|-------------------|----------------|---------|
| Status         | Workflow stepper  | `pendingStatus` signal | Yes |
| Priority       | Dropdown          | `pendingPriority` signal | Yes |
| Type           | Dropdown          | `pendingType` signal | Yes |
| Assigned Agent | Dropdown          | `pendingAgent` signal | Yes |
| Followers      | Multi-select      | `pendingFollowers` signal | Yes |
| Description    | Rich text editor  | `pendingDescription` signal | Yes |

**ETA display:** Shows `{eta} hours` or `{Math.ceil(eta/24)} days` if > 24 hours.

**Channel display:** Icon + label (read-only).

### SLA Indicators

Two SLA computed properties:

**First Response SLA:**
- If `firstResponseAt` exists: shows Met/Breached with time taken
- If not yet responded:
  - Overdue (timeLeft < 0): shows "Overdue {duration}" with breached status
  - Warning (< 30 min left): shows remaining time with warning status
  - Pending: shows remaining time with pending status

**Resolution SLA:**
- If `resolvedAt` exists: shows Met/Breached with time taken
- If not yet resolved:
  - Overdue: shows "Overdue {duration}" with breached status
  - Warning (< 1 hour left): shows remaining with warning status
  - Pending: shows remaining with pending status

### Unsaved Changes System

**Detection:** `hasUnsavedChanges()` compares all pending signals against original values:
- `pendingStatus` vs `originalStatus`
- `pendingPriority` vs `originalPriority`
- `pendingType` vs `originalType`
- `pendingAgent` id vs `originalAgentId`
- `pendingFollowers` sorted IDs vs `originalFollowerIds`
- `pendingDescription` vs `originalDescription`

**Protection:**
1. `@HostListener('window:beforeunload')` — browser-level warning
2. `unsavedChangesGuard` — Angular route-level guard
3. `ConfirmDialogService` — in-app confirmation dialog

### Save Changes Flow

`saveAllChanges()`:

1. Collects all pending changes into `ChangeItem[]`
2. Shows confirmation dialog listing all changes (field, from, to)
3. If confirmed:
   - Builds `UpdateTicketPayload` from pending values
   - Converts frontend enums back to backend format (`in-progress` → `in_progress`)
   - Calls `ticketApi.updateTicket(ticketNumber, payload)`
   - On success: refreshes ticket from server response, resets all pending/original values
4. If rejected: resets all pending signals, shows "Changes Discarded" toast

### Ticket Navigation

**Prev/Next:** Arrow buttons navigate through `allTickets()` array by index.

**Ticket Drawer:** Side drawer listing all tickets with:
- Search by ID, subject, customer name
- Click to navigate to ticket
- Shows current position: "X of Y"

**Keyboard shortcut:** `B T` → toggles ticket drawer (via `shortcutService.contextAction$`)

### More Actions Menu

`<p-menu>` with role-aware items:

**Actions (all users):**
- Refresh — reloads ticket from API
- Duplicate — placeholder
- Print — `window.print()`
- Export as PDF — placeholder with simulated delay

**Moderation (admin only):**
- Mark as Spam — confirmation dialog, sets status to closed
- Merge with Another Ticket — placeholder
- Split Conversation — placeholder

**Danger Zone (admin only):**
- Delete Ticket — confirmation dialog, navigates to /tickets after deletion

### Helper Methods

| Method | Purpose |
|--------|---------|
| `getStatusColor(status)` | Returns Tailwind color classes for status badges |
| `getStatusSeverity(status)` | Returns PrimeNG severity for `<p-tag>` |
| `getPrioritySeverity(priority)` | Returns PrimeNG severity for `<p-tag>` |
| `formatStatus(status)` | `in-progress` → `In Progress` |
| `formatDate(date)` | Full date with time: "Jun 15, 2025, 02:30 PM" |
| `formatRelativeDate(date)` | `5m ago`, `3h ago`, `2d ago`, or date |
| `formatTimeRemaining(ms)` | `2d left`, `3h 15m left`, `45m left` |
| `formatDuration(ms)` | `2d 3h`, `5h 30m`, `45m` |

---

## Notification Triggers

The ticket service fires notifications asynchronously (fire-and-forget with error logging) at these points:

### On Create

| Condition | Notification | Recipients |
|-----------|-------------|------------|
| Always | `notifyNewTicket()` | All workspace agents |
| `assignedAgentId` set | `notifyTicketAssigned()` | Assigned agent |

### On Update

| Condition | Notification | Recipients |
|-----------|-------------|------------|
| `assignedAgentId` changed | `notifyTicketAssigned()` | New assigned agent |
| `status` changed | `notifyTicketStatusChanged()` | Assigned agent + all followers |
| `priority` changed | `notifyTicketPriorityChanged()` | Assigned agent + all followers |

All notification calls pass `ticketNumber`, `ticketPrefix`, `subject`, and relevant user IDs. Errors are caught and logged via pino (`logger.error`).

---

## History Tracking

Every significant change to a ticket creates one or more `HistoryEntry` records. These are created within the same database transaction as the ticket update.

### History Entry Types

| Change | `type` | `description` | `fromValue` | `toValue` |
|--------|--------|---------------|-------------|-----------|
| Ticket created | `created` | "Ticket created" | — | — |
| Status changed | `status_changed` | "Status changed from {old} to {new}" | old status | new status |
| Priority changed | `priority_changed` | "Priority changed from {old} to {new}" | old priority | new priority |
| Type changed | `updated` | "Type changed from {old} to {new}" | old type | new type |
| Agent assigned | `assigned` | "Assigned to {agentName}" | old agent name or "Unassigned" | new agent name or "Unassigned" |
| Description updated | `updated` | "Description updated" | — | — |
| Subject changed | `updated` | "Subject changed" | old subject | new subject |
| Followers updated | `updated` | "Followers updated" | — | — |

**Note:** ETA and tags changes do NOT create history entries.

### Timestamp Auto-Updates

| Status Change Target | Auto-set Field |
|---------------------|----------------|
| → `resolved` | `resolvedAt = now()` (only if not already set) |
| → `closed` | `closedAt = now()` (only if not already set) |

---

## Email-to-Ticket

**Method:** `TicketService.createTicketFromEmail({ workspaceId, email, name, subject, description, tags })`

**Flow:**

1. If `workspaceId` is provided:
   - Upserts customer by `{ workspaceId, email }` compound unique key
   - Creates customer if not found, updates nothing if found
2. If no `workspaceId`:
   - Finds first customer with matching email
   - Creates a new customer (without workspace) if none found
3. Calls `createTicket()` with `channel: "email"` and the resolved customer ID

This method is designed to be called by an email ingestion worker/job.

---

## Data Mapping

### Backend → Frontend (TicketDto mapping)

The frontend components (`TicketsComponent` and `TicketDetailComponent`) both have mapping functions that transform API data:

**Status:** `in_progress` → `in-progress` (underscore → hyphen via `status.replace('_', '-')`)

**Type:** `feature_request` → `feature-request` (same logic, with special handling: `t.type === 'feature_request' ? 'feature-request' : t.type`)

**AssignedAgent:** `{ firstName, lastName, avatar }` → `{ name: firstName + ' ' + lastName, avatar }`

**Tags (list endpoint):** Already flattened to `string[]` by backend service

**Tags (detail endpoint):** `[{ tag: { name: "billing" } }]` → `string[]` (mapped in frontend)

**Followers (detail only):** `[{ user: { id, firstName, lastName, avatar } }]` → `Agent[]` with computed `name`

**Messages (detail only):** Mapped to `Message[]` with author resolution:
- `authorType: 'agent'` + `user` → agent name/avatar
- `authorType: 'customer'` + `customer` → customer name/avatar
- Otherwise → "System"

**History (detail only):** Mapped to `HistoryEntry[]` with user name resolution and optional `details: { from, to }` from `fromValue`/`toValue`.

### Frontend → Backend (payload conversion)

When saving changes:
- `in-progress` → `in_progress` (hyphen → underscore via `status.replace('-', '_')`)
- `feature-request` → `feature_request` (same logic)

---

## File Inventory

### Backend

| File | Purpose |
|------|---------|
| `src/routes/ticket.routes.js` | Route definitions (4 routes, all behind `authenticate`) |
| `src/controllers/ticket.controller.js` | HTTP handlers: input validation, service delegation, responses |
| `src/services/ticket.service.js` | Business logic: CRUD, filtering, pagination, history, notifications |
| `prisma/schema.prisma` | Ticket, TicketFollower, Tag, TicketTag, Message, HistoryEntry models + all enums |

### Frontend

| File | Purpose |
|------|---------|
| `src/app/core/services/ticket-api.service.ts` | HTTP client: interfaces (TicketDto, payloads), 4 API methods |
| `src/app/modules/tickets/tickets.component.ts` | Ticket list page: filters, views (list/card/kanban), bulk actions, agent assignment |
| `src/app/modules/tickets/tickets.component.html` | Ticket list template: table, cards, kanban columns, filter sidebar |
| `src/app/modules/tickets/create-ticket-dialog/create-ticket-dialog.component.ts` | Create ticket form: validation, data loading, submit to API |
| `src/app/modules/tickets/create-ticket-dialog/create-ticket-dialog.component.html` | Create ticket template: form fields, validation messages |
| `src/app/modules/tickets/ticket-detail/ticket-detail.component.ts` | Ticket detail: conversation, properties, SLA, history, save changes, navigation |
| `src/app/modules/tickets/ticket-detail/ticket-detail.component.html` | Ticket detail template: conversation thread, sidebar, workflow stepper |
| `src/app/app.routes.ts` | Route config with lazy loading and unsaved changes guard |

### Shared/Supporting

| File | Purpose |
|------|---------|
| `src/app/core/services/mock-data.service.ts` | Fallback data + Ticket/Agent/Message/HistoryEntry type definitions |
| `src/app/core/services/confirm-dialog.service.ts` | Confirmation dialog with change list rendering |
| `src/app/core/services/keyboard-shortcut.service.ts` | Keyboard shortcut system (B T for ticket drawer) |
| `src/app/core/guards/unsaved-changes.guard.ts` | Route guard checking `HasUnsavedChanges` interface |
| `backend/src/services/notification.service.js` | Notification creation for ticket events |
| `backend/src/middlewares/api-response.js` | `res.ok()`, `res.fail()`, `res.handleError()` helpers |
