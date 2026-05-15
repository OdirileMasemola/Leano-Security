/**
 * Admin Leads Management Module
 * ================================================================
 * Fetches live Supabase lead data and supports search, filtering,
 * urgency filtering, and status updates.
 */

import adminAuth from './admin-auth.js';
import {
    fetchLeads,
    getLeadQualityLabel,
    updateLeadStatus
} from '../../scripts/supabase/leads.js';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'qualified', 'rejected', 'converted'];
const URGENCY_OPTIONS = ['all', 'routine', 'urgent', 'emergency'];

const leadsManager = {
    leads: [],
    filteredLeads: [],
    currentFilter: 'all',
    currentUrgency: 'all',
    searchQuery: '',

    async init() {
        if (!(await adminAuth.requireAdminAccess())) {
            return;
        }

        this.setupEventListeners();
        await this.loadLeads();
    },

    async loadLeads() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.disabled = true;
        }

        try {
            const result = await fetchLeads({ limit: 1000 });
            if (!result.success) {
                throw new Error(result.error || 'Failed to load leads');
            }

            this.leads = result.data;
            this.applyFilters();
        } catch (error) {
            console.error('Lead load failed:', error);
            this.renderError(error.message || 'Unable to load leads');
        } finally {
            if (searchInput) {
                searchInput.disabled = false;
            }
        }
    },

    applyFilters() {
        const query = this.searchQuery.toLowerCase();

        this.filteredLeads = this.leads.filter((lead) => {
            const statusMatches = this.currentFilter === 'all' || lead.status === this.currentFilter;
            const urgencyMatches = this.currentUrgency === 'all' || String(lead.urgency || '').toLowerCase() === this.currentUrgency;
            const searchMatches = !query || [
                lead.full_name,
                lead.email,
                lead.phone,
                lead.company_name,
                lead.service_type
            ].join(' ').toLowerCase().includes(query);

            return statusMatches && urgencyMatches && searchMatches;
        });

        this.render();
    },

    async changeStatus(leadId, newStatus, previousStatus) {
        const statusSelect = document.querySelector(`.status-select[data-lead-id="${leadId}"]`);
        if (statusSelect) {
            statusSelect.disabled = true;
        }

        try {
            const result = await updateLeadStatus(leadId, newStatus, {
                adminUserId: adminAuth.getCurrentUser()?.id,
                previousStatus
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to update status');
            }

            await this.loadLeads();
        } catch (error) {
            console.error('Status update failed:', error);
            if (statusSelect) {
                statusSelect.value = previousStatus;
            }
        } finally {
            if (statusSelect) {
                statusSelect.disabled = false;
            }
        }
    },

    render() {
        const tbody = document.getElementById('leadsTableBody');
        if (!tbody) return;

        if (!this.filteredLeads.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;padding:2rem;color:#9aa2af;">No leads found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredLeads.map((lead) => {
            const quality = getLeadQualityLabel(lead.lead_score);
            return `
                <tr>
                    <td>
                        <div class="cell-name">${this.escapeHtml(lead.full_name || 'Unknown Lead')}</div>
                        <div class="cell-email">${this.escapeHtml(lead.source || 'website')}</div>
                    </td>
                    <td>${this.escapeHtml(lead.email || '')}</td>
                    <td>${this.escapeHtml(lead.phone || '')}</td>
                    <td>${this.escapeHtml(lead.company_name || 'N/A')}</td>
                    <td>${this.escapeHtml(lead.service_type || 'N/A')}</td>
                    <td>
                        <span class="urgency-pill urgency-${this.escapeHtml(String(lead.urgency || 'routine').toLowerCase())}">${this.formatLabel(lead.urgency || 'routine')}</span>
                    </td>
                    <td>
                        <select class="status-select" data-lead-id="${lead.id}" data-current-status="${this.escapeHtml(lead.status)}">
                            ${['new', 'contacted', 'qualified', 'rejected', 'converted'].map((status) => `<option value="${status}" ${lead.status === status ? 'selected' : ''}>${this.formatLabel(status)}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <span class="lead-score quality-${quality}">${lead.lead_score}</span>
                    </td>
                    <td>${this.formatDate(lead.created_at)}</td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.status-select').forEach((select) => {
            select.addEventListener('change', async (event) => {
                const leadId = event.target.dataset.leadId;
                const previousStatus = event.target.dataset.currentStatus;
                const newStatus = event.target.value;
                event.target.dataset.currentStatus = newStatus;
                await this.changeStatus(leadId, newStatus, previousStatus);
            });
        });
    },

    renderError(message) {
        const tbody = document.getElementById('leadsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:2rem;color:#d62839;">${this.escapeHtml(message)}</td>
            </tr>
        `;
    },

    setupEventListeners() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                this.searchQuery = event.target.value;
                this.applyFilters();
            });
        }

        document.querySelectorAll('[data-status]').forEach((button) => {
            button.addEventListener('click', (event) => {
                document.querySelectorAll('[data-status]').forEach((item) => item.classList.remove('active'));
                event.currentTarget.classList.add('active');
                this.currentFilter = event.currentTarget.dataset.status;
                this.applyFilters();
            });
        });

        const urgencyFilter = document.querySelector('[data-urgency-filter]');
        if (urgencyFilter) {
            urgencyFilter.addEventListener('change', (event) => {
                this.currentUrgency = event.target.value;
                this.applyFilters();
            });
        }

        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.loadLeads();
            });
        }

        const logoutButton = document.querySelector('[data-action="logout"]');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                const result = await adminAuth.logout();
                if (result.success) {
                    window.location.href = './login.html';
                }
            });
        }
    },

    formatDate(value) {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatLabel(value) {
        return String(value)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    },

    escapeHtml(value) {
        return String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
};

document.addEventListener('DOMContentLoaded', () => leadsManager.init());

export default leadsManager;
