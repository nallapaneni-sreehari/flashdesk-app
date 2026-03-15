# Flashdesk Backend - Copilot Instructions

## Project Overview

Flashdesk is a B2B customer support platform built with the PEAN stack (PostgreSQL, Express.js, Angular, Node.js). This backend serves as the API layer for ticket management, customer communication, and support workflow automation.

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Queue**: Redis + Bull Queue
- **File Storage**: S3 / MinIO / Cloudflare R2

---
## Coding Conventions

### General

- Use **ES6+ syntax** (async/await, destructuring, arrow functions)
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **SCREAMING_SNAKE_CASE** for constants
- Always use strict equality (`===` and `!==`)
- Prefer `const` over `let`; avoid `var`

### File Naming

- Use **kebab-case** for file names: `ticket-controller.js`, `email-service.js`
- Suffix files by their type: `*.controller.js`, `*.service.js`, `*.model.js`, `*.routes.js`

### Functions

- Keep functions small and focused (single responsibility)
- Use descriptive names that indicate purpose
- Document complex functions with JSDoc comments

---

## Architecture Patterns

### Layered Architecture

Follow a strict separation of concerns:

1. **Routes** → Define endpoints, attach middleware
2. **Controllers** → Handle HTTP request/response, validate input
3. **Services** → Implement business logic, orchestrate operations
4. **Models** → Database access and queries

```javascript
// Route → Controller → Service → Model
router.post('/tickets', ticketController.create);
// Controller calls ticketService.createTicket()
// Service calls ticketModel.insert()
```

### Dependency Injection

- Pass dependencies as function parameters or constructor arguments
- Avoid global state and singletons where possible
- Makes testing and mocking easier

---

## Database Conventions

### PostgreSQL

- Use **snake_case** for table and column names
- Always include `created_at` and `updated_at` timestamps
- Use UUIDs for primary keys
- Use foreign key constraints for referential integrity
- Add indexes for frequently queried columns

### Core Tables

```
organizations
users
customers
tickets
ticket_messages
ticket_events
attachments
tags
ticket_assignments
automation_rules
sla_policies
knowledge_base_articles
knowledge_base_categories
integrations
audit_logs
workflow_states
```

### Query Patterns

- Use parameterized queries to prevent SQL injection
- Use transactions for multi-table operations
- Prefer explicit column selection over `SELECT *`

```javascript
// Good
const result = await db.query(
  'SELECT id, subject, status FROM tickets WHERE organization_id = $1',
  [organizationId]
);

// Bad
const result = await db.query(
  `SELECT * FROM tickets WHERE organization_id = '${organizationId}'`
);
```

---

## API Design

### RESTful Conventions

- Use plural nouns for resources: `/tickets`, `/users`, `/customers`
- Use HTTP methods correctly:
  - `GET` → Read
  - `POST` → Create
  - `PATCH` → Partial update
  - `PUT` → Full replacement
  - `DELETE` → Remove
- Return appropriate status codes:
  - `200` → Success
  - `201` → Created
  - `400` → Bad Request
  - `401` → Unauthorized
  - `403` → Forbidden
  - `404` → Not Found
  - `500` → Server Error

### Response Format

```javascript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket with ID xyz not found"
  }
}

// Paginated response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

### Key Endpoints

```
POST   /tickets              Create ticket
GET    /tickets              List tickets (with filters)
GET    /tickets/:id          Get single ticket
PATCH  /tickets/:id          Update ticket
POST   /tickets/:id/reply    Add message to ticket
POST   /tickets/:id/assign   Assign ticket to agent
POST   /tickets/:id/close    Close ticket

POST   /users                Create user
GET    /users                List users
PATCH  /users/:id            Update user

