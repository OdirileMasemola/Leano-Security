/**
 * Supabase Lead Data Helpers
 * ================================================================
 * Shared helpers for inserting, querying, scoring, and updating leads.
 * This file is used by the public contact form and the admin dashboard.
 */

import { getSupabaseClient } from './client.js';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'rejected', 'converted'];
const LEAD_SELECT_COLUMNS = '*';

function normalizeText(value) {
    return String(value || '').trim();
}

function normalizeEmail(value) {
    return normalizeText(value).toLowerCase();
}

function normalizeServiceValue(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => normalizeText(item))
            .filter(Boolean)
            .join(', ');
    }

    return normalizeText(value);
}

function getLeadQuality(score) {
    if (score >= 61) return 'high';
    if (score >= 31) return 'medium';
    return 'low';
}

function calculateLeadScore(lead) {
    let score = 0;

    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.company_name) score += 10;
    if (lead.service_type) score += 15;

    const urgency = normalizeText(lead.urgency).toLowerCase();
    if (urgency === 'urgent') score += 20;
    if (urgency === 'emergency') score += 30;

    if (lead.service_type && lead.service_type.split(',').filter(Boolean).length > 1) {
        score += 10;
    }

    const message = normalizeText(lead.message).toLowerCase();
    if (message.includes('quote') || message.includes('consult')) score += 5;
    if (message.includes('now') || message.includes('asap') || message.includes('immediate')) {
        score += 10;
    }

    return Math.min(score, 100);
}

function normalizeLeadRow(row) {
    const leadScore = Number(row.lead_score ?? 0);
    const fullName = normalizeText(row.full_name || row.name);
    const companyName = normalizeText(row.company_name || row.company);
    const serviceType = normalizeText(row.service_type || row.subject);
    const urgency = normalizeText(row.urgency || 'routine') || 'routine';
    const status = normalizeText(row.status || 'new').toLowerCase();

    return {
        id: row.id,
        full_name: fullName,
        email: normalizeEmail(row.email),
        phone: normalizeText(row.phone),
        company_name: companyName,
        service_type: serviceType,
        urgency,
        status: LEAD_STATUSES.includes(status) ? status : 'new',
        lead_score: leadScore,
        lead_quality: getLeadQuality(leadScore),
        source: normalizeText(row.source || 'website'),
        message: normalizeText(row.message),
        created_at: row.created_at,
        updated_at: row.updated_at || null
    };
}

function matchesSearch(lead, query) {
    const searchTerm = normalizeText(query).toLowerCase();
    if (!searchTerm) return true;

    const searchableValue = [
        lead.full_name,
        lead.email,
        lead.phone,
        lead.company_name,
        lead.service_type
    ]
        .join(' ')
        .toLowerCase();

    return searchableValue.includes(searchTerm);
}

function applyLeadFilters(leads, options = {}) {
    const { search = '', status = 'all', urgency = 'all', highScoreOnly = false } = options;

    return leads.filter((lead) => {
        const statusMatches = status === 'all' || lead.status === status;
        const urgencyMatches = urgency === 'all' || normalizeText(lead.urgency).toLowerCase() === urgency;
        const searchMatches = matchesSearch(lead, search);
        const highScoreMatches = !highScoreOnly || lead.lead_score >= 61;

        return statusMatches && urgencyMatches && searchMatches && highScoreMatches;
    });
}

function sortLeadsNewestFirst(leads) {
    return [...leads].sort((left, right) => {
        const leftTime = new Date(left.created_at || 0).getTime();
        const rightTime = new Date(right.created_at || 0).getTime();
        return rightTime - leftTime;
    });
}

export function computeLeadStats(leads) {
    const summary = {
        totalLeads: leads.length,
        newLeads: 0,
        contactedLeads: 0,
        qualifiedLeads: 0,
        rejectedLeads: 0,
        convertedLeads: 0,
        lowQualityLeads: 0,
        mediumQualityLeads: 0,
        highQualityLeads: 0
    };

    leads.forEach((lead) => {
        const quality = getLeadQuality(lead.lead_score);

        if (lead.status === 'new') summary.newLeads += 1;
        if (lead.status === 'contacted') summary.contactedLeads += 1;
        if (lead.status === 'qualified') summary.qualifiedLeads += 1;
        if (lead.status === 'rejected') summary.rejectedLeads += 1;
        if (lead.status === 'converted') summary.convertedLeads += 1;

        if (quality === 'high') summary.highQualityLeads += 1;
        if (quality === 'medium') summary.mediumQualityLeads += 1;
        if (quality === 'low') summary.lowQualityLeads += 1;
    });

    return summary;
}

