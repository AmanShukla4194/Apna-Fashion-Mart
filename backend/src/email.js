const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const FROM = process.env.SES_FROM_EMAIL || 'orders@apnafashionmart.com';

async function sendEmail({ to, subject, html }) {
  if (!to || !subject) return;
  try {
    await ses.send(new SendEmailCommand({
      Source: FROM,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: { Data: subject, Charset: 'UTF-8' },
        },
      },
    }));
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    // Never throw — email failure must not break the order
    console.error(`SES error (${to}):`, err.message);
  }
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-IN');
}

function statusLabel(status) {
  return { pending:'Pending', confirmed:'Confirmed', processing:'Processing',
           shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' }[status] || status;
}

function itemsTable(items = []) {
  if (!items.length) return '';
  const rows = items.map(it => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f3f6;font-size:13px;color:#334155">${it.product_name || it.name || '—'}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f3f6;text-align:center;font-size:13px;color:#334155">${it.quantity || 1}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f3f6;text-align:right;font-size:13px;font-weight:600;color:#001F3F">₹${fmt(it.unit_price || it.price)}</td>
    </tr>`).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600">Product</th>
          <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600">Qty</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function wrap(body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#001F3F;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center">
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:1px">Apna Fashion Mart</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px">apnafashionmart.com</div>
  </div>
  <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    ${body}
  </div>
  <div style="text-align:center;padding:20px 0;font-size:11px;color:#94a3b8">
    © Apna Fashion Mart &nbsp;·&nbsp;
    <a href="https://apnafashionmart.com" style="color:#FF1493;text-decoration:none">apnafashionmart.com</a>
  </div>
</div>
</body></html>`;
}

function infoBox(pairs) {
  const rows = pairs.map(([label, value]) => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f3f6">
      <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px">${label}</span>
      <span style="font-size:13px;font-weight:600;color:#001F3F">${value}</span>
    </div>`).join('');
  return `<div style="background:#f8f9fb;border-radius:12px;padding:16px 20px;margin-bottom:24px">${rows}</div>`;
}

function ctaButton(text, href, bg = '#001F3F') {
  return `<a href="${href}" style="display:block;margin-top:24px;background:${bg};color:#fff;text-align:center;
    padding:14px 20px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">${text}</a>`;
}

// ─── Emails ───────────────────────────────────────────────────────────────────

async function sendOrderConfirmedCustomer(order, customerEmail, items) {
  if (!customerEmail) return;
  const addr = order.shipping_address || {};
  const addrLine = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
  const payLabel = order.payment_method === 'razorpay' ? '✅ Paid Online' : '💵 Cash on Delivery';

  const html = wrap(`
    <div style="font-size:36px;text-align:center;margin-bottom:12px">🎉</div>
    <h2 style="margin:0 0 8px;text-align:center;color:#001F3F;font-size:20px">Order Placed!</h2>
    <p style="margin:0 0 24px;text-align:center;color:#64748b;font-size:14px;line-height:1.6">
      Hi ${addr.full_name || 'there'}, your order is confirmed and waiting for the seller to prepare it.
    </p>
    ${infoBox([
      ['Order ID', order.order_number],
      ['Payment', payLabel],
      ['Total', `<span style="color:#FF1493;font-size:15px">₹${fmt(order.total)}</span>`],
    ])}
    ${itemsTable(items)}
    ${addrLine ? `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;font-size:13px;color:#334155;line-height:1.5">
      <div style="font-weight:700;margin-bottom:4px;color:#001F3F">Delivering to</div>${addrLine}</div>` : ''}
    ${ctaButton('Track Your Order →', 'https://apnafashionmart.com/account')}
  `);

  await sendEmail({
    to: customerEmail,
    subject: `Order Placed — ${order.order_number} | Apna Fashion Mart`,
    html,
  });
}

async function sendNewOrderVendor(order, vendorEmail, items) {
  if (!vendorEmail) return;
  const addr = order.shipping_address || {};

  const html = wrap(`
    <div style="font-size:36px;text-align:center;margin-bottom:12px">🛍️</div>
    <h2 style="margin:0 0 8px;text-align:center;color:#001F3F;font-size:20px">New Order Received!</h2>
    <p style="margin:0 0 24px;text-align:center;color:#64748b;font-size:14px;line-height:1.6">
      Please confirm within 24 hours to keep your response rate high.
    </p>
    ${infoBox([
      ['Order ID', order.order_number],
      ['Customer', addr.full_name || '—'],
      ['City', addr.city || '—'],
      ['Total', `<span style="color:#FF1493;font-size:15px">₹${fmt(order.total)}</span>`],
    ])}
    ${itemsTable(items)}
    ${ctaButton('Confirm This Order →', 'https://apnafashionmart.com/vendor-dashboard', '#FF1493')}
  `);

  await sendEmail({
    to: vendorEmail,
    subject: `New Order ${order.order_number} — Action Required | Apna Fashion Mart`,
    html,
  });
}

async function sendStatusUpdateCustomer(order, customerEmail, newStatus) {
  if (!customerEmail) return;
  const msgMap = {
    confirmed: { emoji: '✅', title: 'Order Confirmed!',  msg: 'Great news! The seller has confirmed your order and is preparing it.' },
    shipped:   { emoji: '🚚', title: 'Order Shipped!',    msg: 'Your order is on its way! It should arrive soon.' },
    delivered: { emoji: '🎁', title: 'Order Delivered!',  msg: 'Your order has been delivered. We hope you love your purchase!' },
    cancelled: { emoji: '❌', title: 'Order Cancelled',   msg: 'Your order has been cancelled. Online payments will be refunded within 5–7 business days.' },
  };
  const { emoji, title, msg } = msgMap[newStatus] || { emoji: '📦', title: `Order ${statusLabel(newStatus)}`, msg: `Your order status has been updated to ${statusLabel(newStatus)}.` };

  const html = wrap(`
    <div style="font-size:36px;text-align:center;margin-bottom:12px">${emoji}</div>
    <h2 style="margin:0 0 8px;text-align:center;color:#001F3F;font-size:20px">${title}</h2>
    <p style="margin:0 0 24px;text-align:center;color:#64748b;font-size:14px;line-height:1.6">${msg}</p>
    ${infoBox([
      ['Order ID', order.order_number],
      ['Status', `<span style="color:#FF1493">${statusLabel(newStatus)}</span>`],
      ['Total', `₹${fmt(order.total)}`],
    ])}
    ${ctaButton('View Order Details →', 'https://apnafashionmart.com/account')}
  `);

  await sendEmail({
    to: customerEmail,
    subject: `${emoji} Order ${order.order_number} — ${statusLabel(newStatus)} | Apna Fashion Mart`,
    html,
  });
}

module.exports = { sendOrderConfirmedCustomer, sendNewOrderVendor, sendStatusUpdateCustomer };