POST   /customers            Create customer
GET    /customers/:id        Get customer
GET    /customers/:id/tickets Get customer's tickets
```

### Admin Endpoints (Overview)

```
/admin/agents                Agent management
/admin/customers             Customer management
/admin/workflows             Workflow configuration
/admin/automation-rules      Automation rules
/admin/sla-policies          SLA policies
/admin/articles              Knowledge base
/admin/integrations          Integrations
/admin/settings              Organization settings
/admin/audit-logs            Audit logs
```

See [Admin API Endpoints](#admin-api-endpoints) for full details.

---

## Ticket Workflow

### Status Values

```
open
in_progress
waiting_for_customer
resolved
closed
```

### Priority Values

```
low
medium
high
urgent
```

### Ticket Events

Track all ticket lifecycle events:

```
ticket_created
ticket_assigned
ticket_replied
ticket_status_changed
ticket_priority_changed
ticket_closed
ticket_reopened
```

---

## Background Jobs

Use Bull Queue for async processing:

### Job Types

- `email:parse` → Process incoming emails
- `email:send` → Send outgoing emails
- `notification:send` → Deliver notifications
- `sla:check` → Monitor SLA compliance
- `automation:run` → Execute automation rules

### Job Structure

```javascript
// jobs/email-processor.js
const emailQueue = new Bull('email', redisConfig);

emailQueue.process('parse', async (job) => {
  const { emailData } = job.data;
  // Process email...
});
```

---

## Middleware

### Required Middleware

- **Authentication**: Verify JWT tokens
- **Authorization**: Check user permissions
- **Rate Limiting**: Prevent abuse
- **Request Logging**: Log all requests
- **Error Handling**: Centralized error responses
- **Validation**: Validate request body/params

### Middleware Order

```javascript
app.use(requestLogger);
app.use(rateLimiter);
app.use(authenticate);
app.use(routes);
app.use(errorHandler);
```

---

## Error Handling

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

### Error Handler Middleware

```javascript
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message
    }
  });
};
```

---

## Authentication & Authorization

### Multi-tenancy

- All resources are scoped to an `organization_id`
- Always filter queries by organization
- Validate user belongs to organization

### User Roles

```
super_admin          Flashdesk platform owner (internal)
organization_admin   Full organization access
support_manager      Team management, analytics
support_agent        Ticket handling
customer             Portal access only
```

See [Admin Panel & Administrative Workflows](#admin-panel--administrative-workflows) for detailed role permissions.

---

## Environment Configuration

### Required Variables

```
NODE_ENV=development|production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/flashdesk

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Storage
S3_BUCKET=flashdesk-attachments
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

---

## Testing

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── routes/
│   └── jobs/
└── fixtures/
```

### Testing Conventions

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error scenarios

```javascript
describe('TicketService', () => {
  describe('createTicket', () => {
    it('should create a ticket with valid data', async () => {
      // Arrange
      const ticketData = { subject: 'Test', description: 'Test desc' };
      
      // Act
      const ticket = await ticketService.createTicket(ticketData);
      
      // Assert
      expect(ticket.id).toBeDefined();
      expect(ticket.status).toBe('open');
    });
  });
});
```

---

## Git Conventions

### Commit Messages

Follow **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(tickets): add ticket assignment endpoint
fix(auth): resolve token expiration issue
docs(api): update endpoint documentation
refactor(services): extract email parsing logic
test(tickets): add integration tests for ticket creation
```

---

## Security Guidelines

- Sanitize all user inputs
- Use parameterized queries (prevent SQL injection)
- Validate file uploads (type, size)
- Rate limit sensitive endpoints
- Log security events
- Never log sensitive data (passwords, tokens)
- Use HTTPS in production
- Implement CORS properly

---

## Performance Considerations

- Use database indexes for frequent queries
- Implement pagination for list endpoints
- Cache frequently accessed data with Redis
- Use connection pooling for database
- Offload heavy operations to background jobs
- Monitor query performance

---

## Module Guidelines

When creating new modules:

1. Create model with database queries
2. Create service with business logic
3. Create controller with request handling
4. Create routes file
5. Register routes in main app
6. Add tests for service and routes

---

## Code Review Checklist

- [ ] Follows layered architecture
- [ ] Input validation present
- [ ] Error handling implemented
- [ ] Database queries parameterized
- [ ] Organization scoping applied
- [ ] Tests included
- [ ] Conventional commit message
- [ ] No sensitive data logged

---

## Admin Panel & Administrative Workflows

Flashdesk provides an Admin Console where company administrators configure and manage the support system.

### Admin Roles

The system supports role-based access control (RBAC).

#### Role Hierarchy

