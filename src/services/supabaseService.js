import { supabase } from '../lib/supabase';

// Export supabase client for other modules
export { supabase };

// ==================== MESSAGE OPERATIONS ====================

export const messageService = {
  // Get all messages with pagination and filters
  async getMessages(filters = {}, page = 1, limit = 10) {
    try {
      let query = supabase?.from('messages')?.select(`
          *,
          moderator:moderators!moderator_id(id, name, email),
          phone_number:phone_numbers!phone_number_id(id, phone_number, has_whatsapp, status)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }
      
      if (filters?.moderator && filters?.moderator !== 'all') {
        query = query?.eq('moderator_id', filters?.moderator);
      }

      if (filters?.dateFrom) {
        query = query?.gte('created_at', filters?.dateFrom);
      }

      if (filters?.dateTo) {
        query = query?.lte('created_at', filters?.dateTo);
      }

      if (filters?.search) {
        query = query?.or(`message_content.ilike.%${filters?.search}%,error_message.ilike.%${filters?.search}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query?.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return { 
        data: data || [], 
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Message service error:', error);
      throw error;
    }
  },

  // Get message by ID with full details
  async getMessageById(id) {
    try {
      const { data, error } = await supabase?.from('messages')?.select(`
          *,
          moderator:moderators!moderator_id(id, name, email),
          phone_number:phone_numbers!phone_number_id(id, phone_number, has_whatsapp, status)
        `)?.eq('id', id)?.single();

      if (error) {
        console.error('Error fetching message:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Message service error:', error);
      throw error;
    }
  },

  // Create new message
  async createMessage(messageData) {
    try {
      const { data, error } = await supabase?.from('messages')?.insert([messageData])?.select(`
          *,
          moderator:moderators!moderator_id(id, name, email),
          phone_number:phone_numbers!phone_number_id(id, phone_number, has_whatsapp, status)
        `)?.single();

      if (error) {
        console.error('Error creating message:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Message service error:', error);
      throw error;
    }
  },

  // Update message status
  async updateMessage(id, updates) {
    try {
      const { data, error } = await supabase?.from('messages')?.update(updates)?.eq('id', id)?.select(`
          *,
          moderator:moderators!moderator_id(id, name, email),
          phone_number:phone_numbers!phone_number_id(id, phone_number, has_whatsapp, status)
        `)?.single();

      if (error) {
        console.error('Error updating message:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Message service error:', error);
      throw error;
    }
  },

  // Get message statistics
  async getMessageStats() {
    try {
      const { data, error } = await supabase?.from('messages')?.select('status');

      if (error) {
        console.error('Error fetching message stats:', error);
        throw error;
      }

      // Calculate status counts
      const statusCounts = (data || [])?.reduce((acc, message) => {
        const status = message?.status || 'pending';
        acc[status] = (acc?.[status] || 0) + 1;
        return acc;
      }, {
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        read: 0
      });

      return {
        total: data?.length || 0,
        ...statusCounts
      };
    } catch (error) {
      console.error('Message stats service error:', error);
      throw error;
    }
  }
};

// ==================== MODERATOR OPERATIONS ====================

export const moderatorService = {
  // Get all moderators
  async getModerators(activeOnly = false) {
    try {
      let query = supabase?.from('moderators')?.select('*')?.order('name', { ascending: true });

      if (activeOnly) {
        query = query?.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching moderators:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Moderator service error:', error);
      throw error;
    }
  },

  // Get moderator by ID
  async getModeratorById(id) {
    try {
      const { data, error } = await supabase?.from('moderators')?.select('*')?.eq('id', id)?.single();

      if (error) {
        console.error('Error fetching moderator:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Moderator service error:', error);
      throw error;
    }
  },

  // Create new moderator
  async createModerator(moderatorData) {
    try {
      const { data, error } = await supabase?.from('moderators')?.insert([moderatorData])?.select('*')?.single();

      if (error) {
        console.error('Error creating moderator:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Moderator service error:', error);
      throw error;
    }
  },

  // Update moderator
  async updateModerator(id, updates) {
    try {
      const { data, error } = await supabase?.from('moderators')?.update(updates)?.eq('id', id)?.select('*')?.single();

      if (error) {
        console.error('Error updating moderator:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Moderator service error:', error);
      throw error;
    }
  }
};

// ==================== PHONE NUMBER OPERATIONS ====================

export const phoneNumberService = {
  // Get all phone numbers with pagination and filters
  async getPhoneNumbers(filters = {}, page = 1, limit = 10) {
    try {
      let query = supabase?.from('phone_numbers')?.select(`
          *,
          assigned_moderator:moderators!assigned_to(id, name, email)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.hasWhatsApp !== undefined) {
        query = query?.eq('has_whatsapp', filters?.hasWhatsApp);
      }

      if (filters?.assigned_to && filters?.assigned_to !== 'all') {
        query = query?.eq('assigned_to', filters?.assigned_to);
      }

      if (filters?.search) {
        query = query?.ilike('phone_number', `%${filters?.search}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query?.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching phone numbers:', error);
        throw error;
      }

      return { 
        data: data || [], 
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Phone number service error:', error);
      throw error;
    }
  },

  // Create new phone number
  async createPhoneNumber(phoneNumberData) {
    try {
      const { data, error } = await supabase?.from('phone_numbers')?.insert([phoneNumberData])?.select(`
          *,
          assigned_moderator:moderators!assigned_to(id, name, email)
        `)?.single();

      if (error) {
        console.error('Error creating phone number:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Phone number service error:', error);
      throw error;
    }
  },

  // Update phone number
  async updatePhoneNumber(id, updates) {
    try {
      const { data, error } = await supabase?.from('phone_numbers')?.update(updates)?.eq('id', id)?.select(`
          *,
          assigned_moderator:moderators!assigned_to(id, name, email)
        `)?.single();

      if (error) {
        console.error('Error updating phone number:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Phone number service error:', error);
      throw error;
    }
  },

  // Bulk create phone numbers
  async bulkCreatePhoneNumbers(phoneNumbersData) {
    try {
      const { data, error } = await supabase?.from('phone_numbers')?.insert(phoneNumbersData)?.select(`
          *,
          assigned_moderator:moderators!assigned_to(id, name, email)
        `);

      if (error) {
        console.error('Error bulk creating phone numbers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Phone number service error:', error);
      throw error;
    }
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscriptionService = {
  // Subscribe to message changes
  subscribeToMessages(callback) {
    return supabase?.channel('messages')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        callback
      )?.subscribe();
  },

  // Subscribe to phone number changes
  subscribeToPhoneNumbers(callback) {
    return supabase?.channel('phone_numbers')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'phone_numbers' },
        callback
      )?.subscribe();
  },

  // Subscribe to moderator changes
  subscribeToModerators(callback) {
    return supabase?.channel('moderators')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moderators' },
        callback
      )?.subscribe();
  },

  // Unsubscribe from all channels
  unsubscribeAll() {
    return supabase?.removeAllChannels();
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const utilityService = {
  // Format phone number for display
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber?.toString()?.replace(/\D/g, '');
    
    // Format as international number if it looks like one
    if (cleaned?.length >= 10) {
      const countryCode = cleaned?.slice(0, -10);
      const areaCode = cleaned?.slice(-10, -7);
      const firstPart = cleaned?.slice(-7, -4);
      const lastPart = cleaned?.slice(-4);
      
      if (countryCode) {
        return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
      } else {
        return `(${areaCode}) ${firstPart}-${lastPart}`;
      }
    }
    
    return phoneNumber;
  },

  // Get message status color
  getStatusColor(status) {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      read: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return statusColors?.[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  // Generate retry schedule
  generateRetrySchedule(attempt) {
    const delays = [1, 5, 15, 30, 60]; // minutes
    return delays?.[Math.min(attempt - 1, delays?.length - 1)] || 60;
  }
};

export default {
  message: messageService,
  moderator: moderatorService,
  phoneNumber: phoneNumberService,
  subscription: subscriptionService,
  utility: utilityService
};