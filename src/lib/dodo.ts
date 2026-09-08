import DodoPayments from 'dodopayments';

let _client: DodoPayments | null = null;

/** Lazy singleton — only instantiated when first called from a request handler. */
export function getDodoClient(): DodoPayments {
  if (!_client) {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      throw new Error('DODO_PAYMENTS_API_KEY environment variable is not set');
    }
    _client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: (process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode') as 'test_mode' | 'live_mode',
    });
  }
  return _client;
}