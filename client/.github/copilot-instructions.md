# Flashdesk Frontend Development Guide

## Angular + PrimeNG + Tailwind

This document defines the frontend architecture, design principles, and coding guidelines for the Flashdesk SaaS UI.

---

## 1. Frontend Tech Stack

- **Framework:** Angular 18+
- **UI Library:** PrimeNG
- **Styling:** TailwindCSS
- **Language:** TypeScript
- **Reactive:** RxJS

### PrimeNG Components

Use PrimeNG components wherever possible:

```
p-table, p-button, p-dialog, p-sidebar, p-dropdown
p-inputText, p-inputTextarea, p-badge, p-tag, p-toast
```

PrimeNG provides core functionality while **Tailwind handles layout and styling**.

---

## 2. Design Philosophy

Follow **modern SaaS design principles**:

- Minimal and clean
- Responsive across all devices
- Fast performance
- Clear visual hierarchy
- Easy navigation
- Low visual clutter

**Design inspiration:** Linear, Notion, Vercel, Stripe dashboard

---

## 3. Layout Structure

Dashboard layout with sidebar navigation:

```
+-----------------------------------+
| Top Navigation Bar                |
+--------+--------------------------+
|Sidebar | Page Content             |
|Menu    |                          |
|        |                          |
+--------+--------------------------+
```

---

## 4. Angular Project Structure

Follow modular architecture:

```
src/app
├── core
│   ├── services
│   ├── guards
│   └── interceptors
├── layouts
│   ├── main-layout
│   └── auth-layout
├── modules
│   ├── dashboard
│   ├── tickets
│   ├── customers
│   ├── agents
│   ├── knowledge-base
│   ├── admin
│   └── settings
└── shared
    ├── components
    ├── directives
    └── pipes
```

Each module should contain: `components`, `pages`, `services`, `models`

---

## 5. Layout Components

### Sidebar

- Navigation menu
- Organization switcher
- Collapse support
- Components: `p-sidebar`, `p-panelMenu`

### Topbar

- Search, notifications, user menu, organization info
- Components: `p-avatar`, `p-menu`, `p-inputText`

### Main Content Area

All pages render here using Angular Router.

---

## 6. Ticket Module UI

### Ticket List Page

Components: `p-table`, `p-badge`, `p-tag`, `p-dropdown`, `p-inputText`, `p-button`

Features: searchable list, filtering, sorting, pagination

Columns: Ticket ID, Subject, Customer, Status, Priority, Assigned Agent, Created Date

### Ticket Detail Page

Layout: Ticket Header, Conversation Thread, Internal Notes, Ticket Info Panel

Components: `p-card`, `p-divider`, `p-inputTextarea`, `p-button`, `p-tag`, `p-avatar`

Conversation UI should resemble modern chat layout.

---

## 7. Customer Portal UI

Customers can: create ticket, view ticket history, reply to tickets

UI should be **simple and minimal**.

Components: `p-card`, `p-inputText`, `p-inputTextarea`, `p-button`

---

## 8. Admin Dashboard UI

Includes: Agents, Customers, Automation Rules, SLA Policies, Organization Settings

Components: `p-table`, `p-dialog`, `p-form`, `p-dropdown`, `p-switch`

---

## 9. Responsive Design Rules

Support: Desktop, Tablet, Mobile

Use Tailwind responsive breakpoints:

```html
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

Sidebar should collapse on mobile using `p-sidebar`.

---

## 10. Tailwind Styling Rules

Use Tailwind for layout and spacing:

```
flex, grid, gap-4, p-4, rounded-xl, shadow-sm, border
```

- Use Tailwind instead of custom CSS whenever possible
- Avoid inline styles

---

## 11. UI Design System

### Spacing Scale

```
gap-2, gap-4, gap-6, gap-8
```

### Card Styles

```
bg-white rounded-xl shadow-sm border p-4
```

---

## 12. Color System

| Purpose | Color |
|---------|-------|
| Primary | `#4F46E5` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |

