import { useState } from 'react';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';
import { extractHotelSearchRows } from '@/lib/extractHotelSearchRows';

export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  roomQuantity?: number;
  currency?: string;
}

type HotelsSearchResponse = {
  data?: unknown[];
  error?: string;
  details?: string;
};

export const useHotelSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (params: HotelSearchParams) => {
    setLoading(true);
    setError(null);

    console.log('🏨 Frontend: Searching hotels with params:', params);

    try {
      const { data, error: invokeErr } = await invokeSupabaseFunction<HotelsSearchResponse>(
        'hotels-search',
        params as unknown as Record<string, unknown>,
      );

      if (invokeErr) {
        console.error('❌ invoke hotels-search:', invokeErr);
        throw new Error(invokeErr);
      }

      const payload = data;
      const p = payload as { error?: string; details?: string; data?: unknown } | null;
      if (p && typeof p.error === 'string' && !Array.isArray(p.data)) {
        console.error('❌ API error:', p.error, p.details);
        throw new Error(p.error + (p.details ? ': ' + p.details : ''));
      }

      const rows = extractHotelSearchRows(payload);
      console.log('✅ Hotel search successful:', rows.length, 'results');
      return { data: rows };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search hotels';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchHotels, loading, error };
};
