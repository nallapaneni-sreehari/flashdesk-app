email integration to load tickets from emails
API to create a ticket that client app can consume
Github/Jira integrations to forward issues further
notifications, emails services

## Workspace Setup (Backend)

- [ ] `POST /api/setup` — Create workspace + admin user in one transaction
  - Request: `{ workspaceName, slug, firstName, lastName, email, password }`
  - Creates `Workspace` record
  - Creates `User` with role `admin` linked to workspace
  - Returns JWT token + workspace + user data
- [ ] `GET /api/setup/check` — Check if any workspace exists (used by frontend to decide setup vs login)
  - Returns `{ setupComplete: true/false }`
- [ ] Hash password with bcrypt
- [ ] Generate JWT token on setup
- [ ] Validation: unique slug, unique email, required fields

## Dashboard APIs

- [ ] `GET /dashboard/summary` — KPI data + SLA compliance
  ```json
  {
    "success": true,
    "data": {
      "totalOpen": 24,
      "resolvedToday": 8,
      "unassigned": 5,
      "overdueTickets": 2,
      "avgResponseHours": 1.8,
      "totalTickets": 83,
      "sla": {
        "firstResponse": 87,
        "resolution": 72,
        "overall": 79
      }
    }
  }
  ```

- [ ] `GET /dashboard/ticket-volume?days=14` — Created + resolved time-series (days: 7, 14, 30, 90, 365)
  ```json
  {
    "success": true,
    "data": {
      "created": [{ "date": "Mar 1", "count": 5 }],
      "resolved": [{ "date": "Mar 1", "count": 3 }]
    }
  }
  ```

- [ ] `GET /dashboard/my-tickets?limit=5` — Tickets assigned to current user (non-closed/resolved)
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "ticketNumber": 1,
        "ticketPrefix": "TKT",
        "subject": "Unable to login",
        "status": "open",
        "priority": "urgent",
        "customer": { "id": "uuid", "name": "John" },
        "createdAt": "2026-03-10T..."
      }
    ]
  }
  ```

- [ ] `GET /dashboard/top-agents?limit=5` — Agents ranked by resolved count (admin only)
  ```json
  {
    "success": true,
    "data": [
      {
        "agent": { "id": "uuid", "name": "Alice", "avatar": "..." },
        "resolvedCount": 42
      }
    ]
  }
  ```

- [ ] `GET /dashboard/recent-activity?limit=10` — Latest ticket events
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "ticketId": "uuid",
        "type": "status_changed",
        "description": "Ticket #TKT-001 status changed to resolved",
        "user": { "name": "Alice", "avatar": "..." },
        "timestamp": "2026-03-12T...",
        "details": { "from": "open", "to": "resolved" }
      }
    ]
  }
  ```