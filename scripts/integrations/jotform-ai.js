// Jotform AI integration helper
// PLACEHOLDER: Paste your Jotform embed script into the HTML container
// or set JOTFORM_EMBED_SRC to the embed script src string and set JOTFORM_OPTIONS.

/* Usage instructions for SEO/Dev:
   - Option A (recommended): Paste the full Jotform embed <script> snippet into the
     public page where indicated (search for PASTE_JOTFORM_AI_EMBED_CODE_HERE).

   - Option B: Set the JOTFORM_EMBED_SRC variable below and this file will load it.
     Example:
       window.JOTFORM_EMBED_SRC = 'https://cdn.jotfor.ms/agent/embedjs/YOUR_EMBED_ID/embed.js?autoOpenChatIn=0';

   Note: Keep autoOpenChatIn=0 to prevent auto-opening.
*/

(function(){
  var container = document.getElementById('jotform-ai-widget-container');
  if (!container) return;

  // If the SEO manager set a global embed src, load it dynamically.
  if (window.JOTFORM_EMBED_SRC && typeof window.JOTFORM_EMBED_SRC === 'string') {
    var s = document.createElement('script');
    s.src = window.JOTFORM_EMBED_SRC;
    s.async = true;
    container.appendChild(s);
    return;
  }

  // Otherwise leave the container empty — the placeholder in HTML is intentional.
  console.info('Jotform AI not auto-loaded. Paste embed code into HTML or set window.JOTFORM_EMBED_SRC');

})();
