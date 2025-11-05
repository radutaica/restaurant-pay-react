// Item Table Relations API Types

export interface ItemTableRelationItem {
  id: number;
  name: string;
  price_cents: number;
  venue_id: number;
  created_at: string;
  updated_at: string;
}

// Response is an array of items directly
export type ItemTableRelationsResponse = ItemTableRelationItem[];

