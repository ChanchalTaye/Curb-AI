/**
 * Content Script — injected into every page.
 *
 * Responsibilities:
 * - Detect page focus/blur events
 * - Capture scroll depth
 * - Render warning overlays on command from the Service Worker
 */

// --- Focus/Blur Tracking ---
document.addEventListener('visibilitychange', () => {
    chrome.runtime.sendMessage({
        event_category: 'page_engagement',
        event_type: document.hidden ? 'page_blur' : 'page_focus',
        event_timestamp: new Date().toISOString(),
        payload: {
            url: window.location.href,
            domain: window.location.hostname,
        },
    });
});

// --- Scroll Depth Tracking ---
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );
    if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
    }
});

// Report scroll depth when leaving the page
window.addEventListener('beforeunload', () => {
    if (maxScrollDepth > 0) {
        chrome.runtime.sendMessage({
            event_category: 'page_engagement',
            event_type: 'scroll_depth',
            event_timestamp: new Date().toISOString(),
            payload: {
                url: window.location.href,
                domain: window.location.hostname,
                max_scroll_percent: maxScrollDepth,
            },
        });
    }
});

// --- Warning Overlay (from Service Worker) ---
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type === 'SHOW_WARNING') {
        displayWarningOverlay(request.message);
    }
});

function displayWarningOverlay(message) {
    // Remove existing overlay if present
    const existing = document.getElementById('curbai-warning-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'curbai-warning-overlay';
    overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 2147483647;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: #1a1a2e;
        border: 1px solid #e94560;
        padding: 40px;
        border-radius: 12px;
        max-width: 480px;
        text-align: center;
        box-shadow: 0 0 40px rgba(233, 69, 96, 0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="color: #e94560; margin: 0 0 16px 0; font-size: 22px;">Security Alert</h2>
        <p style="color: #eee; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">${message}</p>
        <button id="curbai-dismiss-warning" style="
          padding: 10px 32px;
          background: #e94560;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">I Understand</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    document.getElementById('curbai-dismiss-warning').addEventListener('click', () => {
        overlay.remove();
    });
}
