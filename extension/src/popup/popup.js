/**
 * Popup script — updates the popup UI with current extension state.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const config = await chrome.storage.local.get([
        'deviceId',
        'backendUrl',
        'curbai_event_buffer',
    ]);

    // Device ID
    const deviceIdEl = document.getElementById('device-id');
    deviceIdEl.textContent = config.deviceId
        ? config.deviceId.substring(0, 8) + '...'
        : 'Not registered';

    // Buffer count
    const bufferCountEl = document.getElementById('buffer-count');
    const buffer = config.curbai_event_buffer || [];
    bufferCountEl.textContent = buffer.length;

    // Connection status (check Redis via a simple approach)
    const connectionEl = document.getElementById('connection-status');
    if (config.deviceId && config.backendUrl) {
        try {
            const resp = await fetch(`${config.backendUrl}/health`, { signal: AbortSignal.timeout(3000) });
            if (resp.ok) {
                connectionEl.textContent = 'Connected';
                connectionEl.className = 'status-active';
            }
        } catch {
            connectionEl.textContent = 'Disconnected';
            connectionEl.className = 'status-inactive';
        }
    }

    // Dashboard link
    const dashboardLink = document.getElementById('dashboard-link');
    dashboardLink.href = config.backendUrl
        ? config.backendUrl.replace(/:\d+$/, ':3000')
        : 'http://localhost:3000';
});
