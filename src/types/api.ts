export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CANCELLED';

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  external_id?: string | null;
  description?: string | null;
  qr_code?: string;
  copy_paste?: string;
  expires_at?: string;
  paid_at?: string;
  created_at: string;
}

export interface PaymentsListResponse {
  data: Payment[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CreatePaymentPayload {
  amount: number;
  currency: string;
  external_id?: string;
  description?: string;
  expires_in_seconds?: number;
}

export interface FxQuote {
  quote_id: string;
  source_currency: string;
  target_currency: string;
  source_amount: number;
  target_amount: number;
  rate: string;
  expires_at: string;
  created_at: string;
}

export interface CreateFxQuotePayload {
  source_currency: string;
  target_currency: string;
  amount: number;
}

export interface BalanceRow {
  currency: string;
  available: number;
  pending: number;
}

export interface BalancesResponse {
  balances: BalanceRow[];
}

export interface ApiErrorEnvelope {
  error?: {
    code: number;
    name: string;
    message: string;
    details?: Record<string, unknown>;
  };
  message?: string;
}
