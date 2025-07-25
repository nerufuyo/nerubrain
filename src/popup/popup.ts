// Production popup controller for Coursera automation extension

import { ExtensionMessage, MessageType } from '../types/index';

class PopupController {
    private currentTab: chrome.tabs.Tab | null = null;
    private isAutomationActive = false;
    private settings = {
        quiz: true,
        video: true,
        reading: true
    };
    
    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        try {
            await this.getCurrentTab();
            this.setupEventListeners();
            this.updateUI();
            this.log('Extension initialized');
        } catch (error) {
            this.log('Initialization error: ' + (error as Error).message);
        }
    }

    private async getCurrentTab(): Promise<void> {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        this.currentTab = tabs[0] || null;
    }

    private setupEventListeners(): void {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startAutomation());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopAutomation());
        }

        // Feature toggles
        const toggles = document.querySelectorAll('.toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleFeature(toggle as HTMLElement));
        });
    }

    private toggleFeature(toggleElement: HTMLElement): void {
        const feature = toggleElement.dataset['feature'] as keyof typeof this.settings;
        const isActive = toggleElement.classList.contains('active');
        
        if (isActive) {
            toggleElement.classList.remove('active');
            this.settings[feature] = false;
        } else {
            toggleElement.classList.add('active');
            this.settings[feature] = true;
        }
        
        this.log(feature + ' automation ' + (this.settings[feature] ? 'enabled' : 'disabled'));
    }

    private async startAutomation(): Promise<void> {
        if (!this.currentTab) {
            this.log('No active tab found');
            return;
        }

        if (!this.isCoursera()) {
            this.log('Please navigate to a Coursera page first');
            return;
        }

        try {
            this.isAutomationActive = true;
            this.updateStatus('active', 'Starting automation...');
            this.updateButtons();
            
            this.log('Sending START_AUTOMATION message to background script...');
            
            const message: ExtensionMessage = {
                type: MessageType.START_AUTOMATION,
                payload: {
                    settings: this.settings,
                    autoNavigate: true
                },
                timestamp: new Date(),
                id: this.generateMessageId()
            };

            // Send message to background script, which will forward to content script
            const response = await chrome.runtime.sendMessage(message);

            if (response && response.success) {
                this.updateStatus('active', 'Automation Active');
                this.log('Automation started successfully');
            } else {
                throw new Error(response?.error || 'Failed to start automation');
            }
        } catch (error) {
            this.isAutomationActive = false;
            this.updateStatus('error', 'Error occurred');
            this.updateButtons();
            this.log('Error starting automation: ' + (error as Error).message);
        }
    }

    private async stopAutomation(): Promise<void> {
        if (!this.currentTab) return;

        try {
            this.isAutomationActive = false;
            this.updateStatus('ready', 'Stopping...');
            this.updateButtons();

            // Send message to background script, which will forward to content script
            await chrome.runtime.sendMessage({
                type: MessageType.STOP_AUTOMATION,
                payload: {},
                timestamp: new Date(),
                id: this.generateMessageId()
            });

            this.updateStatus('ready', 'Ready');
            this.log('Automation stopped');
        } catch (error) {
            this.log('Error stopping automation: ' + (error as Error).message);
            this.updateStatus('ready', 'Ready');
        }
    }

    private updateUI(): void {
        if (this.currentTab) {
            const isCoursera = this.isCoursera();
            
            const pageTypeEl = document.getElementById('pageType');
            const automatableEl = document.getElementById('automatable');
            
            if (pageTypeEl) {
                pageTypeEl.textContent = isCoursera ? 'Coursera Page' : 'Other Website';
            }
            
            if (automatableEl) {
                automatableEl.textContent = isCoursera ? 'Yes' : 'No';
            }
        }

        this.updateButtons();
    }

    private updateButtons(): void {
        const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
        
        if (startBtn) {
            startBtn.disabled = this.isAutomationActive || !this.isCoursera();
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.isAutomationActive;
        }
    }

    private updateStatus(type: string, text: string): void {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot status-' + type;
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    private isCoursera(): boolean {
        return this.currentTab?.url?.includes('coursera.org') || false;
    }

    private log(message: string): void {
        console.log('[Popup] ' + message);
        
        const logContainer = document.getElementById('activityLog');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.textContent = new Date().toLocaleTimeString() + ': ' + message;
            logContainer.appendChild(entry);
            
            // Keep only last 5 entries for production
            while (logContainer.children.length > 5) {
                logContainer.removeChild(logContainer.firstChild!);
            }
            
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }

    private generateMessageId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PopupController());
} else {
    new PopupController();
}
