// Google Tag Manager integration helper
// PLACEHOLDER: Replace 'GTM-XXXXXXX' with your real GTM container ID.
// The SEO / Marketing manager should paste the real container ID here.

(function(){
  var GTM_ID = 'GTM-XXXXXXX'; // <-- Replace with real container ID during deployment

  if (!GTM_ID || GTM_ID.indexOf('GTM-') !== 0) {
    console.info('GTM not configured. Set GTM_ID in scripts/integrations/google-tag-manager.js');
    return;
  }

  // Insert GTM script into head (standard snippet)
  var headScript = document.createElement('script');
  headScript.innerHTML = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'? '&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" + GTM_ID + "');";
  document.head.appendChild(headScript);

  // Also ensure noscript portion is present after body open — insert if missing
  if (document.body) {
    var exists = document.getElementById('gtm-noscript-insert');
    if (!exists) {
      var nos = document.createElement('div');
      nos.id = 'gtm-noscript-insert';
      nos.innerHTML = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' + GTM_ID + '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>';
      document.body.insertBefore(nos, document.body.firstChild);
    }
  }

})();
