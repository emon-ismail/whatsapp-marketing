import { useState, useEffect, useCallback } from 'react';
import { messageService, moderatorService, phoneNumberService, supabase } from '../services/supabaseService';

// Generic hook for Supabase queries with loading, error, and data management
export const useSupabaseQuery = (queryFn, dependencies = [], options = {}) => {
  const [data, setData] = useState(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      console.error('Query error:', err);
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (options?.enabled !== false) {
      executeQuery();
    }
  }, [executeQuery, options?.enabled]);

  const refetch = () => {
    executeQuery();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Hook specifically for messages with filtering and pagination
export const useMessages = (filters = {}, page = 1, limit = 10) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await messageService?.getMessages(filters, page, limit);
      setMessages(result?.data || []);
      setTotalPages(result?.totalPages || 0);
      setTotalCount(result?.count || 0);
    } catch (err) {
      console.error('Messages fetch error:', err);
      setError(err?.message || 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const refetch = () => {
    fetchMessages();
  };

  return {
    messages,
    loading,
    error,
    totalPages,
    totalCount,
    refetch
  };
};

// Hook for message statistics
export const useMessageStats = () => {
  return useSupabaseQuery(
    () => messageService?.getMessageStats(),
    [],
    { initialData: { total: 0, pending: 0, sent: 0, delivered: 0, failed: 0, read: 0 } }
  );
};

// Hook for moderators
export const useModerators = (activeOnly = false) => {
  return useSupabaseQuery(
    () => moderatorService?.getModerators(activeOnly),
    [activeOnly],
    { initialData: [] }
  );
};

// Hook for phone numbers with filtering and pagination
export const usePhoneNumbers = (filters = {}, page = 1, limit = 10) => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPhoneNumbers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await phoneNumberService?.getPhoneNumbers(filters, page, limit);
      setPhoneNumbers(result?.data || []);
      setTotalPages(result?.totalPages || 0);
      setTotalCount(result?.count || 0);
    } catch (err) {
      console.error('Phone numbers fetch error:', err);
      setError(err?.message || 'Failed to fetch phone numbers');
      setPhoneNumbers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  const refetch = () => {
    fetchPhoneNumbers();
  };

  return {
    phoneNumbers,
    loading,
    error,
    totalPages,
    totalCount,
    refetch
  };
};

// Hook for real-time subscriptions
export const useSupabaseSubscription = (channelName, table, callback) => {
  useEffect(() => {
    if (!callback || !table) return;

    const channel = supabase?.channel(channelName)?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )?.subscribe();

    return () => {
      channel?.unsubscribe();
    };
  }, [channelName, table, callback]);
};

// Hook for mutations (create, update, delete operations)
export const useSupabaseMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (mutationFn) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn();
      return { success: true, data: result };
    } catch (err) {
      console.error('Mutation error:', err);
      const errorMessage = err?.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error,
    isLoading: loading
  };
};

export default {
  useSupabaseQuery,
  useMessages,
  useMessageStats,
  useModerators,
  usePhoneNumbers,
  useSupabaseSubscription,
  useSupabaseMutation
};