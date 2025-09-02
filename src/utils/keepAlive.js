import { supabase } from '../lib/supabase';

// Keep Supabase project active by pinging every 6 days
export const startKeepAlive = () => {
  const pingDatabase = async () => {
    try {
      await supabase.from('moderators').select('id').limit(1);
      console.log('Database pinged successfully');
    } catch (error) {
      console.error('Keep alive ping failed:', error);
    }
  };

  // Ping immediately
  pingDatabase();
  
  // Ping every 6 days (518400000 ms)
  setInterval(pingDatabase, 6 * 24 * 60 * 60 * 1000);
};