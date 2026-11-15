import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://oitrftvfbxcfwcvbqmje.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdHJmdHZmYnhjZndjdmJxbWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2Njg5MTIsImV4cCI6MjExMDI0NDkxMn0.juqHntZ7Y_3SfcDIw4fDjbnGhEnIZ1gog2VDfcM7YMw';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-safe fallback to new Frankfurt project
if (!supabaseUrl || supabaseUrl.includes('xfwaborsrhavnltjbtfc') || supabaseUrl.includes('sklzlzijgydxkovblerp')) {
  supabaseUrl = DEFAULT_URL;
  supabaseAnonKey = DEFAULT_ANON_KEY;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
