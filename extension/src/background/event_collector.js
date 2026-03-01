/**
 * Event Collector — listens to Chrome API events and normalizes them.
 *
 * Captures: Navigation, Tab Management, Session Timing, Downloads, Extension Changes.
 */

const HIGH_PRIORITY_TYPES = ['executable_download', 'rapid_domain_switch', 'flagged_domain'];

export function initEventCollector(addEventCallback) {
    // --- Navigation Events ---
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url) {
            const domain = extractDomain(tab.url);
            addEventCallback({
                event_category: 'navigation',
                event_type: 'page_load',
                event_timestamp: new Date().toISOString(),
                payload: {
                    url: tab.url,
                    domain: domain,
                    tab_id: tabId,
                    transition_type: 'link',
                },
            });
        }
    });

    chrome.webNavigation.onCompleted.addListener((details) => {
        if (details.frameId === 0) {
            addEventCallback({
                event_category: 'navigation',
                event_type: 'navigation_completed',
                event_timestamp: new Date().toISOString(),
                payload: {
                    url: details.url,
                    domain: extractDomain(details.url),
                    tab_id: details.tabId,
                    transition_type: details.transitionType || 'unknown',
                },
            });
        }
    });

    // --- Tab Management ---
    chrome.tabs.onCreated.addListener((tab) => {
        addEventCallback({
            event_category: 'tab_management',
            event_type: 'tab_created',
            event_timestamp: new Date().toISOString(),
            payload: { tab_id: tab.id },
        });
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        addEventCallback({
            event_category: 'tab_management',
            event_type: 'tab_closed',
            event_timestamp: new Date().toISOString(),
            payload: { tab_id: tabId },
        });
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
        addEventCallback({
            event_category: 'tab_management',
            event_type: 'tab_switched',
            event_timestamp: new Date().toISOString(),
            payload: { tab_id: activeInfo.tabId, window_id: activeInfo.windowId },
        });
    });

    // --- Downloads ---
    chrome.downloads.onCreated.addListener((downloadItem) => {
        const isExecutable = /\.(exe|msi|bat|cmd|ps1|sh|dmg|app|deb|rpm)$/i.test(downloadItem.filename);
        const eventType = isExecutable ? 'executable_download' : 'file_download';

        addEventCallback({
            event_category: 'download',
            event_type: eventType,
            event_timestamp: new Date().toISOString(),
            payload: {
                filename: downloadItem.filename,
                source_url: downloadItem.url,
                file_size: downloadItem.fileSize,
                mime_type: downloadItem.mime,
            },
            _priority: isExecutable ? 'high' : 'normal',
        });
    });

    // --- Idle Detection (Session Timing) ---
    chrome.idle.setDetectionInterval(60);
    chrome.idle.onStateChanged.addListener((state) => {
        addEventCallback({
            event_category: 'session_timing',
            event_type: `idle_${state}`,
            event_timestamp: new Date().toISOString(),
            payload: { idle_state: state },
        });
    });

    // --- Extension Install/Remove ---
    chrome.management.onInstalled.addListener((info) => {
        addEventCallback({
            event_category: 'extension_change',
            event_type: 'extension_installed',
            event_timestamp: new Date().toISOString(),
            payload: { ext_name: info.name, ext_id: info.id },
        });
    });

    chrome.management.onUninstalled.addListener((id) => {
        addEventCallback({
            event_category: 'extension_change',
            event_type: 'extension_removed',
            event_timestamp: new Date().toISOString(),
            payload: { ext_id: id },
        });
    });

    console.log('[CurbAI] Event collector initialized');
}

function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return 'unknown';
    }
}
