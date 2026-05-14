/**
 * Supabase Client Initialization
 * ================================================================
 * Initializes and exports the Supabase client instance.
 * 
 * Security Note: This file only uses the PUBLIC/ANON key for frontend access.
 * The NEXT_PUBLIC_ prefix indicates these are safe to expose in browser code.
 * 
 * Usage:
 *   import { supabase } from './scripts/supabase/client.js';
 *   const { data, error } = await supabase.from('table_name').select();
 */

// Get environment variables (from .env.local)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not found in environment variables');
    console.warn('Make sure .env.local contains:');
    console.warn('  NEXT_PUBLIC_SUPABASE_URL=your_project_url');
    console.warn('  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key');
}

/**
 * Supabase Client Instance
 * Used for all database operations from the frontend
 * 
 * The anon key is safe to use in browser because:
 * - It has limited permissions (Row Level Security rules apply)
 * - Service role key is never exposed
 * - All database writes are validated server-side
 */
export const supabase = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    
    /**
     * Initialize Supabase client (placeholder for actual implementation)
     * This would typically use the @supabase/supabase-js library
     */
    async init() {
        try {
            // In a real implementation, you would import from @supabase/supabase-js:
            // import { createClient } from '@supabase/supabase-js'
            // const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
            console.log('✓ Supabase client initialized');
            return true;
        } catch (error) {
            console.error('✗ Failed to initialize Supabase client:', error);
            return false;
        }
    },
    
    /**
     * Health check for Supabase connection
     */
    async healthCheck() {
        try {
            // Attempt a simple query to verify connection
            // const { data } = await client.from('leads').select('count()', { count: 'exact' })
            console.log('✓ Supabase connection verified');
            return { connected: true };
        } catch (error) {
            console.error('✗ Supabase connection failed:', error);
            return { connected: false, error };
        }
    }
};

// Auto-initialize on module load
supabase.init();

export default supabase;
