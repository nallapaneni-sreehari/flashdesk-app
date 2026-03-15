/**
 * HTML email template for welcoming a new agent to the workspace.
 *
 * @param {Object} data
 * @param {string} data.firstName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.workspaceName
 * @param {string} data.loginUrl
 * @returns {{ html: string, text: string }}
 */
function welcomeAgentTemplate(data) {
  const {
    firstName,
    email,
    password,
    workspaceName,
    loginUrl,
  } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#4F46E5;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(workspaceName)}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Welcome to ${escapeHtml(workspaceName)}! 🎉</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Hi ${escapeHtml(firstName)}, you've been added as a support agent. Here are your login credentials:</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Email</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px;">
                          <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(email)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Password</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0;">
                          <code style="font-size:15px;color:#111827;font-weight:600;background-color:#e5e7eb;padding:4px 8px;border-radius:4px;">${escapeHtml(password)}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 8px;font-size:13px;color:#EF4444;font-weight:500;">⚠️ Please change your password after your first login.</p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;" align="center">
              <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:12px 32px;background-color:#4F46E5;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Sign In to Flashdesk</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                You received this because an administrator added you as an agent on ${escapeHtml(workspaceName)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = [
    `Welcome to ${workspaceName}!`,
    '',
    `Hi ${firstName}, you've been added as a support agent.`,
    '',
    'Your login credentials:',
    `  Email:    ${email}`,
    `  Password: ${password}`,
    '',
    'Please change your password after your first login.',
    '',
    `Sign in: ${loginUrl}`,
    '',
    `— ${workspaceName}`,
  ].join('\n');

  return { html, text };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { welcomeAgentTemplate };
