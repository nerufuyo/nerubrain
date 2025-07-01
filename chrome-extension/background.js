// Background service worker for Chrome extension
let extensionStats = {
    components: 0,
    questions: 0,
    active: false
};

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('nerubrain extension installed');
    checkServerStatus();
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'updateStats':
            extensionStats = { ...extensionStats, ...request.stats };
            updateBadge();
            break;
        case 'getStats':
            sendResponse(extensionStats);
            break;
        case 'checkServer':
            checkServerStatus().then(status => sendResponse(status));
            return true; // Required for async response
    }
});

// Update extension badge with question count
function updateBadge() {
    const badgeText = extensionStats.questions > 0 ? extensionStats.questions.toString() : '';
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
}

// Check if Python backend server is running
async function checkServerStatus() {
    try {
        const response = await fetch('http://127.0.0.1:8000/health');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Handle tab updates to reinitialize detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Reset stats for new page
        extensionStats.components = 0;
        extensionStats.questions = 0;
        updateBadge();
    }
});

// Send current tab to content script when extension is activated
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: 'analyze' });
});
