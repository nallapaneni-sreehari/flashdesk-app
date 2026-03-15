const agentService = require('../services/agent.service');

class AgentController {
  async createAgent(req, res) {
    try {
      const { workspaceId } = req.user;
      const { firstName, lastName, email, phone, avatar, role, department, jobTitle, bio, timezone, password, sendInvite } = req.body;

      if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
        return res.fail(400, { message: 'First name, last name, and email are required' });
      }

      const agent = await agentService.createAgent({
        firstName, lastName, email, phone, avatar, role, department, jobTitle, bio, timezone, password, sendInvite, workspaceId,
      });

      res.ok(201, agent, 'Agent created successfully');
    } catch (error) {
      res.handleError(error, { body: req.body });
    }
  }

  async getAgents(req, res) {
    try {
      const { workspaceId } = req.user;
      const { search, status, role, page, pageSize } = req.query;

      const result = await agentService.getAgents({
        workspaceId,
        search,
        status,
        role,
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      });

      res.ok(200, result.agents, 'Agents retrieved successfully', result.pagination);
    } catch (error) {
      res.handleError(error, { query: req.query });
    }
  }

  async getAgentById(req, res) {
    try {
      const { id } = req.params;

      const agent = await agentService.getAgentById(id);
      if (!agent) {
        return res.fail(404, { message: 'Agent not found' });
      }

      res.ok(200, agent, 'Agent retrieved successfully');
    } catch (error) {
      res.handleError(error, { agentId: req.params.id });
    }
  }

  async updateAgent(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, avatar, role, status, department, jobTitle, bio, timezone, password } = req.body;

      const existing = await agentService.getAgentById(id);
      if (!existing) {
        return res.fail(404, { message: 'Agent not found' });
      }
      // check if user being deactivated is admin
      if (status === "inactive") {
        if (existing.role === "admin") {
          const error = new Error("Admin agents cannot be deactivated");
          error.statusCode = 403;
          throw error;
        }
      }

      const agent = await agentService.updateAgent(id, {
        firstName, lastName, email, phone, avatar, role, status, department, jobTitle, bio, timezone, password,
      });

      res.ok(200, agent, 'Agent updated successfully');
    } catch (error) {
      res.handleError(error, { agentId: req.params.id, body: req.body });
    }
  }

  async deleteAgent(req, res) {
    try {
      const { id } = req.params;

      const existing = await agentService.getAgentById(id);
      if (!existing) {
        return res.fail(404, { message: "Agent not found" });
      }
      //   check if it is admin
      if (existing.role === "admin") {
        return res.fail(403, { message: "Admin agents cannot be deleted" });
      }

      await agentService.deleteAgent(id);
      res.ok(200, null, "Agent deleted successfully");
    } catch (error) {
      res.handleError(error, { agentId: req.params.id });
    }
  }

  async bulkCreateAgents(req, res) {
    try {
      const { agents } = req.body;
      const { workspaceId } = req.user;

      if (!Array.isArray(agents) || agents.length === 0) {
        return res.fail(400, { message: 'An array of agents is required' });
      }

      const invalid = agents.filter((a) => !a.firstName?.trim() || !a.lastName?.trim() || !a.email?.trim());
      if (invalid.length > 0) {
        return res.fail(400, { message: `${invalid.length} agent(s) missing required fields (firstName, lastName, email)` });
      }

      const result = await agentService.bulkCreateAgents(agents, workspaceId);
      res.ok(201, result, `${result.created.length} agent(s) imported successfully`);
    } catch (error) {
      res.handleError(error, { count: req.body?.agents?.length });
    }
  }

  async getAgentTickets(req, res) {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;

      const existing = await agentService.getAgentById(id);
      if (!existing) {
        return res.fail(404, { message: 'Agent not found' });
      }

      const result = await agentService.getAgentTickets(id, {
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      });

      res.ok(200, result.tickets, 'Tickets retrieved successfully', result.pagination);
    } catch (error) {
      res.handleError(error, { agentId: req.params.id });
    }
  }
}

module.exports = new AgentController();
