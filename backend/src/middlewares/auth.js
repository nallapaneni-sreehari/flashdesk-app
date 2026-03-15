const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flashdesk-dev-secret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.fail(401, { message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      workspaceId: decoded.workspaceId,
      sessionId: decoded.sessionId,
    };
    next();
  } catch (error) {
    return res.fail(401, { message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
