import { getSupabaseClient } from './client.js';

const STORAGE_KEY = 'leano_visitor_id';

function getVisitorId() {
    let visitorId = localStorage.getItem(STORAGE_KEY);

    if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

        try {
            localStorage.setItem(STORAGE_KEY, visitorId);
        } catch {
            return visitorId;
        }
    }

    return visitorId;
}

function isAdminPage() {
    return window.location.pathname.toLowerCase().includes('admin');
}

async function trackPageVisit() {
    if (isAdminPage()) return;

    try {
        const supabase = await getSupabaseClient();

        const visit = {
            page_path: window.location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            visitor_id: getVisitorId()
        };

        const { error } = await supabase
            .from('site_visits')
            .insert([visit]);

        if (error) {
            console.warn('Visit tracking failed:', error.message);
        }
    } catch (error) {
        console.warn('Visit tracking skipped:', error.message);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageVisit);
} else {
    trackPageVisit();
}

export { trackPageVisit, getVisitorId };