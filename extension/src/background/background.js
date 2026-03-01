import { initEventCollector } from './event_collector.js';
import { initBufferManager, addEvent } from './buffer_manager.js';
import { initWebSocketClient } from './websocket_client.js';

// Extension lifecycle setup
chrome.runtime.onInstalled.addListener(async () => {
    console.log('[CurbAI] Extension installed');
    await initBufferManager();
});

chrome.runtime.onStartup.addListener(async () => {
    console.log('[CurbAI] Extension started');
});

// Self-healing alarm (Manifest V3 fix for disappearing alarms)
chrome.alarms.get('curbai-flush', (alarm) => {
    if (!alarm) {
        chrome.alarms.create('curbai-flush', { periodInMinutes: 0.5 });
    }
});

// TOP LEVEL: MUST register listeners here so Service Worker persistence is not broken in Manifest V3
initEventCollector(addEvent);
initWebSocketClient();

// Listen for messages from content scripts (scroll tracking, page focus)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.event_category) {
        addEvent(message);
    }
});

// Top level alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'curbai-flush' || alarm.name === 'immediate-flush') {
        const flushManager = await import('./flush_manager.js');
        await flushManager.flushBuffer();
    }
});
