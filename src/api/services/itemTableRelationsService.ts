// Item Table Relations Service

import { apiClient } from '../config/client';
import { API_ENDPOINTS } from '../config';
import { ItemTableRelationsResponse } from '../types/itemTableRelations';

export class ItemTableRelationsService {
  /**
   * Gets item table relations by table ID
   * GET /users/item_table_relations?table_id=123
   * Session token is automatically sent in X-Session-Token header
   * @param tableId - The table ID to fetch relations for
   * @returns Promise with array of items
   */
  static async getByTableId(tableId: number): Promise<ItemTableRelationsResponse> {
    try {
      const url = API_ENDPOINTS.ITEM_TABLE_RELATIONS.GET_BY_TABLE;
      const response = await apiClient.get<ItemTableRelationsResponse>(url, {
        params: { table_id: tableId },
      });
      return response;
    } catch (error) {
      console.error('Error fetching item table relations:', error);
      throw new Error('Failed to fetch item table relations. Please try again.');
    }
  }
}

