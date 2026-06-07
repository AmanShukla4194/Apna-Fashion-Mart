const crypto = require('crypto');
const Razorpay = require('razorpay');
const { ok, error } = require('../response');

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function handle(ctx) {
  const { method, path, body } = ctx;

  // POST /razorpay/create-order — create Razorpay order before payment
  if (method === 'POST' && path.endsWith('/razorpay/create-order')) {
    return createOrder(body);
  }

  // POST /razorpay/verify — verify payment signature after payment
  if (method === 'POST' && path.endsWith('/razorpay/verify')) {
    return verifyPayment(body);
  }

  return error(404, 'Not found');
}

async function createOrder(body) {
  const { amount, currency = 'INR', receipt } = body;
  if (!amount || amount < 100) return error(400, 'amount must be at least 100 paise (₹1)');

  try {
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: Math.round(amount), // in paise
      currency,
      receipt: receipt || `afm_${Date.now()}`,
    });
    return ok({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    return error(500, 'Failed to create payment order');
  }
}

async function verifyPayment(body) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return error(400, 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required');
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const generated = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated !== razorpay_signature) {
    return error(400, 'Payment verification failed — invalid signature');
  }

  return ok({ verified: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
}

module.exports = { handle };
