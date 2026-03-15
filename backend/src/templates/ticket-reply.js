/**
 * HTML email template for agent reply to a ticket.
 *
 * @param {Object} data
 * @param {string} data.ticketPrefix   - e.g. "TKT"
 * @param {number} data.ticketNumber   - e.g. 42
 * @param {string} data.subject        - ticket subject
 * @param {string} data.agentName      - replying agent's name
 * @param {string} data.replyContent   - plain-text reply
 * @param {string} [data.replyHtml]    - rich HTML reply (preferred)
 * @param {string} data.portalUrl      - link to view the ticket
 * @param {string} data.workspaceName  - workspace display name
 * @returns {{ html: string, text: string }}
 */
function ticketReplyTemplate(data) {
  const {
    ticketPrefix,
    ticketNumber,
    subject,
    agentName,
    replyContent,
    replyHtml,
    portalUrl,
    workspaceName,
  } = data;

  const ticketRef = `${ticketPrefix}-${ticketNumber}`;
  const bodyHtml = replyHtml ? sanitizeHtml(replyHtml) : escapeHtml(replyContent).replace(/\n/g, '<br>');

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
          <!-- Subject -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(ticketRef)}</p>
              <h2 style="margin:4px 0 0;font-size:18px;color:#111827;">${escapeHtml(subject)}</h2>
            </td>
          </tr>
          <!-- Reply Body -->
          <tr>
            <td style="padding:16px 32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${escapeHtml(agentName)} replied:</p>
              <div style="padding:16px;background-color:#f9fafb;border-radius:6px;border-left:3px solid #4F46E5;font-size:14px;color:#374151;line-height:1.6;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:16px 32px 32px;" align="center">
              <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background-color:#4F46E5;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">View Ticket</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                You are receiving this because you are associated with ${escapeHtml(ticketRef)}.
                Reply to this email to respond directly.
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
    `[${ticketRef}] ${subject}`,
    '',
    `${agentName} replied:`,
    '',
    stripHtml(replyHtml || replyContent),
    '',
    `View ticket: ${portalUrl}`,
    '',
    `— ${workspaceName}`,
  ].join('\n');

  return { html, text };
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sanitize HTML — strip dangerous tags/attributes, keep safe formatting.
 */
function sanitizeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(["']).*?\1/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/href\s*=\s*(["'])\s*javascript:.*?\1/gi, 'href="#"')
    .replace(/src\s*=\s*(["'])\s*javascript:.*?\1/gi, 'src=""')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(?:iframe|object|embed|form|input|textarea|button)[^>]*>/gi, '');
}

/**
 * Strip all HTML tags for plain-text version.
 */
function stripHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { ticketReplyTemplate };
