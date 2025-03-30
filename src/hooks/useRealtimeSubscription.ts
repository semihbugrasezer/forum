import { useEffect } from 'react';
import { createClientComponentClient } from '@/utils/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type DatabaseChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE';

type SubscriptionCallback<T extends Record<string, any>> = (payload: RealtimePostgresChangesPayload<T>) => void;

export function useRealtimeSubscription<T extends Record<string, any>>(
  table: string,
  event: DatabaseChangesEvent,
  callback: SubscriptionCallback<T>,
  filterColumn?: string,
  filterValue?: string
) {
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const channel = supabase
      .channel(`db-changes-${table}-${event}`)
      .on<T>(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          ...(filterColumn && filterValue
            ? { filter: `${filterColumn}=eq.${filterValue}` }
            : {}),
        },
        (payload) => {
          callback(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to changes');
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, callback, filterColumn, filterValue, supabase]);
} 