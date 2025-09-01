import { supabase } from '../lib/supabase';

export const assignNumbersToModerators = async () => {
  try {
    // Get all moderators
    const { data: moderators, error: moderatorError } = await supabase
      .from('moderators')
      .select('id, name')
      .eq('status', 'active');

    if (moderatorError) throw moderatorError;

    // Get unassigned numbers
    const { data: unassignedNumbers, error: numbersError } = await supabase
      .from('phone_numbers')
      .select('*')
      .is('assigned_moderator', null)
      .eq('status', 'pending');

    if (numbersError) throw numbersError;

    if (!moderators.length || !unassignedNumbers.length) {
      return { success: true, message: 'No assignment needed' };
    }

    // Distribute numbers evenly among moderators
    const assignments = [];
    unassignedNumbers.forEach((number, index) => {
      const moderatorIndex = index % moderators.length;
      assignments.push({
        id: number.id,
        assigned_moderator: moderators[moderatorIndex].id,
        assigned_at: new Date().toISOString()
      });
    });

    // Update assignments in batches
    for (const assignment of assignments) {
      const { error } = await supabase
        .from('phone_numbers')
        .update({
          assigned_moderator: assignment.assigned_moderator,
          assigned_at: assignment.assigned_at
        })
        .eq('id', assignment.id);

      if (error) throw error;
    }

    return { 
      success: true, 
      message: `Assigned ${assignments.length} numbers to ${moderators.length} moderators` 
    };
  } catch (error) {
    console.error('Error assigning numbers:', error);
    return { success: false, error: error.message };
  }
};

export const getDailyAssignments = async (moderatorId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('assigned_moderator', moderatorId)
      .eq('status', 'pending')
      .gte('assigned_at', `${today}T00:00:00`)
      .lte('assigned_at', `${today}T23:59:59`)
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching daily assignments:', error);
    return { success: false, error: error.message };
  }
};