const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../connections/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'flashdesk-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
  async login({ email, password, device, browser, ipAddress }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Your account has been deactivated. Contact your administrator');
      error.statusCode = 403;
      throw error;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        device: device || 'Unknown',
        browser: browser || 'Unknown',
        ipAddress: ipAddress || null,
        isCurrent: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Update lastActiveAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
        sessionId: session.id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
      workspace: user.workspace,
    };
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}

module.exports = new AuthService();
