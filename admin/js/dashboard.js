/**
 * Admin Dashboard Module
 * ================================================================
 * Handles dashboard initialization and data display
 * 
 * This is a PLACEHOLDER for future implementation.
 */

import adminAuth from './admin-auth.js';

const dashboard = {
    stats: {
        totalLeads: 0,
        newLeads: 0,
        contacted: 0,
        converted: 0
    },

    /**
     * Initialize dashboard
     */
    async init() {
        console.log('📊 Initializing admin dashboard...');
        
        // Check authentication
        if (!adminAuth.checkAuth()) {
            console.warn('⚠️ User not authenticated, redirecting to login...');
            window.location.href = '/admin/login.html';
            return;
        }

        // Load dashboard data
        await this.loadStats();
        await this.loadRecentLeads();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✓ Dashboard loaded successfully');
    },

    /**
     * Load dashboard statistics
     */
    async loadStats() {
        try {
            console.log('Loading dashboard statistics...');
            
            // In production, fetch from Supabase:
            // const { data: leads } = await supabase
            //     .from('leads')
            //     .select('status');
            
            // Placeholder data
            this.stats = {
                totalLeads: 24,
                newLeads: 8,
                contacted: 12,
                converted: 4
            };

            this.updateStatsDisplay();
        } catch (error) {
            console.error('❌ Error loading stats:', error);
        }
    },

    /**
     * Update stats in UI
     */
    updateStatsDisplay() {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length === 0) return;

        const stats = [
            { label: 'Total Leads', value: this.stats.totalLeads },
            { label: 'New Leads', value: this.stats.newLeads },
            { label: 'Contacted', value: this.stats.contacted },
            { label: 'Converted', value: this.stats.converted }
        ];

        statCards.forEach((card, index) => {
            if (stats[index]) {
                const valueEl = card.querySelector('.stat-value');
                const labelEl = card.querySelector('.stat-label');
                if (valueEl) valueEl.textContent = stats[index].value;
                if (labelEl) labelEl.textContent = stats[index].label;
            }
        });
    },

    /**
     * Load recent leads
     */
    async loadRecentLeads() {
        try {
            console.log('Loading recent leads...');
            
            // In production, fetch from Supabase:
            // const { data: leads } = await supabase
            //     .from('leads')
            //     .select('*')
            //     .order('created_at', { ascending: false })
            //     .limit(10);

            // Placeholder data
            const leads = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    subject: 'Security Consultation',
                    status: 'new',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    subject: 'Penetration Testing',
                    status: 'contacted',
                    created_at: new Date().toISOString()
                }
            ];

            this.displayLeads(leads);
        } catch (error) {
            console.error('❌ Error loading leads:', error);
        }
    },

    /**
     * Display leads in table
     */
    displayLeads(leads) {
        const tbody = document.querySelector('.leads-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lead.name}</td>
                <td>${lead.email}</td>
                <td>${lead.subject}</td>
                <td>
                    <span class="badge badge-${lead.status}">
                        ${lead.status}
                    </span>
                </td>
                <td>
                    <button class="btn-sm" onclick="dashboard.editLead(${lead.id})">Edit</button>
                    <button class="btn-sm btn-danger" onclick="dashboard.deleteLead(${lead.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * Edit lead (placeholder)
     */
    editLead(leadId) {
        console.log('Editing lead:', leadId);
        // In production, open edit modal or navigate to edit page
    },

    /**
     * Delete lead (placeholder)
     */
    deleteLead(leadId) {
        if (confirm('Are you sure you want to delete this lead?')) {
            console.log('Deleting lead:', leadId);
            // In production, call deleteLead from leads.js
        }
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Refresh button
        const refreshBtn = document.querySelector('[data-action="refresh"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadStats());
        }
    },

    /**
     * Logout and redirect to login
     */
    async logout() {
        const result = await adminAuth.logout();
        if (result.success) {
            window.location.href = '/admin/login.html';
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => dashboard.init());

export default dashboard;
