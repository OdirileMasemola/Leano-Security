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

// Hardcoded public values (safe to expose) — replace if you prefer a config file
const SUPABASE_URL = 'https://ahmfwpuyhgrnruklnovh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GR12qKnhDhLGz_dbas61xg_9AFfUHqA';

let client = null;

async function initSupabase() {
    if (client) return client;
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
        const { createClient } = mod;
        client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase client created');
        return client;
    } catch (err) {
        console.error('✗ Failed to load Supabase client:', err);
        throw err;
    }
}

export async function getSupabaseClient() {
    return await initSupabase();
}

// default export for compatibility
export default {
    getSupabaseClient
};
