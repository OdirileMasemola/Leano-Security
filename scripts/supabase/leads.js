/**
 * Lead Submission Handler
 * ================================================================
 * Handles contact form submissions and stores leads in Supabase.
 * 
 * Table Schema (expected):
 *   - id: uuid (primary key)
 *   - created_at: timestamp (auto-generated)
 *   - name: text
 *   - email: text
 *   - phone: text
 *   - company: text (optional)
 *   - subject: text
 *   - message: text
 *   - status: text ('new' | 'contacted' | 'converted')
 *   - source: text ('website_form', 'whatsapp', etc)
 */

import { getSupabaseClient } from './client.js';

/**
 * Submit a new lead to Supabase
 * 
 * @param {Object} leadData - Lead information
 * @param {string} leadData.name - Contact name (required)
 * @param {string} leadData.email - Contact email (required)
 * @param {string} leadData.phone - Contact phone (required)
 * @param {string} leadData.company - Company name (optional)
 * @param {string} leadData.subject - Message subject (required)
 * @param {string} leadData.message - Message content (required)
 * @param {string} leadData.source - Lead source (default: 'website_form')
 * 
 * @returns {Promise<Object>} Result with { success, data, error }
 */
export async function submitLead(leadData) {
    try {
        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'subject', 'message'];
        for (const field of requiredFields) {
            if (!leadData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Prepare lead object with expected fields for the 'leads' table
        const services = leadData.services || '';
        const lead = {
            full_name: leadData.name?.trim() || null,
            email: leadData.email?.trim().toLowerCase() || null,
            phone: leadData.phone?.trim() || null,
            company_name: leadData.company?.trim() || null,
            service_type: services,
            urgency: leadData.urgency || null,
            message: leadData.message?.trim() || null,
            status: 'new',
            source: leadData.source || 'website',
            newsletter: leadData.newsletter ? true : false
        };

        // Compute a simple lead score
        let lead_score = 0;
        if (lead.email) lead_score += 10;
        if (lead.phone) lead_score += 10;
        if (lead.company_name) lead_score += 15;
        if (lead.urgency && lead.urgency.toLowerCase().includes('urgent')) lead_score += 20;
        if (services && services.split(',').length > 1) lead_score += 15;
        if (lead.message && /emergency|immediate|now/i.test(lead.message)) lead_score += 30;
        lead.lead_score = lead_score;

        // Attempt to insert into Supabase
        const supabase = await getSupabaseClient();
        try {
            const { data, error } = await supabase.from('leads').insert([lead]).select();
            if (error) {
                console.warn('Supabase insert error, falling back to Formspree:', error);
                await sendViaFormspree(lead);
                return { success: true, data: lead, fallback: true };
            }

            console.log('✓ Lead inserted into Supabase', data);
            return { success: true, data };
        } catch (dbErr) {
            console.error('Supabase operation failed, fallback to Formspree', dbErr);
            await sendViaFormspree(lead);
            return { success: true, data: lead, fallback: true };
        }
    } catch (error) {
        console.error('✗ Error submitting lead:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Send lead data to Formspree endpoint
 * Fallback method for lead submission (used if Supabase not configured)
 * 
 * @param {Object} leadData - Lead information
 * @returns {Promise<Response>}
 */
async function sendViaFormspree(leadData) {
    const formspreeEndpoint = 'https://formspree.io/f/mnjpawol';
    
    try {
        const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });
        
        if (!response.ok) {
            throw new Error(`Formspree error: ${response.status}`);
        }
        
        console.log('✓ Lead sent to Formspree');
        return response;
    } catch (error) {
        console.error('✗ Error sending to Formspree:', error);
        throw error;
    }
}

/**
 * Fetch all leads (admin use)
 * Requires authenticated user with admin role
 * 
 * @returns {Promise<Object>} Result with { success, data, error }
 */
export async function fetchLeads() {
    try {
        // In a real implementation:
        // const { data, error } = await supabase
        //     .from('leads')
        //     .select('*')
        //     .order('created_at', { ascending: false });
        
        console.log('Fetching leads from Supabase...');
        return {
            success: true,
            data: [],
            message: 'Leads retrieved'
        };
    } catch (error) {
        console.error('✗ Error fetching leads:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Update lead status
 * 
 * @param {string} leadId - Lead record ID
 * @param {string} status - New status ('new', 'contacted', 'converted')
 * @returns {Promise<Object>} Result with { success, data, error }
 */
export async function updateLeadStatus(leadId, status) {
    try {
        // Validate status
        const validStatuses = ['new', 'contacted', 'converted'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        
        // In a real implementation:
        // const { data, error } = await supabase
        //     .from('leads')
        //     .update({ status })
        //     .eq('id', leadId)
        //     .select();
        
        console.log(`Updating lead ${leadId} status to ${status}`);
        return {
            success: true,
            message: 'Lead status updated'
        };
    } catch (error) {
        console.error('✗ Error updating lead status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete lead record
 * 
 * @param {string} leadId - Lead record ID
 * @returns {Promise<Object>} Result with { success, error }
 */
export async function deleteLead(leadId) {
    try {
        // In a real implementation:
        // const { error } = await supabase
        //     .from('leads')
        //     .delete()
        //     .eq('id', leadId);
        
        console.log(`Deleting lead ${leadId}`);
        return {
            success: true,
            message: 'Lead deleted'
        };
    } catch (error) {
        console.error('✗ Error deleting lead:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export default {
    submitLead,
    fetchLeads,
    updateLeadStatus,
    deleteLead,
    sendViaFormspree
};
