/**
 * Options page script — handles backend URL and registration key setup.
 *
 * After registration, the API key is stored encrypted in chrome.storage.local
 * using the Web Crypto API (AES-GCM).
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load existing config
    const config = await chrome.storage.local.get(['backendUrl', 'deviceId']);

    if (config.backendUrl) {
        document.getElementById('backend-url').value = config.backendUrl;
    }

    if (config.deviceId) {
        document.getElementById('status-section').style.display = 'block';
        document.getElementById('conn-status').textContent = `Registered (${config.deviceId.substring(0, 8)}...)`;
        document.getElementById('reg-key').placeholder = '••••••••';
    }

    // Save handler
    document.getElementById('save-btn').addEventListener('click', async () => {
        const backendUrl = document.getElementById('backend-url').value.trim();
        const regKey = document.getElementById('reg-key').value.trim();

        if (!backendUrl) {
            alert('Backend URL is required');
            return;
        }

        // Store backend URL
        await chrome.storage.local.set({ backendUrl });

        // If a registration key is provided, encrypt and store it
        if (regKey) {
            const deviceId = crypto.randomUUID();
            const encryptedKey = await encryptKey(regKey);
            await chrome.storage.local.set({
                deviceId,
                encryptedApiKey: encryptedKey,
            });
        }

        // Show success
        const successMsg = document.getElementById('success-msg');
        successMsg.style.display = 'block';
        setTimeout(() => { successMsg.style.display = 'none'; }, 3000);

        // Show status
        const updated = await chrome.storage.local.get(['deviceId']);
        if (updated.deviceId) {
            document.getElementById('status-section').style.display = 'block';
            document.getElementById('conn-status').textContent = `Registered (${updated.deviceId.substring(0, 8)}...)`;
        }
    });
});

/**
 * Encrypt the API key using Web Crypto API (AES-GCM).
 */
async function encryptKey(plainKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainKey);

    // Generate a random key for encryption
    const cryptoKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
    );

    // Export the key for storage
    const exportedKey = await crypto.subtle.exportKey('raw', cryptoKey);

    return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        key: Array.from(new Uint8Array(exportedKey)),
    };
}
