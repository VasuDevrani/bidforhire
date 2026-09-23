import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentAndActivate } from '@/lib/payment-verification';

/**
 * POST /api/checkout/verify
 *
 * Called by the client immediately after the Razorpay checkout modal reports
 * success. Verifies the payment signature, fetches the order from Razorpay
 * to read the canonical metadata (type, candidateId, etc.), then activates
 * the candidate / creates the unlock record.
 *
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *
 * The order notes set during /api/checkout/{bid|unlock|rebid} are the
 * authoritative source of metadata — we never trust client-supplied candidateId
 * for the activation step.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    const result = await verifyPaymentAndActivate({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate,
      type: result.type,
      candidateId: result.candidateId,
    });
  } catch (err) {
    console.error('[checkout/verify] Error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}