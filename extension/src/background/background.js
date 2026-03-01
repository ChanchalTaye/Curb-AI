/**
 * CurbAI Service Worker — the brain of the extension.
 *
 * Responsibilities:
 * - Listen to tab & navigation events
 * - Buffer events in chrome.storage.local
 * - Flush buffer to Ingestion Service every 30 seconds via chrome.alarms
 * - Maintain WebSocket connection for backend commands
 * - Execute commands received from the backend
 */

import { initEventCollector } from './event_collector.js';
import { initBufferManager, addEvent } from './buffer_manager.js';
import { initFlushManager } from './flush_manager.js';
import { initWebSocketClient } from './websocket_client.js';

// Extension lifecycle
chrome.runtime.onInstalled.addListener(async () => {
    console.log('[CurbAI] Extension installed');
    await initBufferManager();
    initEventCollector(addEvent);
    initFlushManager();
    initWebSocketClient();
});

chrome.runtime.onStartup.addListener(async () => {
    console.log('[CurbAI] Extension started');
    await initBufferManager();
    initEventCollector(addEvent);
    initFlushManager();
    initWebSocketClient();
});

// Keep Service Worker alive during active monitoring
chrome.alarms.create('keepalive', { periodInMinutes: 0.33 }); // ~20 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepalive') {
        // Worker stays alive; flush manager and WS heartbeat handle their own alarms
    }
});
