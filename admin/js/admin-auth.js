/**
 * Admin Authentication Module
 * ================================================================
 * Uses Supabase Auth plus the admin_profiles table to protect the
 * admin area with real login checks.
 */

import { getSupabaseClient } from '../../scripts/supabase/client.js';

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function profileMatchesUser(profile, user) {
    if (!profile || !user) return false;

    const userEmail = normalizeEmail(user.email);
    const profileEmail = normalizeEmail(
        profile.email || profile.admin_email || profile.user_email || profile.login_email
    );

    const profileUserId = String(
        profile.user_id ||
        profile.auth_user_id ||
        profile.auth_id ||
        profile.supabase_user_id ||
        ''
    );

    return profileEmail === userEmail || profileUserId === user.id;
}

const adminAuth = {
    client: null,
    currentUser: null,
    currentProfile: null,

    async getClient() {
        if (!this.client) {
            this.client = await getSupabaseClient();
        }
        return this.client;
    },

    async getSession() {
        const client = await this.getClient();
        const { data, error } = await client.auth.getSession();

        if (error) {
            throw error;
        }

        return data.session || null;
    },

    async getAdminProfile(user) {
        const client = await this.getClient();
        const { data, error } = await client
            .from('admin_profiles')
            .select('*');

        if (error) {
            throw error;
        }

        const profile = Array.isArray(data)
            ? data.find((row) => profileMatchesUser(row, user))
            : null;

        return profile || null;
    },

    async refreshCurrentAdmin() {
        const session = await this.getSession();

        if (!session?.user) {
            this.currentUser = null;
            this.currentProfile = null;
            return null;
        }

        const profile = await this.getAdminProfile(session.user);
        if (!profile) {
            this.currentUser = null;
            this.currentProfile = null;
            return null;
        }

        this.currentUser = session.user;
        this.currentProfile = profile;
        return { session, user: session.user, profile };
    },

    async login(email, password) {
        try {
            const cleanEmail = normalizeEmail(email);
            if (!cleanEmail || !password) {
                throw new Error('Email and password are required');
            }

            const client = await this.getClient();
            const { data, error } = await client.auth.signInWithPassword({
                email: cleanEmail,
                password
            });

            if (error || !data?.user) {
                throw new Error('Invalid email or password. Please try again.');
            }

            const profile = await this.getAdminProfile(data.user);
            if (!profile) {
                await client.auth.signOut();
                this.currentUser = null;
                this.currentProfile = null;
                throw new Error('Access denied. This account is not registered as an admin.');
            }

            this.currentUser = data.user;
            this.currentProfile = profile;

            return {
                success: true,
                user: data.user,
                profile
            };
        } catch (error) {
            console.error('Admin login failed:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    },

    async logout() {
        try {
            const client = await this.getClient();
            const { error } = await client.auth.signOut();

            if (error) {
                throw error;
            }

            this.currentUser = null;
            this.currentProfile = null;

            return { success: true };
        } catch (error) {
            console.error('Admin logout failed:', error);
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }
    },

    async requireAdminAccess() {
        try {
            const adminState = await this.refreshCurrentAdmin();
            if (!adminState) {
                await this.logout().catch(() => {});
                window.location.href = './login.html';
                return false;
            }

            return true;
        } catch (error) {
            console.error('Admin access check failed:', error);
            await this.logout().catch(() => {});
            window.location.href = './login.html';
            return false;
        }
    },

    checkAuth() {
        return Boolean(this.currentUser && this.currentProfile);
    },

    getCurrentUser() {
        return this.currentUser;
    },

    getCurrentProfile() {
        return this.currentProfile;
    }
};

export default adminAuth;