Use PrimeNG tags for status:

```html
<p-tag severity="success">
<p-tag severity="warning">
<p-tag severity="danger">
```

### Semantic Color Tokens (Dark Mode Support)

Use CSS custom properties for colors that automatically adapt to dark mode.
**Do NOT use Tailwind `dark:` variants** - use semantic tokens instead.

#### Available Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-base` | gray-50 | gray-900 | Page background |
| `--bg-surface` | white | gray-800 | Cards, panels, modals |
| `--bg-elevated` | gray-100 | gray-700 | Elevated surfaces |
| `--bg-muted` | gray-50 | gray-800 | Subtle backgrounds |
| `--text-primary` | gray-900 | gray-100 | Main text |
| `--text-secondary` | gray-500 | gray-400 | Secondary text |
| `--text-muted` | gray-400 | gray-500 | Muted/placeholder text |
| `--border-default` | gray-200 | gray-700 | Primary borders |
| `--border-muted` | gray-100 | gray-700 | Subtle borders |
| `--hover-bg` | gray-100 | gray-700 | Hover states |
| `--kbd-bg` | gray-200 | gray-700 | Keyboard shortcut badges |

#### Usage Examples

```html
<!-- Background -->
<div class="bg-[var(--bg-surface)]">

<!-- Text -->
<span class="text-[var(--text-primary)]">

<!-- Border -->
<div class="border border-[var(--border-default)]">

<!-- Hover -->
<button class="hover:bg-[var(--hover-bg)]">
```

#### Brand Colors

Brand/theme colors are set by ThemeService and use `--color-primary`, `--color-secondary`, `--color-tertiary`.

```html
<span style="color: var(--color-primary)">
```

---

## 13. Ticket Status Indicators

| Status | Color |
|--------|-------|
| Open | blue |
| In Progress | yellow |
| Waiting | orange |
| Resolved | green |
| Closed | gray |

Example:

```html
<p-tag value="Open" severity="info"></p-tag>
```

---

## 14. Reusable Components

Create shared components in `shared/components`:

- `ticket-status-badge`
- `priority-badge`
- `agent-avatar`
- `ticket-card`
- `empty-state`
- `loading-spinner`

---

## 15. Loading States

Use skeleton loaders with `p-skeleton`:

- Ticket list loading
- Conversation loading
- Dashboard stats loading

---

## 16. Toast Notifications

Use PrimeNG `p-toast` service for:

- Ticket created/updated
- Agent assigned
- Error occurred

---

## 17. Form Guidelines

- Use **Reactive Forms**
- Validation: required fields, email validation, max length
- Components: `p-inputText`, `p-inputTextarea`, `p-dropdown`, `p-calendar`

---

## 18. Accessibility Rules

- Keyboard navigation
- Proper labels
- Accessible buttons

PrimeNG components support accessibility by default.

---

## 19. Performance Best Practices

- Use `OnPush` Change Detection
- Lazy load modules
- Use `trackBy` functions in tables
- Avoid large DOM rendering

---

## 20. Component Generation Guidelines

When generating components:

- Use PrimeNG components
- Apply Tailwind utility classes
- Avoid custom CSS when possible
- Maintain responsive layouts
- Follow modular architecture

---

## 21. Key UI Pages

```
Dashboard, Ticket List, Ticket Detail, Customer List
Agent Management, Automation Rules, Knowledge Base, Settings
```

---

## 22. UX Principles

- Speed and clarity
- Minimal clicks
- Clear ticket visibility
- Support agents should resolve tickets with **minimum friction**

---

## 23. Future UI Enhancements

- Dark mode
- AI reply suggestions
- Ticket insights dashboard
- Real-time ticket updates

---

## Final Instructions

All UI code must:

- Use PrimeNG components
- Follow Tailwind layout
- Maintain responsive design
- Follow Angular modular structure
- Keep UI minimal and modern
