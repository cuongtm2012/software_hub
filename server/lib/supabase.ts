import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Server-side Supabase client with service role key
// This has admin privileges and should only be used on the server
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Helper function to get user from Supabase by JWT token
export async function getUserFromToken(token: string) {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return null;
    }

    return user;
}

// Helper function to verify if a token is valid
export async function verifySupabaseToken(token: string): Promise<boolean> {
    try {
        const user = await getUserFromToken(token);
        return !!user;
    } catch {
        return false;
    }
}
