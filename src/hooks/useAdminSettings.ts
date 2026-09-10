import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAdminSettings = () => {
  const [loading, setLoading] = useState(false);

  const getSetting = async (key: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-settings-get', {
        body: { key },
      });

      if (error) throw error;
      return data?.data;
    } catch (error: any) {
      console.error('Error fetching admin setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-settings-update', {
        body: { key, value },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error updating admin setting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const purgeDemoReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reviews-purge-demo');

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Purged ${data.count} demo reviews`,
      });

      return data;
    } catch (error: any) {
      console.error('Error purging demo reviews:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to purge demo reviews',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getSetting,
    updateSetting,
    purgeDemoReviews,
  };
};
