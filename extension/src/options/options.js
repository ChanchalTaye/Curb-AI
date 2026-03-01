/**
 * Options page script — handles backend URL and registration key setup.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load existing config
    const config = await chrome.storage.local.get(['backendUrl', 'deviceId']);

    if (config.backendUrl) {
        document.getElementById('backend-url').value = config.backendUrl;
    }

    if (config.deviceId) {
        document.getElementById('status-section').style.display = 'block';
        document.getElementById('device-id-display').textContent = config.deviceId.substring(0, 12) + '...';
        document.getElementById('backend-display').textContent = config.backendUrl || 'http://localhost:8001';
        document.getElementById('reg-key').placeholder = '••••••••';

        // Test connection
        testConnection(config.backendUrl || 'http://localhost:8001');
    }

    // Save handler
    document.getElementById('save-btn').addEventListener('click', async () => {
        const backendUrl = document.getElementById('backend-url').value.trim();
        const regKey = document.getElementById('reg-key').value.trim();

        if (!backendUrl) {
            alert('Backend URL is required. Use http://localhost:8001 for local development.');
            return;
        }

        // Quick sanity check
        if (backendUrl.includes('youtube') || backendUrl.includes('google.com') || backendUrl.includes('facebook')) {
            alert('⚠️ This should be YOUR backend server URL (e.g. http://localhost:8001), not a website you want to monitor!');
            return;
        }

        // Store backend URL
        await chrome.storage.local.set({ backendUrl });

        // Generate device ID if not already registered or if a new key is provided
        const existing = await chrome.storage.local.get(['deviceId']);
        if (!existing.deviceId || regKey) {
            const deviceId = crypto.randomUUID();
            await chrome.storage.local.set({ deviceId });
        }

        // Show success
        const successMsg = document.getElementById('success-msg');
        successMsg.style.display = 'block';
        setTimeout(() => { successMsg.style.display = 'none'; }, 3000);

        // Show status
        const updated = await chrome.storage.local.get(['deviceId', 'backendUrl']);
        if (updated.deviceId) {
            document.getElementById('status-section').style.display = 'block';
            document.getElementById('device-id-display').textContent = updated.deviceId.substring(0, 12) + '...';
            document.getElementById('backend-display').textContent = updated.backendUrl;
            testConnection(updated.backendUrl);
        }
    });

    document.getElementById('force-sync-btn').addEventListener('click', () => {
        chrome.alarms.create('immediate-flush', { when: Date.now() + 50 });
        const syncMsg = document.getElementById('sync-success-msg');
        syncMsg.style.display = 'block';
        setTimeout(() => { syncMsg.style.display = 'none'; }, 3000);
    });

    // --- DEBUG DASHBOARD PIPELINE ---
    async function updateDebugDashboard() {
        const data = await chrome.storage.local.get(['curbai_event_buffer', 'last_error']);
        const buffer = data.curbai_event_buffer || [];

        document.getElementById('debug-buffer-size').textContent = `${buffer.length} events waiting`;
        document.getElementById('debug-last-error').textContent = data.last_error || 'None';

        const feed = document.getElementById('debug-buffer-feed');
        if (buffer.length === 0) {
            feed.style.color = '#888';
            feed.textContent = "Buffer is completely empty.\nIf you are reading this after clicking around websites, the event collector is fundamentally broken (Chrome permissions issue).";
        } else {
            feed.style.color = '#00e676';
            feed.textContent = JSON.stringify(buffer.map(b => `${b.event_category} -> ${b.event_type}`), null, 2).slice(0, 1000);
        }
    }

    document.getElementById('refresh-debug-btn').addEventListener('click', updateDebugDashboard);
    setInterval(updateDebugDashboard, 3000); // Auto-update every 3s
    updateDebugDashboard();
});

async function testConnection(backendUrl) {
    const connStatus = document.getElementById('conn-status');
    connStatus.textContent = 'Checking...';
    connStatus.style.color = '#888';

    try {
        const resp = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(3000) });
        if (resp.ok) {
            connStatus.textContent = '● Connected';
            connStatus.style.color = '#00e676';
        } else {
            connStatus.textContent = '● Server error';
            connStatus.style.color = '#ff5252';
        }
    } catch {
        connStatus.textContent = '● Cannot reach server';
        connStatus.style.color = '#ff5252';
    }
}
