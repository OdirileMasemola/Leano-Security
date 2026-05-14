/**
 * Admin Leads Management Module
 * ================================================================
 * Handles leads list, filtering, editing, and bulk operations
 * 
 * This is a PLACEHOLDER for future implementation.
 */

import adminAuth from './admin-auth.js';

const leadsManager = {
    leads: [],
    filteredLeads: [],
    currentFilter: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',

    /**
     * Initialize leads manager
     */
    async init() {
        console.log('📋 Initializing leads manager...');
        
        if (!adminAuth.checkAuth()) {
            window.location.href = '/admin/login.html';
            return;
        }

        await this.loadLeads();
        this.setupEventListeners();
        this.render();
    },

    /**
     * Load leads from Supabase
     */
    async loadLeads() {
        try {
            console.log('Loading leads from Supabase...');
            
            // In production:
            // const { data } = await supabase
            //     .from('leads')
            //     .select('*')
            //     .order('created_at', { ascending: false });
            
            // Placeholder data
            this.leads = [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+27123456789',
                    company: 'Tech Corp',
                    subject: 'Security Consultation',
                    message: 'Interested in your services',
                    status: 'new',
                    source: 'website_form',
                    created_at: '2024-01-15T10:30:00Z'
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '+27987654321',
                    company: 'Finance Inc',
                    subject: 'Penetration Testing',
                    message: 'Request for pentest quote',
                    status: 'contacted',
                    source: 'website_form',
                    created_at: '2024-01-14T14:20:00Z'
                },
                {
                    id: '3',
                    name: 'Bob Wilson',
                    email: 'bob@example.com',
                    phone: '+27456789012',
                    company: null,
                    subject: 'General Inquiry',
                    message: 'Want to learn more',
                    status: 'new',
                    source: 'website_form',
                    created_at: '2024-01-13T09:15:00Z'
                }
            ];

            this.filteredLeads = [...this.leads];
            console.log(`✓ Loaded ${this.leads.length} leads`);
        } catch (error) {
            console.error('❌ Error loading leads:', error);
        }
    },

    /**
     * Filter leads by status
     */
    filterByStatus(status) {
        this.currentFilter = status;
        if (status === 'all') {
            this.filteredLeads = [...this.leads];
        } else {
            this.filteredLeads = this.leads.filter(l => l.status === status);
        }
        this.render();
    },

    /**
     * Search leads
     */
    search(query) {
        const q = query.toLowerCase();
        this.filteredLeads = this.leads.filter(l =>
            l.name.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            (l.company && l.company.toLowerCase().includes(q))
        );
        this.render();
    },

    /**
     * Sort leads
     */
    sort(field) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'desc';
        }

        this.filteredLeads.sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.render();
    },

    /**
     * Update lead status
     */
    async updateStatus(leadId, newStatus) {
        try {
            const lead = this.leads.find(l => l.id === leadId);
            if (!lead) throw new Error('Lead not found');

            // In production:
            // const { error } = await supabase
            //     .from('leads')
            //     .update({ status: newStatus })
            //     .eq('id', leadId);

            lead.status = newStatus;
            this.filteredLeads = this.filteredLeads.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            );

            this.render();
            console.log(`✓ Lead ${leadId} status updated to ${newStatus}`);
        } catch (error) {
            console.error('❌ Error updating status:', error);
        }
    },

    /**
     * Delete lead
     */
    async deleteLead(leadId) {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            // In production:
            // const { error } = await supabase
            //     .from('leads')
            //     .delete()
            //     .eq('id', leadId);

            this.leads = this.leads.filter(l => l.id !== leadId);
            this.filteredLeads = this.filteredLeads.filter(l => l.id !== leadId);
            this.render();
            console.log(`✓ Lead ${leadId} deleted`);
        } catch (error) {
            console.error('❌ Error deleting lead:', error);
        }
    },

    /**
     * Render leads table
     */
    render() {
        const tbody = document.querySelector('.leads-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredLeads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#999;">No leads found</td></tr>';
            return;
        }

        this.filteredLeads.forEach(lead => {
            const row = document.createElement('tr');
            const dateStr = new Date(lead.created_at).toLocaleDateString();

            row.innerHTML = `
                <td><strong>${lead.name}</strong></td>
                <td>${lead.email}</td>
                <td>${lead.phone}</td>
                <td>${lead.subject}</td>
                <td>
                    <select class="status-select" data-lead-id="${lead.id}">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
                    </select>
                </td>
                <td>
                    <button class="btn-delete" data-lead-id="${lead.id}" title="Delete">🗑️</button>
                </td>
            `;

            // Add event listeners
            const statusSelect = row.querySelector('.status-select');
            statusSelect.addEventListener('change', (e) => {
                this.updateStatus(lead.id, e.target.value);
            });

            const deleteBtn = row.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => {
                this.deleteLead(lead.id);
            });

            tbody.appendChild(row);
        });
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterByStatus(e.target.dataset.status);
            });
        });

        // Search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });
        }

        // Sort headers
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                this.sort(header.dataset.sort);
            });
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => leadsManager.init());

export default leadsManager;
