// Bill Session API Types

export interface Bill {
  id: number;
  status: number;
  subtotal_cents: number;
  tax_cents: number;
  fees_cents: number;
  tip_cents: number;
  total_cents: number;
  paid_cents?: number;
  remaining_cents?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  currency: string;
}

export interface SessionInfo {
  created_at: string;
  expires_at: string;
}

export interface BillSessionResponse {
  session_token: string;
  bill: Bill;
  table: Table;
  venue: Venue;
  session_info: SessionInfo;
}

export interface UpdateTipRequest {
  tip_cents: number;
}

export interface UpdateTipResponse {
  bill: Bill;
}

