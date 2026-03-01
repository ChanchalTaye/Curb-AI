/**
 * WebSocket Client — persistent bidirectional channel to the backend.
 *
 * Handles: PING/PONG heartbeat, SHOW_WARNING, FLAG_SESSION, SEND_ACKNOWLEDGEMENT.
 * Reconnects automatically with exponential backoff.
 */

let websocket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 3000;

export async function initWebSocketClient() {
    const config = await chrome.storage.local.get(['deviceId', 'backendUrl']);
    const deviceId = config.deviceId;
    const backendUrl = (config.backendUrl || 'http://localhost:8001').replace('http', 'ws');

    if (!deviceId) {
        console.warn('[CurbAI] No device ID — WebSocket not started');
        return;
    }

    connectWebSocket(`${backendUrl}/ws/agent/${deviceId}`);

    // Heartbeat alarm
    chrome.alarms.create('ws-heartbeat', { periodInMinutes: 0.5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'ws-heartbeat') {
            sendHeartbeat();
        }
    });
}

function connectWebSocket(url) {
    try {
        websocket = new WebSocket(url);

        websocket.onopen = () => {
            console.log('[CurbAI] WebSocket connected');
            reconnectAttempts = 0;
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleCommand(data);
            } catch (err) {
                console.error('[CurbAI] WS parse error:', err);
            }
        };

        websocket.onerror = (error) => {
            console.error('[CurbAI] WebSocket error:', error);
        };

        websocket.onclose = () => {
            console.log('[CurbAI] WebSocket closed');
            attemptReconnect(url);
        };
    } catch (err) {
        console.error('[CurbAI] WebSocket connection failed:', err);
        attemptReconnect(url);
    }
}

function attemptReconnect(url) {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
        console.log(`[CurbAI] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => connectWebSocket(url), delay);
    } else {
        console.error('[CurbAI] Max reconnect attempts reached');
    }
}

function sendHeartbeat() {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'PING' }));
    }
}

function handleCommand(command) {
    switch (command.type) {
        case 'SHOW_WARNING':
            showWarningOverlay(command.message);
            break;
        case 'FLAG_SESSION':
            flagSession(command.duration || 240);
            break;
        case 'SEND_ACKNOWLEDGEMENT':
            sendAcknowledgementPrompt(command.message);
            break;
        case 'PONG':
            // Heartbeat OK
            break;
        default:
            console.log('[CurbAI] Unknown command:', command.type);
    }
}

async function showWarningOverlay(message) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'SHOW_WARNING', message });
    }
}

async function flagSession(durationMinutes) {
    const expiryTime = Date.now() + durationMinutes * 60 * 1000;
    await chrome.storage.local.set({ sessionFlagged: true, flagExpiry: expiryTime });
    console.log(`[CurbAI] Session flagged for ${durationMinutes} minutes`);
}

function sendAcknowledgementPrompt(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'CurbAI Security Alert',
        message: message,
        requireInteraction: true,
        buttons: [{ title: 'I Understand' }],
    });
}
