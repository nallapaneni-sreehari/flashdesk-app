const bcrypt = require('bcrypt');
const { prisma } = require('../connections/prisma');

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Demo@123';

// ── Sample Agents ────────────────────────────────────────────────────────────

const SAMPLE_AGENTS = [
  { firstName: 'Alice', lastName: 'Cooper', email: 'alice@demo.flashdesk.io', role: 'agent', department: 'Technical Support', jobTitle: 'Senior Support Engineer', bio: 'Specializes in complex technical issues and escalations.' },
  { firstName: 'Bob', lastName: 'Martinez', email: 'bob@demo.flashdesk.io', role: 'agent', department: 'Billing', jobTitle: 'Billing Support Specialist', bio: 'Expert in billing, subscriptions, and payment issues.' },
  { firstName: 'Carol', lastName: 'Davis', email: 'carol@demo.flashdesk.io', role: 'agent', department: 'General Support', jobTitle: 'Support Agent', bio: 'Handles general inquiries and onboarding assistance.' },
  { firstName: 'David', lastName: 'Kim', email: 'david@demo.flashdesk.io', role: 'agent', department: 'Technical Support', jobTitle: 'Support Engineer', bio: 'Focused on integrations and API-related questions.' },
  { firstName: 'Emma', lastName: 'Wilson', email: 'emma@demo.flashdesk.io', role: 'admin', department: 'Management', jobTitle: 'Support Manager', bio: 'Oversees the support team and manages SLA policies.' },
];

// ── Sample Companies ─────────────────────────────────────────────────────────

const SAMPLE_COMPANIES = [
  { name: 'Acme Corp', domain: 'acme.com', website: 'https://acme.com', notes: 'Enterprise customer, high priority' },
  { name: 'TechStart Inc', domain: 'techstart.io', website: 'https://techstart.io', notes: 'Startup plan, fast growing' },
  { name: 'GlobalRetail', domain: 'globalretail.com', website: 'https://globalretail.com', notes: 'Large retail chain, seasonal spikes' },
];

// ── Sample Customers ─────────────────────────────────────────────────────────

const SAMPLE_CUSTOMERS = [
  { name: 'John Smith', email: 'john.smith@acme.com', phone: '+1-555-0101', tier: 'enterprise', companyIndex: 0 },
  { name: 'Sarah Johnson', email: 'sarah.j@acme.com', phone: '+1-555-0102', tier: 'enterprise', companyIndex: 0 },
  { name: 'Mike Chen', email: 'mike@techstart.io', phone: '+1-555-0201', tier: 'pro', companyIndex: 1 },
  { name: 'Lisa Park', email: 'lisa@techstart.io', tier: 'pro', companyIndex: 1 },
  { name: 'James Brown', email: 'james@globalretail.com', phone: '+1-555-0301', tier: 'business', companyIndex: 2 },
];

// ── Sample Tags ──────────────────────────────────────────────────────────────

const SAMPLE_TAGS = ['billing', 'login', 'api', 'bug', 'feature-request', 'onboarding', 'performance', 'urgent', 'documentation', 'mobile'];

// ── Sample Tickets ───────────────────────────────────────────────────────────

