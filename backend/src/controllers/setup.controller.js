const setupService = require('../services/setup.service');

class SetupController {
  async checkSetup(req, res) {
    try {
      const result = await setupService.isSetupComplete();
      res.ok(200, result);
    } catch (error) {
      res.handleError(error);
    }
  }

  async createWorkspace(req, res) {
    try {
      const { workspaceName, slug, adminName, adminEmail, adminPassword } = req.body;

      if (!workspaceName?.trim()) {
        return res.fail(400, { message: 'Workspace name is required' });
      }
      if (!slug?.trim() || !/^[a-z0-9-]+$/.test(slug)) {
        return res.fail(400, { message: 'A valid workspace URL slug is required (lowercase letters, numbers, hyphens)' });
      }
      if (!adminName?.trim()) {
        return res.fail(400, { message: 'Admin name is required' });
      }
      if (!adminEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
        return res.fail(400, { message: 'A valid admin email is required' });
      }
      if (!adminPassword || adminPassword.length < 8) {
        return res.fail(400, { message: 'Password must be at least 8 characters' });
      }

      const result = await setupService.createWorkspace({
        workspaceName: workspaceName.trim(),
        slug: slug.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
      });

      res.ok(201, result, 'Workspace created successfully');
    } catch (error) {
      res.handleError(error, { slug: req.body?.slug });
    }
  }
}

module.exports = new SetupController();
