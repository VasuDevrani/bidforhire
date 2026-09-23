import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentAndActivate } from '@/lib/payment-verification';

/**
 * POST /api/checkout/callback
 * GET /api/checkout/callback
 *
 * Handler for Razorpay redirect flows (e.g. mobile UPI intent, Paytm, Netbanking, 3DS cards).
 * Razorpay submits an HTTP POST form with:
 *   - razorpay_payment_id
 *   - razorpay_order_id
 *   - razorpay_signature
 * Or in case of failure:
 *   - error[code]
 *   - error[description]
 *
 * This endpoint verifies the signature, activates the listing/unlock idempotently,
 * and issues a 303 redirect to the appropriate frontend success page.
 */
async function handleCallback(req: NextRequest) {
  const url = req.nextUrl;
  const flow = url.searchParams.get('flow');
  const candidateIdParam = url.searchParams.get('candidateId');

  let paymentId = url.searchParams.get('razorpay_payment_id') ?? '';
  let orderId = url.searchParams.get('razorpay_order_id') ?? '';
  let signature = url.searchParams.get('razorpay_signature') ?? '';
  let errorCode = url.searchParams.get('error[code]') ?? url.searchParams.get('errorCode') ?? '';
  let errorDescription =
    url.searchParams.get('error[description]') ??
    url.searchParams.get('errorDescription') ??
    '';

  // If this was an HTTP POST (standard Razorpay form submit)
  if (req.method === 'POST') {
    try {
      const formData = await req.formData();
      paymentId = (formData.get('razorpay_payment_id') as string) || paymentId;
      orderId = (formData.get('razorpay_order_id') as string) || orderId;
      signature = (formData.get('razorpay_signature') as string) || signature;
      errorCode = (formData.get('error[code]') as string) || errorCode;
      errorDescription =
        (formData.get('error[description]') as string) ||
        (formData.get('error[reason]') as string) ||
        errorDescription;
    } catch {
      // If formData parsing fails, try json as fallback
      try {
        const json = await req.json();
        paymentId = json.razorpay_payment_id || paymentId;
        orderId = json.razorpay_order_id || orderId;
        signature = json.razorpay_signature || signature;
        errorCode = json.error?.code || errorCode;
        errorDescription = json.error?.description || errorDescription;
      } catch {
        // Continue with whatever was in query parameters
      }
    }
  }

  // 1. Gateway reported an error / cancellation
  if (errorCode || errorDescription) {
    console.warn('[checkout/callback] Gateway reported error:', errorCode, errorDescription);
    const errorMsg = errorDescription || 'Payment was cancelled or failed.';
    return resolveErrorRedirect(req, flow, candidateIdParam, errorMsg);
  }

  // 2. Missing payment credentials
  if (!paymentId || !orderId || !signature) {
    console.warn('[checkout/callback] Missing payment parameters in callback');
    return resolveErrorRedirect(req, flow, candidateIdParam, 'Missing payment confirmation details.');
  }

  // 3. Verify payment signature and activate candidate/unlock
  const result = await verifyPaymentAndActivate({
    paymentId,
    orderId,
    signature,
  });

  if (!result.success) {
    console.error('[checkout/callback] Verification failed:', result.error);
    return resolveErrorRedirect(req, flow, candidateIdParam, result.error);
  }

  // 4. Resolve success redirect URL
  const candidateId = result.candidateId || candidateIdParam || '';
  let destination = '/';

  if (flow === 'boost' || result.type === 'rebid') {
    destination = candidateId ? `/candidate/${candidateId}?boosted=1` : '/';
  } else if (flow === 'unlock' || result.type === 'lifetime_access' || result.type === 'unlock') {
    destination = candidateId ? `/candidate/${candidateId}?unlocked=1` : '/';
  } else if (flow === 'submit' || result.type === 'bid') {
    destination = candidateId ? `/submit/success?candidateId=${candidateId}` : '/submit/success';
  } else {
    destination = candidateId ? `/candidate/${candidateId}` : '/';
  }

  // Use 303 See Other to ensure browser switches method from POST to GET
  return NextResponse.redirect(new URL(destination, req.url), 303);
}

function resolveErrorRedirect(
  req: NextRequest,
  flow: string | null,
  candidateId: string | null,
  errorMessage: string
) {
  const encMsg = encodeURIComponent(errorMessage);
  let dest = `/submit?error=${encMsg}`;

  if (flow === 'boost' && candidateId) {
    dest = `/candidate/${candidateId}?error=${encMsg}`;
  } else if (flow === 'unlock' && candidateId) {
    dest = `/candidate/${candidateId}?error=${encMsg}`;
  }

  return NextResponse.redirect(new URL(dest, req.url), 303);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}
