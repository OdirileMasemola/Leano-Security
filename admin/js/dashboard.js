/**
 * Admin Dashboard Module
 * ================================================================
 * Loads live Supabase lead data and visitor tracking, calculates
 * summary stats, and lets the admin update lead status directly
 * from the dashboard.
 */

import adminAuth from './admin-auth.js';
import {
    fetchLeadSummary,
    getLeadQualityLabel,
    updateLeadStatus
} from '../../scripts/supabase/leads.js';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'rejected', 'converted'];

const dashboard = {
    stats: {
        totalLeads: 0,
        newLeads: 0,
        contactedLeads: 0,
        qualifiedLeads: 0,
        rejectedLeads: 0,
        convertedLeads: 0,
        highScoreLeads: 0,
        totalSiteVisits: 0,
        uniqueVisitors: 0
    },
    recentLeads: [],
    highScoreLeads: [],

    async init() {
        if (!(await adminAuth.requireAdminAccess())) {
            return;
        }

        await this.loadDashboardData();
        this.setupEventListeners();
    },

    async loadDashboardData() {
        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.disabled = true;
        }

        try {
            // Fetch leads and visitor data in parallel
            const leadResult = await fetchLeadSummary({ limit: 1000 });
            const visitsResult = await this.fetchSiteVisits();

            if (!leadResult.success) {
                throw new Error(leadResult.error || 'Failed to load dashboard data');
            }

            const { stats, recentLeads, highScoreLeads } = leadResult.data;
            this.stats = { ...stats };
            this.recentLeads = recentLeads;
            this.highScoreLeads = highScoreLeads;

            // Add visitor stats
            if (visitsResult.success) {
                this.stats.totalSiteVisits = visitsResult.data.totalVisits;
                this.stats.uniqueVisitors = visitsResult.data.uniqueVisitors;
            } else {
                console.warn('Could not load visitor data:', visitsResult.error);
                this.stats.totalSiteVisits = 0;
                this.stats.uniqueVisitors = 0;
            }

            this.renderStats();
            this.renderLeadTable('recentLeadsBody', this.recentLeads, true);
            this.renderLeadTable('highScoreLeadsBody', this.highScoreLeads, false);
            this.renderMetaInfo();
        } catch (error) {
            console.error('Dashboard load failed:', error);
            this.renderLoadError(error.message || 'Unable to load dashboard data');
        } finally {
            if (refreshButton) {
                refreshButton.disabled = false;
            }
        }
    },

    /**
     * Fetch site visits from Supabase
     * Returns total visits count and unique visitor count
     */
    async fetchSiteVisits() {
        try {
            const { getSupabaseClient } = await import('../../scripts/supabase/client.js');
            const supabase = await getSupabaseClient();

            // Fetch all site visits
            const { data, error } = await supabase
                .from('site_visits')
                .select('id, visitor_id', { count: 'exact' });

            if (error) {
                throw error;
            }

            const totalVisits = data ? data.length : 0;

            // Count unique visitor IDs
            const uniqueVisitors = data && data.length > 0
                ? new Set(data.map(v => v.visitor_id)).size
                : 0;

            return {
                success: true,
                data: {
                    totalVisits,
                    uniqueVisitors
                }
            };
        } catch (error) {
            console.error('Failed to fetch site visits:', error);
            return {
                success: false,
                error: error.message || 'Unable to fetch visitor data',
                data: null
            };
        }
    },

    renderStats() {
        const statsMap = {
            totalLeads: this.stats.totalLeads,
            newLeads: this.stats.newLeads,
            contactedLeads: this.stats.contactedLeads,
            qualifiedLeads: this.stats.qualifiedLeads,
            rejectedLeads: this.stats.rejectedLeads,
            convertedLeads: this.stats.convertedLeads,
            highScoreLeads: this.stats.highScoreLeads,
            totalSiteVisits: this.stats.totalSiteVisits,
            uniqueVisitors: this.stats.uniqueVisitors
        };

        document.querySelectorAll('[data-stat-key]').forEach((card) => {
            const key = card.dataset.statKey;
            const valueElement = card.querySelector('.stat-value');
            if (valueElement && Object.prototype.hasOwnProperty.call(statsMap, key)) {
                valueElement.textContent = String(statsMap[key]);
            }
        });
    },

    renderLeadTable(tbodyId, leads, includeCompany) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        const columnCount = includeCompany ? 7 : 6;

        if (!leads.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${columnCount}" style="text-align:center;padding:2rem;color:#9aa2af;">No leads found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = leads.map((lead) => {
            const scoreLabel = getLeadQualityLabel(lead.lead_score);
            const companyCell = includeCompany
                ? `<td>${this.escapeHtml(lead.company_name || 'N/A')}</td>`
                : '';

            return `
                <tr>
                    <td>
                        <div class="cell-name">${this.escapeHtml(lead.full_name || 'Unknown Lead')}</div>
                        <div class="cell-email">${this.escapeHtml(lead.source || 'website')}</div>
                    </td>
                    <td>${this.escapeHtml(lead.email || '')}</td>
                    ${companyCell}
                    <td>${this.escapeHtml(lead.service_type || '')}</td>
                    <td>
                        <span class="lead-score quality-${scoreLabel}">${lead.lead_score}</span>
                    </td>
                    <td>
                        <select class="status-select" data-lead-id="${lead.id}" data-current-status="${this.escapeHtml(lead.status)}">
                            ${STATUS_OPTIONS.map((status) => `<option value="${status}" ${lead.status === status ? 'selected' : ''}>${this.formatStatusLabel(status)}</option>`).join('')}
                        </select>
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

                event.target.disabled = true;
                const result = await updateLeadStatus(leadId, newStatus, {
                    adminUserId: adminAuth.getCurrentUser()?.id,
                    previousStatus
                });

                if (!result.success) {
                    event.target.value = previousStatus;
                    console.error(result.error || 'Unable to update lead status');
                } else {
                    event.target.dataset.currentStatus = newStatus;
                    await this.loadDashboardData();
                }

                event.target.disabled = false;
            });
        });
    },

    renderMetaInfo() {
        const recentUpdated = document.querySelector('[data-dashboard-updated]');
        if (recentUpdated) {
            recentUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    },

    renderLoadError(message) {
        const recentBody = document.getElementById('recentLeadsBody');
        const highScoreBody = document.getElementById('highScoreLeadsBody');
        const recentErrorHtml = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;color:#d62839;">${this.escapeHtml(message)}</td>
            </tr>
        `;
        const highScoreErrorHtml = `
            <tr>
                <td colspan="6" style="text-align:center;padding:2rem;color:#d62839;">${this.escapeHtml(message)}</td>
            </tr>
        `;

        if (recentBody) recentBody.innerHTML = recentErrorHtml;
        if (highScoreBody) highScoreBody.innerHTML = highScoreErrorHtml;
    },

    setupEventListeners() {
        const logoutButton = document.querySelector('[data-action="logout"]');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                await this.logout();
            });
        }

        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.loadDashboardData();
            });
        }

        // Hamburger menu toggle
        const hamburgerBtn = document.querySelector('[data-action="toggle-sidebar"]');
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking on a nav link
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeSidebar();
            });
        });

        // Close sidebar when clicking outside (on mobile)
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.admin-sidebar');
            const hamburger = document.querySelector('[data-action="toggle-sidebar"]');
            if (sidebar && hamburger && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                if (sidebar.classList.contains('open')) {
                    this.closeSidebar();
                }
            }
        });
    },

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const container = document.querySelector('.admin-container');
        if (sidebar) {
            sidebar.classList.toggle('open');
            container?.classList.toggle('sidebar-open');
        }
    },

    closeSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const container = document.querySelector('.admin-container');
        if (sidebar) {
            sidebar.classList.remove('open');
            container?.classList.remove('sidebar-open');
        }
    },

    async logout() {
        const result = await adminAuth.logout();
        if (result.success) {
            window.location.href = './login.html';
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

    formatStatusLabel(status) {
        return String(status)
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

document.addEventListener('DOMContentLoaded', () => dashboard.init());

export default dashboard;
