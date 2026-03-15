const bcrypt = require('bcrypt');
const { prisma } = require('../connections/prisma');
const seedService = require('./seed.service');

const SALT_ROUNDS = 12;

class SetupService {
  async isSetupComplete() {
    const workspace = await prisma.workspace.findFirst({
      select: { id: true, name: true },
    });

    return {
      isSetupComplete: !!workspace,
      workspace: workspace || undefined,
    };
  }

  async createWorkspace({ workspaceName, slug, adminName, adminEmail, adminPassword }) {
    // Check if slug is taken
    const slugTaken = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (slugTaken) {
      const error = new Error('This workspace URL is already taken');
      error.statusCode = 409;
      throw error;
    }

    // Check if admin email is already registered
    const emailTaken = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });
    if (emailTaken) {
      const error = new Error('This email is already registered. Please use a different email or log in.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    // Split adminName into first/last
    const nameParts = adminName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create workspace + admin + seed data in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
        },
      });

      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName,
          lastName,
          role: 'admin',
          status: 'active',
          workspaceId: workspace.id,
        },
      });

      // Seed sample data so the new workspace isn't empty
      await seedService.seedWorkspace(tx, workspace.id, admin.id);

      return { workspace, admin };
    }, { timeout: 30000 });

    return {
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
      },
      admin: {
        id: result.admin.id,
        name: `${result.admin.firstName} ${result.admin.lastName}`.trim(),
        email: result.admin.email,
      },
    };
  }
}

module.exports = new SetupService();