```
super_admin          Flashdesk platform owner
organization_admin   Organization administrator
support_manager      Team leader of support agents
support_agent        Handles customer tickets
customer             End user receiving support
```

#### Role Permissions

| Role | Capabilities |
|------|-------------|
| `super_admin` | Manage all organizations, billing plans, platform health, system-wide settings, global analytics |
| `organization_admin` | Manage agents, customers, workflows, ticket routing, SLA rules, integrations, organization settings |
| `support_manager` | Assign tickets, monitor queues, monitor agent performance, manage knowledge base, escalate tickets |
| `support_agent` | Respond to tickets, update ticket status, add internal notes |
| `customer` | Create tickets, reply to tickets, view ticket status |

### Admin Dashboard Sections

Organization admins access these core sections:

```
dashboard
agents
customers
ticket_settings
automation_rules
sla_policies
knowledge_base
integrations
billing
organization_settings
audit_logs
```

---

## Agent Management

Admins manage support agents through the admin panel.

### Capabilities

- Add agent
- Deactivate agent
- Assign roles
- Assign departments
- Set permissions

### Agent Fields

```
agent_id
name
email
role
department
status
created_at
updated_at
```

---

## Customer Management

Admins manage customer records.

### Capabilities

- Create customers
- Edit customer profile
- Deactivate customers
- View ticket history
- Assign customers to organizations

### Customer Fields

```
customer_id
name
email
company
phone
status
created_at
updated_at
```

---

## Ticket Workflow Configuration

Admins can configure and customize ticket workflow states.

### Default Workflow States

```
open
in_progress
waiting_for_customer
resolved
closed
```

Workflow states are customizable per organization.

---

## Ticket Routing Rules

Admins define automatic ticket routing rules.

### Example Rules

```javascript
// Keyword-based routing
IF ticket.subject CONTAINS "payment" OR ticket.body CONTAINS "billing"
ASSIGN billing_team

// Priority-based escalation
IF ticket.priority = "urgent"
ESCALATE to manager

// Department routing
IF ticket.category = "technical"
ASSIGN engineering_team
```

### Routing Strategies

- **Round Robin**: Distribute tickets evenly across agents
- **Skill-based**: Match ticket requirements to agent skills
- **Department-based**: Route to relevant department
- **Load-balanced**: Consider agent workload

---

## SLA Configuration

Admins define Service Level Agreements per organization.

### SLA Fields

```
sla_id
name
first_response_time      (e.g., 1 hour)
resolution_time          (e.g., 24 hours)
priority
escalation_enabled
created_at
updated_at
```

### SLA Behavior

- SLA timers start when ticket is created
- Escalation triggers when SLA is breached
- SLA pause when status = `waiting_for_customer`

---

## Knowledge Base Management

Admins manage help articles for self-service support.

### Capabilities

- Create articles
- Edit articles
- Organize categories
- Publish/unpublish articles

### Article Fields

```
article_id
title
content
category_id
status (draft | published)
author_id
created_at
updated_at
```

### Default Categories

```
Account Issues
Billing
Technical Problems
General Questions
```

---

## Automation Rules

Admins configure automation rules for ticket workflows.

### Example Rules

```javascript
// Notification automation
IF ticket.priority = "urgent"
NOTIFY manager

// Survey automation
IF ticket.status CHANGED TO "resolved"
SEND satisfaction_survey

// Auto-assignment
IF ticket.created AND ticket.department = "sales"
ASSIGN sales_team
```

### Automation Fields

```
rule_id
name
trigger_event
conditions
actions
enabled
created_at
updated_at
```

---

## Integrations Management

Admins connect external tools to Flashdesk.

### Supported Integrations

| Category | Integrations |
|----------|-------------|
| Email | SMTP, Mailgun, SES |
| Notifications | Slack, Microsoft Teams |
| Issue Tracking | GitHub, Jira |
| Webhooks | Custom webhook endpoints |

### Integration Fields

```
integration_id
type
name
config (encrypted JSON)
enabled
created_at
updated_at
```

---

## Organization Settings

Admins configure organization-level settings.

### Organization Fields

```
organization_id
organization_name
support_email
timezone
branding_logo
branding_colors
default_language
created_at
updated_at
```

---

## Billing & Subscription Management

