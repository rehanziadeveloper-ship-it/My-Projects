import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tppeqpvrpxbujdbtwlbl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGVxcHZycHhidWpkYnR3bGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNjg2NTgsImV4cCI6MjExMDg0NDY1OH0.9JZU1gQC4Tg7Onob6MYQ7ROib6ELbySM0HRvl0vOo8M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
