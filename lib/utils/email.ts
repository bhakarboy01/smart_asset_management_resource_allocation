/**
 * Email notification service using Nodemailer with Gmail SMTP (free).
 * Configure SMTP_* env vars to enable. Falls back silently if not configured.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(opts: EmailOptions): Promise<boolean> {
  // Only attempt if SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return false;
  }

  try {
    // Keep SMTP support optional so deployments without nodemailer still build cleanly.
    const loadModule = new Function("specifier", "return import(specifier)");
    const nodemailer = (await loadModule("nodemailer").catch(() => null)) as
      | { default: { createTransport: (options: unknown) => { sendMail: (options: unknown) => Promise<void> } } }
      | null;
    if (!nodemailer) return false;

    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Sampadaa <${process.env.SMTP_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sampadaa</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background:#1e293b;padding:24px 32px;display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;background:#f97316;border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <span style="color:white;font-size:18px;">📦</span>
      </div>
      <div>
        <div style="color:white;font-weight:700;font-size:18px;">Sampadaa</div>
        <div style="color:#94a3b8;font-size:12px;">IIT Roorkee Cultural Council</div>
      </div>
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        This is an automated message from Sampadaa Asset Management Platform.<br/>
        IIT Roorkee · Cultural Council
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendBookingApprovedEmail(opts: {
  to: string;
  userName: string;
  assetName: string;
  fromDate: string;
  toDate: string;
  adminNotes?: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `✅ Booking Approved — ${opts.assetName} | Sampadaa`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Booking Approved!</h2>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${opts.userName}, your booking request has been approved.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#64748b;font-size:14px;width:40%;">Asset</td><td style="color:#1e293b;font-weight:600;font-size:14px;">${opts.assetName}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;font-size:14px;">From</td><td style="color:#1e293b;font-weight:600;font-size:14px;">${opts.fromDate}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Return By</td><td style="color:#1e293b;font-weight:600;font-size:14px;">${opts.toDate}</td></tr>
          ${opts.adminNotes ? `<tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Admin Note</td><td style="color:#1e293b;font-size:14px;">${opts.adminNotes}</td></tr>` : ""}
        </table>
      </div>
      <p style="color:#64748b;font-size:14px;">Please collect the asset from the Cultural Council office. Remember to return it by the due date.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" style="display:inline-block;background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">View My Bookings</a>
    `),
  });
}

export async function sendBookingRejectedEmail(opts: {
  to: string;
  userName: string;
  assetName: string;
  rejectionReason?: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `❌ Booking Request Rejected — ${opts.assetName} | Sampadaa`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Booking Not Approved</h2>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${opts.userName}, unfortunately your booking request could not be approved.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#991b1b;font-weight:600;">Asset: ${opts.assetName}</p>
        ${opts.rejectionReason ? `<p style="margin:0;color:#7f1d1d;font-size:14px;">Reason: ${opts.rejectionReason}</p>` : ""}
      </div>
      <p style="color:#64748b;font-size:14px;">You can browse other available assets and submit a new request.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/assets" style="display:inline-block;background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">Browse Assets</a>
    `),
  });
}

export async function sendOverdueReminderEmail(opts: {
  to: string;
  userName: string;
  assetName: string;
  dueDate: string;
  daysOverdue: number;
}) {
  return sendEmail({
    to: opts.to,
    subject: `⚠️ Overdue Return — ${opts.assetName} | Sampadaa`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#dc2626;font-size:22px;">Asset Return Overdue</h2>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${opts.userName}, you have an overdue asset that needs to be returned immediately.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-weight:600;color:#1e293b;">${opts.assetName}</p>
        <p style="margin:0 0 4px;color:#64748b;font-size:14px;">Was due: ${opts.dueDate}</p>
        <p style="margin:0;color:#dc2626;font-size:14px;font-weight:600;">${opts.daysOverdue} day(s) overdue</p>
      </div>
      <p style="color:#64748b;font-size:14px;">Please return the asset to the Cultural Council office as soon as possible to avoid any penalties.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" style="display:inline-block;background:#dc2626;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">View My Bookings</a>
    `),
  });
}

export async function sendDueSoonReminderEmail(opts: {
  to: string;
  userName: string;
  assetName: string;
  dueDate: string;
  daysLeft: number;
}) {
  return sendEmail({
    to: opts.to,
    subject: `⏰ Return Reminder — ${opts.assetName} due in ${opts.daysLeft} day(s) | Sampadaa`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Return Reminder</h2>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${opts.userName}, this is a reminder that you have an asset due for return soon.</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-weight:600;color:#1e293b;">${opts.assetName}</p>
        <p style="margin:0 0 4px;color:#64748b;font-size:14px;">Due date: ${opts.dueDate}</p>
        <p style="margin:0;color:#c2410c;font-size:14px;font-weight:600;">${opts.daysLeft} day(s) remaining</p>
      </div>
      <p style="color:#64748b;font-size:14px;">Please ensure you return the asset on time. Contact the Cultural Council office if you need an extension.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" style="display:inline-block;background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">View My Bookings</a>
    `),
  });
}
