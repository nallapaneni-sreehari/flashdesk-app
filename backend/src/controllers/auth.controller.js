const authService = require('../services/auth.service');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email?.trim()) {
        return res.fail(400, { message: 'Email is required' });
      }
      if (!password) {
        return res.fail(400, { message: 'Password is required' });
      }

      const device = req.headers['user-agent'] || 'Unknown';
      const browser = req.headers['sec-ch-ua'] || 'Unknown';
      const ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        null;

      const result = await authService.login({
        email: email.trim().toLowerCase(),
        password,
        device,
        browser,
        ipAddress,
      });

      res.ok(200, result, 'Login successful');
    } catch (error) {
      res.handleError(error, { email: req.body?.email });
    }
  }
}

module.exports = new AuthController();
