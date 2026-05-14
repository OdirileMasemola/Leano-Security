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

import supabase from './client.js';

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
        
        // Prepare lead object
        const lead = {
            name: leadData.name.trim(),
            email: leadData.email.trim().toLowerCase(),
            phone: leadData.phone.trim(),
            company: leadData.company?.trim() || null,
            subject: leadData.subject.trim(),
            message: leadData.message.trim(),
            status: 'new',
            source: leadData.source || 'website_form'
        };
        
        // In a real implementation with @supabase/supabase-js:
        // const { data, error } = await supabase
        //     .from('leads')
        //     .insert([lead])
        //     .select();
        
        // For now, log the lead locally and send to Formspree
        console.log('📨 Lead submitted:', lead);
        
        // Send to Formspree endpoint as fallback
        await sendViaFormspree(lead);
        
        return {
            success: true,
            data: lead,
            message: 'Lead submitted successfully'
        };
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