Admins manage subscription plans and billing.

### Capabilities

- View current plan
- Upgrade/downgrade plan
- Manage payment methods
- View invoices

### Subscription Plans

```
starter
growth
enterprise
```

### Billing Fields

```
subscription_id
organization_id
plan
status
billing_cycle
next_billing_date
created_at
updated_at
```

---

## Audit Logs

Track all administrative activities for compliance.

### Tracked Events

```
agent_added
agent_deactivated
ticket_reassigned
automation_rule_created
automation_rule_updated
sla_changed
integration_connected
settings_updated
```

### Audit Log Fields

```
log_id
organization_id
user_id
action
resource_type
resource_id
details (JSON)
ip_address
created_at
```

---

## Admin API Endpoints

### Agent Management

```
POST   /admin/agents           Create agent
GET    /admin/agents           List agents
GET    /admin/agents/:id       Get agent details
PATCH  /admin/agents/:id       Update agent
DELETE /admin/agents/:id       Deactivate agent
```

### Customer Management

```
POST   /admin/customers        Create customer
GET    /admin/customers        List customers
GET    /admin/customers/:id    Get customer details
PATCH  /admin/customers/:id    Update customer
DELETE /admin/customers/:id    Deactivate customer
```

### Workflow Management

```
GET    /admin/workflows        List workflow states
POST   /admin/workflows        Create workflow state
PATCH  /admin/workflows/:id    Update workflow state
DELETE /admin/workflows/:id    Delete workflow state
```

### Automation Rules

```
GET    /admin/automation-rules        List rules
POST   /admin/automation-rules        Create rule
GET    /admin/automation-rules/:id    Get rule details
PATCH  /admin/automation-rules/:id    Update rule
DELETE /admin/automation-rules/:id    Delete rule
```

### SLA Policies

```
GET    /admin/sla-policies            List SLA policies
POST   /admin/sla-policies            Create SLA policy
PATCH  /admin/sla-policies/:id        Update SLA policy
DELETE /admin/sla-policies/:id        Delete SLA policy
```

### Knowledge Base

```
GET    /admin/articles                List articles
POST   /admin/articles                Create article
PATCH  /admin/articles/:id            Update article
DELETE /admin/articles/:id            Delete article
GET    /admin/categories              List categories
POST   /admin/categories              Create category
```

### Integrations

```
GET    /admin/integrations            List integrations
POST   /admin/integrations            Connect integration
PATCH  /admin/integrations/:id        Update integration
DELETE /admin/integrations/:id        Disconnect integration
```

### Organization Settings

```
GET    /admin/settings                Get organization settings
PATCH  /admin/settings                Update organization settings
```

### Audit Logs

```
GET    /admin/audit-logs              List audit logs (with filters)
```

---

## Multi-Tenant Architecture

Flashdesk supports multiple organizations with isolated data.

### Data Isolation

```
Organization A
   ├── agents
   ├── customers
   ├── tickets
   ├── automation_rules
   └── settings

Organization B
   ├── agents
   ├── customers
   ├── tickets
   ├── automation_rules
   └── settings
```

### Multi-Tenant Tables

Every major table includes `organization_id` for tenant isolation:

```
organizations
users                    → organization_id
customers                → organization_id
tickets                  → organization_id
ticket_messages          → organization_id
automation_rules         → organization_id
sla_policies             → organization_id
knowledge_base_articles  → organization_id
integrations             → organization_id
audit_logs               → organization_id
```

### Query Pattern

Always filter by `organization_id`:

```javascript
// Good - tenant-scoped query
const tickets = await db.query(
  'SELECT * FROM tickets WHERE organization_id = $1 AND status = $2',
  [organizationId, 'open']
);

// Bad - missing tenant scope
const tickets = await db.query(
  'SELECT * FROM tickets WHERE status = $1',
  ['open']
);
```

---

## Admin Feature Priority (MVP)

### MVP Features

- ✔ Agent management
- ✔ Customer management
- ✔ Ticket workflow settings
- ✔ Organization settings
- ✔ Automation rules

### Post-MVP Features

- Knowledge base management
- Advanced SLA configuration
- Billing & subscription management
- Third-party integrations
- Advanced analytics
- Audit logs
