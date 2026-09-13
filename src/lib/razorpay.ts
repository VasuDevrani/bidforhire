import Razorpay from 'razorpay';

let _client: Razorpay | null = null;

/** Lazy singleton — only instantiated when first called from a request handler. */
export function getRazorpayClient(): Razorpay {
  if (!_client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables must be set');
    }
    _client = new Razorpay({ key_id, key_secret });
  }
  return _client;
}