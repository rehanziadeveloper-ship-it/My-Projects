import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cbprlgdplrgctprgubap.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicHJsZ2RwbHJnY3Rwcmd1YmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Njc2MDksImV4cCI6MjEwOTI0MzYwOX0.aDZRoi6KFvYT9VE2WechPrVEhJxRh9VBR7QJoZJtoVk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
