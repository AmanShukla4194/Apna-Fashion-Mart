'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'orders@apnafashionmart.com';

export async function sendOrderConfirmation(opts: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
}) {
  const itemRows = opts.items
    .map((i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td></tr>`)
    .join('');

  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Order confirmed — #${opts.orderId} | Apna Fashion Mart`,
    html: `
      <div style="font-family:Poppins,sans-serif;max-width:560px;margin:0 auto;color:#1B2230">
        <div style="background:#001F3F;padding:32px;text-align:center">
          <img src="https://apnafashionmart.com/afm-logo.webp" alt="Apna Fashion Mart" style="height:48px"/>
        </div>
        <div style="padding:32px">
          <h2 style="color:#001F3F">Hi ${opts.customerName}, your order is confirmed!</h2>
          <p>Order <strong>#${opts.orderId}</strong> has been placed successfully.</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <thead><tr style="background:#F1F3F6"><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>${itemRows}</tbody>
            <tfoot><tr><td colspan="2"><strong>Total</strong></td><td><strong>₹${opts.total}</strong></td></tr></tfoot>
          </table>
          <a href="https://apnafashionmart.com/account" style="background:#FF1493;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Track your order</a>
        </div>
        <div style="padding:24px;background:#F8F9FB;font-size:12px;color:#6B7280;text-align:center">
          Apna Fashion Mart · Mumbai · legal@latticeteams.com
        </div>
      </div>
    `,
  });
}

export async function sendVendorOrderAlert(opts: {
  to: string;
  shopName: string;
  orderId: string;
  items: { name: string; qty: number }[];
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `New order received — #${opts.orderId} | ${opts.shopName}`,
    html: `
      <div style="font-family:Poppins,sans-serif;max-width:560px;margin:0 auto">
        <h2>New order for ${opts.shopName}</h2>
        <p>Order <strong>#${opts.orderId}</strong></p>
        <ul>${opts.items.map((i) => `<li>${i.qty}× ${i.name}</li>`).join('')}</ul>
        <a href="https://apnafashionmart.com/vendor-dashboard">View in dashboard →</a>
      </div>
    `,
  });
}