export async function submitLead(leadData) {
    try {
        const fullName = normalizeText(leadData.name || leadData.full_name);
        const email = normalizeEmail(leadData.email);
        const phone = normalizeText(leadData.phone);
        const companyName = normalizeText(leadData.company || leadData.company_name);
        const serviceType = normalizeServiceValue(leadData.services || leadData.service_type);
        const urgency = normalizeText(leadData.urgency || 'routine').toLowerCase() || 'routine';
        const message = normalizeText(leadData.message);

        if (!fullName || !email || !phone || !serviceType || !message) {
            throw new Error('Please complete all required fields before submitting.');
        }

        const lead = {
            full_name: fullName,
            email,
            phone,
            company_name: companyName || null,
            service_type: serviceType,
            urgency,
            message,
            status: 'new',
            source: normalizeText(leadData.source || 'website'),
            lead_score: calculateLeadScore({
                email,
                phone,
                company_name: companyName,
                service_type: serviceType,
                urgency,
                message
            })
        };

        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('leads')
            .insert([lead])
            .select(LEAD_SELECT_COLUMNS);

        if (error) {
            throw error;
        }

        return {
            success: true,
            data: Array.isArray(data) && data.length > 0 ? normalizeLeadRow(data[0]) : normalizeLeadRow(lead)
        };
    } catch (error) {
        console.error('Lead submission failed:', error);
        return {
            success: false,
            error: error.message || 'Failed to submit lead',
            data: null
        };
    }
}

export async function fetchLeads(options = {}) {
    try {
        const supabase = await getSupabaseClient();
        const limit = Number.isFinite(options.limit) ? options.limit : 1000;
        const { data, error } = await supabase
            .from('leads')
            .select(LEAD_SELECT_COLUMNS)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        const normalized = sortLeadsNewestFirst((data || []).map(normalizeLeadRow));
        const filtered = applyLeadFilters(normalized, options);

        return {
            success: true,
            data: filtered
        };
    } catch (error) {
        console.error('Fetch leads failed:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch leads',
            data: []
        };
    }
}

export async function fetchLeadSummary(options = {}) {
    const result = await fetchLeads({ ...options, limit: options.limit || 1000 });
    if (!result.success) {
        return result;
    }

    const leads = result.data;
    const stats = computeLeadStats(leads);
    const highScoreLeads = leads.filter((lead) => lead.lead_score >= 61).slice(0, 5);

    return {
        success: true,
        data: {
            stats,
            recentLeads: leads.slice(0, 5),
            highScoreLeads,
            allLeads: leads
        }
    };
}

export async function updateLeadStatus(leadId, status, options = {}) {
    try {
        const normalizedStatus = normalizeText(status).toLowerCase();
        if (!LEAD_STATUSES.includes(normalizedStatus)) {
            throw new Error(`Invalid status: ${status}`);
        }

        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('leads')
            .update({
                status: normalizedStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', leadId)
            .select(LEAD_SELECT_COLUMNS);

        if (error) {
            throw error;
        }

        const updatedLead = Array.isArray(data) && data.length > 0 ? normalizeLeadRow(data[0]) : null;

        if (options.adminUserId) {
            try {
                await supabase.from('lead_activities').insert([
                    {
                        lead_id: leadId,
                        admin_user_id: options.adminUserId,
                        activity_type: 'status_changed',
                        description: `Status changed to ${normalizedStatus}`,
                        metadata: {
                            previous_status: options.previousStatus || null,
                            new_status: normalizedStatus
                        }
                    }
                ]);
            } catch (activityError) {
                console.warn('Lead activity insert skipped:', activityError.message || activityError);
            }
        }

        return {
            success: true,
            data: updatedLead
        };
    } catch (error) {
        console.error('Update lead status failed:', error);
        return {
            success: false,
            error: error.message || 'Failed to update lead status',
            data: null
        };
    }
}

export function getLeadQualityLabel(score) {
    return getLeadQuality(Number(score) || 0);
}

export function getLeadQualityClass(score) {
    return getLeadQualityLabel(score);
}

export default {
    submitLead,
    fetchLeads,
    fetchLeadSummary,
    updateLeadStatus,
    computeLeadStats,
    getLeadQualityLabel,
    getLeadQualityClass
};
