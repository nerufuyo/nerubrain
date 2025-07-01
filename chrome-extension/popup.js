// Popup script for Chrome extension
class PopupController {
    constructor() {
        this.init();
    }

    async init() {
        await this.updateStatus();
        this.setupEventListeners();
        this.loadSettings();
        
        // Update status every 2 seconds
        setInterval(() => this.updateStatus(), 2000);
    }

    setupEventListeners() {
        document.getElementById('toggleDetection').addEventListener('click', () => {
            this.toggleDetection();
        });

        document.getElementById('analyzeNow').addEventListener('click', () => {
            this.analyzeNow();
        });

        document.getElementById('aiProvider').addEventListener('change', (e) => {
            this.saveSettings();
        });
    }

    async updateStatus() {
        // Check server status
        const serverStatus = await this.checkServerStatus();
        this.updateServerStatus(serverStatus);

        // Get detection stats from content script
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStats' });
            
            if (response) {
                this.updateDetectionStatus(response.active);
                this.updateCounts(response.components, response.questions);
            }
        } catch (error) {
            console.log('Content script not ready yet');
            this.updateDetectionStatus(false);
        }
    }

    async checkServerStatus() {
        try {
            const response = await fetch('http://127.0.0.1:8000/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    updateServerStatus(isActive) {
        const indicator = document.getElementById('serverStatus');
        const text = document.getElementById('serverText');
        
        if (isActive) {
            indicator.className = 'indicator active';
            text.textContent = 'Connected';
        } else {
            indicator.className = 'indicator inactive';
            text.textContent = 'Offline';
        }
    }

    updateDetectionStatus(isActive) {
        const indicator = document.getElementById('detectionStatus');
        const text = document.getElementById('detectionText');
        const button = document.getElementById('toggleDetection');
        
        if (isActive) {
            indicator.className = 'indicator active';
            text.textContent = 'Running';
            button.textContent = 'Stop Detection';
        } else {
            indicator.className = 'indicator inactive';
            text.textContent = 'Stopped';
            button.textContent = 'Start Detection';
        }
    }

    updateCounts(components, questions) {
        document.getElementById('componentCount').textContent = components || 0;
        document.getElementById('questionCount').textContent = questions || 0;
    }

    async toggleDetection() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
            
            if (response) {
                this.updateDetectionStatus(response.active);
            }
        } catch (error) {
            console.error('Error toggling detection:', error);
        }
    }

    async analyzeNow() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: 'analyze' });
            
            // Update status after analysis
            setTimeout(() => this.updateStatus(), 1000);
        } catch (error) {
            console.error('Error analyzing page:', error);
        }
    }

    loadSettings() {
        chrome.storage.sync.get(['aiProvider'], (result) => {
            if (result.aiProvider) {
                document.getElementById('aiProvider').value = result.aiProvider;
            }
        });
    }

    saveSettings() {
        const aiProvider = document.getElementById('aiProvider').value;
        chrome.storage.sync.set({ aiProvider: aiProvider });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
