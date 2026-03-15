const customerService = require('../services/customer.service');

class CustomerController {
  async createCustomer(req, res) {
    try {
      const { name, email, phone, avatar, tier, workspaceId, companyId } = req.body;

      if (!name?.trim() || !email?.trim()) {
        return res.fail(400, { message: 'Name and email are required' });
      }

      const customer = await customerService.createCustomer({
        name, email, phone, avatar, tier, workspaceId, companyId,
      });

      res.ok(201, customer, 'Customer created successfully');
    } catch (error) {
      res.handleError(error, { body: req.body });
    }
  }

  async getCustomers(req, res) {
    try {
      const { search, workspaceId, page, pageSize } = req.query;

      const result = await customerService.getCustomers({
        workspaceId: workspaceId ?? req.user?.workspaceId,
        search,
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      });

      res.ok(200, result.customers, 'Customers retrieved successfully', result.pagination);
    } catch (error) {
      res.handleError(error, { query: req.query });
    }
  }

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return res.fail(404, { message: 'Customer not found' });
      }

      res.ok(200, customer, 'Customer retrieved successfully');
    } catch (error) {
      res.handleError(error, { customerId: req.params.id });
    }
  }

  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, avatar, tier, lastContactAt } = req.body;

      const existing = await customerService.getCustomerById(id);
      if (!existing) {
        return res.fail(404, { message: 'Customer not found' });
      }

      const customer = await customerService.updateCustomer(id, {
        name, email, phone, avatar, tier, lastContactAt,
      });

      res.ok(200, customer, 'Customer updated successfully');
    } catch (error) {
      res.handleError(error, { customerId: req.params.id, body: req.body });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      const existing = await customerService.getCustomerById(id);
      if (!existing) {
        return res.fail(404, { message: 'Customer not found' });
      }

      await customerService.deleteCustomer(id);
      res.ok(200, null, 'Customer deleted successfully');
    } catch (error) {
      res.handleError(error, { customerId: req.params.id });
    }
  }

  async bulkCreateCustomers(req, res) {
    try {
      const { customers } = req.body;
      let { workspaceId } = req.body;

      if(!workspaceId){
        workspaceId = req.user?.workspaceId;
      }
      if (!workspaceId) {
        return res.fail(400, { message: 'workspaceId is required' });
      }

      if (!Array.isArray(customers) || customers.length === 0) {
        return res.fail(400, { message: 'An array of customers is required' });
      }

      const invalid = customers.filter((c) => !c.name?.trim() || !c.email?.trim());
      if (invalid.length > 0) {
        return res.fail(400, { message: `${invalid.length} customer(s) missing required name or email` });
      }

      const result = await customerService.bulkCreateCustomers(customers, workspaceId);
      res.ok(201, result, `${result.created.length} customer(s) imported successfully`);
    } catch (error) {
      res.handleError(error, { count: req.body?.customers?.length });
    }
  }

  async getCustomerTickets(req, res) {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;

      const existing = await customerService.getCustomerById(id);
      if (!existing) {
        return res.fail(404, { message: 'Customer not found' });
      }

      const result = await customerService.getCustomerTickets(id, {
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      });

      res.ok(200, result.tickets, 'Tickets retrieved successfully', result.pagination);
    } catch (error) {
      res.handleError(error, { customerId: req.params.id });
    }
  }
}

module.exports = new CustomerController();
