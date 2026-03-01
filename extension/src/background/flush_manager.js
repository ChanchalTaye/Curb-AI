/**
 * Flush Manager — sends buffered events to the Ingestion Service every 30 seconds.
 *
 * Uses chrome.alarms for reliable scheduling even when Service Worker sleeps.
 */

import { getAndClearBuffer } from './buffer_manager.js';

const FLUSH_ALARM = 'curbai-flush';
const FLUSH_INTERVAL_MINUTES = 0.5; // 30 seconds

export async function flushBuffer() {
    const events = await getAndClearBuffer();
    if (events.length === 0) return;

    const config = await chrome.storage.local.get(['deviceId', 'backendUrl']);
    const deviceId = config.deviceId;
    const backendUrl = config.backendUrl || 'http://localhost:8001';

    if (!deviceId) {
        console.warn('[CurbAI] No device ID configured — cannot flush events');
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/ingest/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: deviceId,
                events: events,
            }),
        });

        if (!response.ok) {
            console.error('[CurbAI] Flush failed with status:', response.status);

            // Record error to debug pane
            await chrome.storage.local.set({ last_error: `HTTP ${response.status} from backend. It rejected the payload.` });

            // Put events back in the buffer on failure
            const { curbai_event_buffer: existing } = await chrome.storage.local.get('curbai_event_buffer');
            const combined = [...events, ...(existing || [])];
            await chrome.storage.local.set({ curbai_event_buffer: combined.slice(-500) });
        } else {
            console.log(`[CurbAI] Flushed ${events.length} events`);
            await chrome.storage.local.set({ last_error: null }); // Clear error on success
        }
    } catch (err) {
        console.error('[CurbAI] Flush network error:', err.message);

        // Record error to debug pane
        await chrome.storage.local.set({ last_error: `Network Error: ${err.message}` });

        // Re-buffer on network failure
        const { curbai_event_buffer: existing } = await chrome.storage.local.get('curbai_event_buffer');
        const combined = [...events, ...(existing || [])];
        await chrome.storage.local.set({ curbai_event_buffer: combined.slice(-500) });
    }
}