const SAMPLE_TICKETS = [
  {
    subject: 'Cannot login to dashboard after password reset',
    description: '<p>I reset my password yesterday but I still cannot log in. The page just refreshes and shows the login form again. I\'ve tried clearing cookies and using incognito mode.</p>',
    type: 'bug', status: 'open', priority: 'high', channel: 'portal',
    customerIndex: 0, agentIndex: 0, tags: ['login', 'bug'],
    messages: [
      { content: '<p>I reset my password yesterday but I still cannot log in. The page just refreshes and shows the login form again.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi John, sorry to hear that. Could you try clearing your browser cache completely and attempt again? I\'ll also check the auth logs on our end.</p>', authorType: 'agent', isInternal: false },
      { content: '<p>Checked auth logs — seeing token expiry mismatch. Likely a cache issue on the CDN side.</p>', authorType: 'agent', isInternal: true },
    ],
  },
  {
    subject: 'Billing discrepancy on last invoice',
    description: '<p>Our latest invoice shows $2,450 but we expected $1,800 based on our plan. Can you provide a breakdown of the charges?</p>',
    type: 'issue', status: 'in_progress', priority: 'medium', channel: 'email',
    customerIndex: 1, agentIndex: 1, tags: ['billing'],
    messages: [
      { content: '<p>Our latest invoice shows $2,450 but we expected $1,800 based on our plan. Can you provide a breakdown?</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi Sarah, I\'m looking into this now. It appears there may be overage charges from last month. Let me pull up the detailed usage report.</p>', authorType: 'agent', isInternal: false },
    ],
  },
  {
    subject: 'API rate limiting returning 429 errors',
    description: '<p>We\'re hitting 429 Too Many Requests errors on our integration. Our current plan should allow 10,000 requests/hour but we\'re getting throttled at around 5,000.</p>',
    type: 'bug', status: 'open', priority: 'urgent', channel: 'portal',
    customerIndex: 2, agentIndex: 3, tags: ['api', 'bug', 'urgent'],
    messages: [
      { content: '<p>We\'re hitting 429 errors. Our plan allows 10K req/hr but we get throttled at ~5K.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi Mike, I\'m escalating this to our infrastructure team. Can you share your API key prefix so I can check the rate limit configuration?</p>', authorType: 'agent', isInternal: false },
      { content: '<p>Sure, it starts with <code>tsk_live_abc</code>.</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Feature request: Dark mode for customer portal',
    description: '<p>Many of our users have requested dark mode support for the customer portal. It would greatly improve the experience for users who prefer darker interfaces.</p>',
    type: 'feature_request', status: 'open', priority: 'low', channel: 'portal',
    customerIndex: 3, agentIndex: null, tags: ['feature-request'],
    messages: [
      { content: '<p>Many of our users have requested dark mode support for the customer portal.</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'How to set up SSO integration?',
    description: '<p>We want to configure SAML SSO for our organization. Is there documentation available? We use Okta as our identity provider.</p>',
    type: 'question', status: 'resolved', priority: 'medium', channel: 'chat',
    customerIndex: 0, agentIndex: 2, tags: ['onboarding', 'documentation'],
    messages: [
      { content: '<p>We want to configure SAML SSO with Okta. Is there documentation available?</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi John! Yes, we have a detailed guide for Okta SSO setup. Here\'s the link: <a href="#">SSO Configuration Guide</a>. Let me know if you need any help with the setup.</p>', authorType: 'agent', isInternal: false },
      { content: '<p>Got it working, thanks Carol!</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Dashboard loading slowly — performance degradation',
    description: '<p>The main dashboard has been taking 15+ seconds to load since this morning. All other pages seem fine. We have about 500 agents using the system.</p>',
    type: 'incident', status: 'in_progress', priority: 'high', channel: 'phone',
    customerIndex: 4, agentIndex: 0, tags: ['performance', 'urgent'],
    messages: [
      { content: '<p>Dashboard has been taking 15+ seconds to load since this morning. Other pages are fine.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi James, we\'re aware of the performance issue and our engineering team is investigating. It appears to be related to a database query optimization that regressed.</p>', authorType: 'agent', isInternal: false },
      { content: '<p>Found the root cause — a missing index on the ticket aggregation query. Deploying fix now.</p>', authorType: 'agent', isInternal: true },
    ],
  },
  {
    subject: 'Need to add 50 new agent seats',
    description: '<p>We\'re expanding our support team and need to add 50 additional agent seats to our plan. Can you help with the upgrade process?</p>',
    type: 'request', status: 'waiting', priority: 'medium', channel: 'email',
    customerIndex: 4, agentIndex: 1, tags: ['billing'],
    messages: [
      { content: '<p>We need to add 50 additional agent seats to our plan.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi James, I\'d be happy to help with that. I\'ve prepared a quote for the additional seats. Could you confirm the billing contact for the updated invoice?</p>', authorType: 'agent', isInternal: false },
    ],
  },
  {
    subject: 'Webhook notifications not firing',
    description: '<p>We configured webhooks for ticket creation events but they stopped working 2 days ago. Our endpoint is healthy and accepting requests from other services.</p>',
    type: 'bug', status: 'open', priority: 'high', channel: 'portal',
    customerIndex: 2, agentIndex: 3, tags: ['api', 'bug'],
    messages: [
      { content: '<p>Our webhooks for ticket creation stopped working 2 days ago. Our endpoint is healthy.</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Mobile app crashes on ticket view',
    description: '<p>The iOS mobile app crashes consistently when trying to view ticket details. Running version 3.2.1 on iPhone 15 Pro with iOS 18.</p>',
    type: 'bug', status: 'open', priority: 'medium', channel: 'portal',
    customerIndex: 3, agentIndex: null, tags: ['mobile', 'bug'],
    messages: [
      { content: '<p>iOS app crashes when viewing ticket details. Version 3.2.1 on iPhone 15 Pro, iOS 18.</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Request for custom report template',
    description: '<p>We need a custom monthly report that includes ticket resolution times by department, customer satisfaction scores, and agent performance metrics.</p>',
    type: 'request', status: 'resolved', priority: 'low', channel: 'email',
    customerIndex: 1, agentIndex: 4, tags: ['feature-request'],
    messages: [
      { content: '<p>We need a custom monthly report with resolution times, CSAT scores, and agent metrics.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi Sarah, I\'ve created a custom report template for you. You can find it under Reports &gt; Custom Templates. Let me know if you need any adjustments.</p>', authorType: 'agent', isInternal: false },
      { content: '<p>This is perfect, exactly what we needed. Thank you!</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Cannot export ticket data to CSV',
    description: '<p>When I click the export button on the tickets page, nothing happens. I\'ve tried with different filters and browsers. Need this for our quarterly review.</p>',
    type: 'bug', status: 'in_progress', priority: 'medium', channel: 'chat',
    customerIndex: 0, agentIndex: 2, tags: ['bug'],
    messages: [
      { content: '<p>Export button on tickets page doesn\'t work. Tried different browsers.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi John, I can reproduce this issue. It looks like a JavaScript error is preventing the export. Our dev team is working on a fix.</p>', authorType: 'agent', isInternal: false },
    ],
  },
  {
    subject: 'Onboarding session request for new team',
    description: '<p>We just brought on a new customer success team of 8 people. Could we schedule an onboarding/training session for them?</p>',
    type: 'request', status: 'closed', priority: 'low', channel: 'email',
    customerIndex: 4, agentIndex: 2, tags: ['onboarding'],
    messages: [
      { content: '<p>We have 8 new team members who need onboarding. Can we schedule a session?</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Absolutely! I\'ve scheduled a training session for next Tuesday at 2 PM EST. I\'ll send calendar invites to all participants.</p>', authorType: 'agent', isInternal: false },
      { content: '<p>Great session, everyone found it very helpful. Thanks!</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Two-factor authentication not sending codes',
    description: '<p>When I try to log in with 2FA enabled, the SMS code never arrives. I\'ve verified my phone number is correct. This is blocking my access to the admin panel.</p>',
    type: 'incident', status: 'resolved', priority: 'urgent', channel: 'phone',
    customerIndex: 1, agentIndex: 0, tags: ['login', 'urgent'],
    messages: [
      { content: '<p>2FA SMS codes aren\'t arriving. My phone number is correct. I\'m locked out of admin.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi Sarah, I\'ve temporarily disabled 2FA on your account so you can log in. Our SMS provider had an outage — it\'s been resolved now. You can re-enable 2FA in your security settings.</p>', authorType: 'agent', isInternal: false },
      { content: '<p>I\'m in now, re-enabled 2FA and it\'s working. Thanks for the quick response!</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Automation rule not triggering for email tickets',
    description: '<p>We set up an automation rule to auto-assign email tickets to the billing team, but tickets from the email channel are not being routed. Portal tickets work fine.</p>',
    type: 'bug', status: 'open', priority: 'medium', channel: 'portal',
    customerIndex: 2, agentIndex: null, tags: ['bug'],
    messages: [
      { content: '<p>Our auto-assign rule for email tickets isn\'t working. Portal tickets route correctly.</p>', authorType: 'customer', isInternal: false },
    ],
  },
  {
    subject: 'Upgrade plan from Growth to Enterprise',
    description: '<p>We\'d like to upgrade our subscription from the Growth plan to Enterprise. We need the advanced analytics and priority support features.</p>',
    type: 'request', status: 'waiting', priority: 'medium', channel: 'email',
    customerIndex: 0, agentIndex: 1, tags: ['billing'],
    messages: [
      { content: '<p>We\'d like to upgrade from Growth to Enterprise for advanced analytics and priority support.</p>', authorType: 'customer', isInternal: false },
      { content: '<p>Hi John, great choice! I\'ve prepared the Enterprise upgrade details. The pro-rated amount for the remainder of your billing cycle would be $1,200. Shall I proceed with the upgrade?</p>', authorType: 'agent', isInternal: false },
    ],
  },
];

// ── Seed Runner ──────────────────────────────────────────────────────────────

class SeedService {
  /**
   * Seeds a workspace with sample data (agents, companies, customers, tickets, messages, tags, history).
   * @param {object} tx - Prisma transaction client
   * @param {string} workspaceId - The workspace to seed
   * @param {string} adminId - The admin user who created the workspace
   */
  async seedWorkspace(tx, workspaceId, adminId) {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // Get workspace slug to make seed emails unique per workspace
    const workspace = await tx.workspace.findUnique({ where: { id: workspaceId }, select: { slug: true } });
    const slug = workspace?.slug || workspaceId.slice(0, 8);

    // 1. Create agents
    const agents = [];
    for (const a of SAMPLE_AGENTS) {
      const [localPart, domain] = a.email.split('@');
      const agent = await tx.user.create({
        data: {
          email: `${localPart}.${slug}@${domain}`,
          passwordHash,
          firstName: a.firstName,
          lastName: a.lastName,
          role: a.role,
          status: 'active',
          department: a.department,
          jobTitle: a.jobTitle,
          bio: a.bio,
          workspaceId,
        },
      });
      agents.push(agent);
    }

    // 2. Create companies
    const companies = [];
    for (const c of SAMPLE_COMPANIES) {
      const company = await tx.company.create({
        data: {
          name: c.name,
          domain: c.domain,
          website: c.website,
          notes: c.notes,
          workspaceId,
        },
      });
      companies.push(company);
    }

    // 3. Create customers
    const customers = [];
    for (const c of SAMPLE_CUSTOMERS) {
      const [localPart, domain] = c.email.split('@');
      const customer = await tx.customer.create({
        data: {
          name: c.name,
          email: `${localPart}.${slug}@${domain}`,
          phone: c.phone || null,
          tier: c.tier || null,
          workspaceId,
          companyId: c.companyIndex !== undefined ? companies[c.companyIndex].id : null,
          lastContactAt: randomPastDate(30),
        },
      });
      customers.push(customer);
    }

    // 4. Create tags
    const tagMap = {};
    for (const name of SAMPLE_TAGS) {
      const tag = await tx.tag.create({ data: { name, workspaceId } });
      tagMap[name] = tag.id;
    }

    // 5. Create tickets with messages, history, and tags
    for (let i = 0; i < SAMPLE_TICKETS.length; i++) {
      const t = SAMPLE_TICKETS[i];
      const ticketCreatedAt = randomPastDate(14, 1);
      const customer = customers[t.customerIndex];
      const agent = t.agentIndex !== null ? agents[t.agentIndex] : null;

      const ticket = await tx.ticket.create({
        data: {
          subject: t.subject,
          description: t.description,
          type: t.type,
          status: t.status,
          priority: t.priority,
          channel: t.channel,
          customerId: customer.id,
          assignedAgentId: agent?.id || null,
          workspaceId,
          createdAt: ticketCreatedAt,
          resolvedAt: ['resolved', 'closed'].includes(t.status) ? randomDateAfter(ticketCreatedAt, 3) : null,
          closedAt: t.status === 'closed' ? randomDateAfter(ticketCreatedAt, 5) : null,
        },
      });

      // Tags
      for (const tagName of t.tags) {
        if (tagMap[tagName]) {
          await tx.ticketTag.create({ data: { ticketId: ticket.id, tagId: tagMap[tagName] } });
        }
      }

      // History entry for creation
      await tx.historyEntry.create({
        data: {
          type: 'created',
          description: 'Ticket created',
          ticketId: ticket.id,
          timestamp: ticketCreatedAt,
        },
      });

      // History for assignment
      if (agent) {
        await tx.historyEntry.create({
          data: {
            type: 'assigned',
            description: `Assigned to ${agent.firstName} ${agent.lastName}`,
            toValue: `${agent.firstName} ${agent.lastName}`,
            ticketId: ticket.id,
            userId: adminId,
            timestamp: new Date(ticketCreatedAt.getTime() + 60_000),
          },
        });
      }

      // History for status changes
      if (t.status !== 'open') {
        await tx.historyEntry.create({
          data: {
            type: 'status_changed',
            description: `Status changed from open to ${t.status}`,
            fromValue: 'open',
            toValue: t.status,
            ticketId: ticket.id,
            userId: agent?.id || adminId,
            timestamp: new Date(ticketCreatedAt.getTime() + 120_000),
          },
        });
      }

      // Messages
      let msgTime = new Date(ticketCreatedAt.getTime() + 30_000);
      for (const m of t.messages) {
        await tx.message.create({
          data: {
            content: m.content,
            authorType: m.authorType,
            isInternal: m.isInternal || false,
            ticketId: ticket.id,
            userId: m.authorType === 'agent' ? (agent?.id || adminId) : null,
            customerId: m.authorType === 'customer' ? customer.id : null,
            createdAt: msgTime,
          },
        });
        msgTime = new Date(msgTime.getTime() + randomInt(300_000, 7_200_000));
      }
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomPastDate(maxDaysAgo, minDaysAgo = 0) {
  const now = Date.now();
  const minMs = minDaysAgo * 86_400_000;
  const maxMs = maxDaysAgo * 86_400_000;
  return new Date(now - randomInt(minMs, maxMs));
}

function randomDateAfter(baseDate, maxDaysAfter) {
  return new Date(baseDate.getTime() + randomInt(3_600_000, maxDaysAfter * 86_400_000));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = new SeedService();
