// Google Analytics 4 integration helper
// PLACEHOLDER: Replace 'G-XXXXXXXXXX' with your real Measurement ID.
// Do NOT hardcode a real ID here in source control — update at deploy time.

(function(){
  // Configure this value during deploy or by the SEO manager
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <-- replace with actual ID

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf('G-') !== 0) {
    // No valid ID configured — do nothing.
    console.info('GA4 not configured. Set GA_MEASUREMENT_ID in scripts/integrations/google-analytics.js');
    return;
  }

  // Load gtag.js
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

})();
