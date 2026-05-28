import Razorpay from 'razorpay';
import crypto from 'crypto';

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({ key_id, key_secret });
}

export async function createOrder(amountInPaise: number, receiptId: string) {
  return getRazorpay().orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expected === signature;
}
