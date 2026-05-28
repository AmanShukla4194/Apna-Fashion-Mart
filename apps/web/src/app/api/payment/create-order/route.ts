import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  const { amount, receiptId } = await req.json();
  if (!amount || amount < 100) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  const order = await createOrder(amount, receiptId ?? `rcpt_${Date.now()}`);
  return NextResponse.json({ orderId: order.id, amount: order.amount });
}
