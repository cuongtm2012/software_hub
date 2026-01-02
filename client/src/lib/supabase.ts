import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qqhiyyihqencnjapagne.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaGl5eWlocWVuY25qYXBhZ25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzc0NDIsImV4cCI6MjA4MjkxMzQ0Mn0.vTed5GRJ7Wcm1u4KT6Mdy6NpH9EyDz8ztqUqMsEQ1T0';

// Client-side Supabase client with anon key
// This is safe to use in the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        flowType: 'pkce'
    }
});
