/**
 * Buffer Manager — manages event buffering in chrome.storage.local.
 *
 * Holds up to 500 events. Oldest are dropped on overflow.
 */

const BUFFER_KEY = 'curbai_event_buffer';
const MAX_BUFFER_SIZE = 500;

export async function initBufferManager() {
    // Generate a new session ID on startup
    const sessionId = crypto.randomUUID();
    await chrome.storage.local.set({ curbai_session_id: sessionId });
    console.log('[CurbAI] Buffer manager initialized, session:', sessionId);
}

export async function addEvent(event) {
    const config = await chrome.storage.local.get(['curbai_session_id', BUFFER_KEY]);
    const sessionId = config.curbai_session_id || 'unknown';

    const enrichedEvent = {
        ...event,
        session_id: sessionId,
    };

    // Remove internal priority flag before storage
    const priority = enrichedEvent._priority;
    delete enrichedEvent._priority;

    let buffer = config[BUFFER_KEY] || [];
    buffer.push(enrichedEvent);

    // Drop oldest events if buffer exceeds max
    if (buffer.length > MAX_BUFFER_SIZE) {
        buffer = buffer.slice(buffer.length - MAX_BUFFER_SIZE);
    }

    await chrome.storage.local.set({ [BUFFER_KEY]: buffer });

    // High-priority events trigger immediate flush
    if (priority === 'high') {
        chrome.alarms.create('immediate-flush', { when: Date.now() + 100 });
    }
}

export async function getAndClearBuffer() {
    const result = await chrome.storage.local.get(BUFFER_KEY);
    const buffer = result[BUFFER_KEY] || [];
    await chrome.storage.local.set({ [BUFFER_KEY]: [] });
    return buffer;
}

export async function getBufferSize() {
    const result = await chrome.storage.local.get(BUFFER_KEY);
    return (result[BUFFER_KEY] || []).length;
}
