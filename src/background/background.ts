// Background service worker for Coursera automation extension

import { ExtensionMessage, MessageType, AutomationSettings } from '../types/index';
import { ChromeStorage } from '../utils/storage';
import { Logger } from '../utils/logger';

class BackgroundService {
  private readonly storage = ChromeStorage.getInstance();
  private readonly logger = Logger.getInstance();
  private activeAutomations = new Map<number, boolean>();

  constructor() {
    this.initializeListeners();
    this.initializeDefaultSettings();
  }

  private initializeListeners(): void {
    // Extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.logger.info('Extension installed:', details.reason);
      if (details.reason === 'install') {
        this.showWelcomeNotification();
      }
    });

    // Message handling from content scripts and popup
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Tab updates to detect Coursera pages
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url?.includes('coursera.org')) {
        this.logger.debug(`Coursera page loaded: ${tab.url}`);
        this.notifyContentScript(tabId);
      }
    });

    // Storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        this.logger.debug('Storage changed:', changes);
      }
    });
  }

  private async initializeDefaultSettings(): Promise<void> {
    const existingSettings = await this.storage.get<AutomationSettings>('automation_settings');
    
    if (!existingSettings) {
      const defaultSettings: AutomationSettings = {
        enabledFeatures: [
          { feature: 'quiz_automation' as any, enabled: true, lastModified: new Date() },
          { feature: 'video_automation' as any, enabled: true, lastModified: new Date() },
          { feature: 'reading_automation' as any, enabled: true, lastModified: new Date() },
          { feature: 'link_sharing' as any, enabled: true, lastModified: new Date() },
          { feature: 'analytics' as any, enabled: true, lastModified: new Date() }
        ],
        speedPreferences: {
          videoSpeed: 1.5,
          readingSpeed: 300, // words per minute
          quizDelay: 1000,
          navigationDelay: 500
        },
        safetySettings: {
          maxRetries: 3,
          timeoutMs: 30000,
          enableErrorReporting: true,
          respectRateLimit: true
        },
        notifications: {
          showProgress: true,
          showErrors: true,
          showCompletion: true,
          sound: false
        }
      };

      await this.storage.set('automation_settings', defaultSettings);
      this.logger.info('Default settings initialized');
    }
  }

  private async handleMessage(
    message: ExtensionMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response: any) => void
  ): Promise<void> {
    try {
      const { type, payload } = message;
      
      switch (type) {
        case MessageType.START_AUTOMATION:
          // If no tab ID from sender (e.g., popup), get the current active tab
          const startTabId = sender.tab?.id || await this.getCurrentActiveTab();
          await this.handleStartAutomation(payload, startTabId);
          sendResponse({ success: true });
          break;

        case MessageType.STOP_AUTOMATION:
          // If no tab ID from sender (e.g., popup), get the current active tab
          const stopTabId = sender.tab?.id || await this.getCurrentActiveTab();
          await this.handleStopAutomation(stopTabId);
          sendResponse({ success: true });
          break;

        case MessageType.UPDATE_SETTINGS:
          await this.handleUpdateSettings(payload);
          sendResponse({ success: true });
          break;

        case MessageType.GET_PROGRESS:
          const progress = await this.getProgress(payload.courseId);
          sendResponse({ success: true, data: progress });
          break;

        case MessageType.ERROR_OCCURRED:
          await this.handleError(payload, sender.tab?.id);
          sendResponse({ success: true });
          break;

        default:
          this.logger.warn(`Unknown message type: ${type}`);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      this.logger.error('Error handling message:', error);
      sendResponse({ success: false, error: String(error) });
    }
  }

  private async handleStartAutomation(payload: any, tabId?: number): Promise<void> {
    if (!tabId) {
      throw new Error('No tab ID provided');
    }

    this.logger.info(`Starting automation for tab ${tabId}`);
    this.activeAutomations.set(tabId, true);

    // Send message to content script to start automation
    await chrome.tabs.sendMessage(tabId, {
      type: MessageType.START_AUTOMATION,
      payload,
      timestamp: new Date(),
      id: this.generateId()
    });

    // Update badge to show active automation
    await chrome.action.setBadgeText({ text: '🤖', tabId });
    await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });
  }

  private async handleStopAutomation(tabId?: number): Promise<void> {
    if (!tabId) return;

    this.logger.info(`Stopping automation for tab ${tabId}`);
    this.activeAutomations.delete(tabId);

    // Send message to content script to stop automation
    await chrome.tabs.sendMessage(tabId, {
      type: MessageType.STOP_AUTOMATION,
      payload: {},
      timestamp: new Date(),
      id: this.generateId()
    });

    // Clear badge
    await chrome.action.setBadgeText({ text: '', tabId });
  }

  private async handleUpdateSettings(settings: AutomationSettings): Promise<void> {
    await this.storage.set('automation_settings', settings);
    this.logger.info('Settings updated');

    // Notify all Coursera tabs about settings change
    const tabs = await chrome.tabs.query({ url: '*://*.coursera.org/*' });
    
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: MessageType.UPDATE_SETTINGS,
            payload: settings,
            timestamp: new Date(),
            id: this.generateId()
          });
        } catch (error) {
          // Tab might not have content script loaded
          this.logger.debug(`Could not send settings to tab ${tab.id}`);
        }
      }
    }
  }

  private async getProgress(courseId: string): Promise<any> {
    const progressKey = `course_progress_${courseId}`;
    return await this.storage.get(progressKey);
  }

  private async handleError(error: any, tabId?: number): Promise<void> {
    // Extract error message properly to avoid logging [object Object]
    const errorMessage = error?.message || error?.error || (typeof error === 'string' ? error : JSON.stringify(error));
    this.logger.error('Automation error reported:', errorMessage);
    
    // Store error for analytics
    const errorLog = {
      timestamp: new Date(),
      tabId,
      error: errorMessage,
      stack: error?.stack,
      url: error?.url
    };

    const errors = await this.storage.get<any[]>('error_log') || [];
    errors.push(errorLog);
    
    // Keep only last 100 errors
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100);
    }

    await this.storage.set('error_log', errors);

    // Show notification if enabled
    const settings = await this.storage.get<AutomationSettings>('automation_settings');
    if (settings?.notifications.showErrors) {
      await this.showErrorNotification(errorMessage);
    }
  }

  private async notifyContentScript(tabId: number): Promise<void> {
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: MessageType.PAGE_DETECTED,
        payload: { detected: true },
        timestamp: new Date(),
        id: this.generateId()
      });
    } catch (error) {
      // Content script might not be ready yet
      this.logger.debug(`Could not notify content script for tab ${tabId}`);
    }
  }

  private async showWelcomeNotification(): Promise<void> {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.svg',
      title: 'Coursera Automation Extension',
      message: 'Extension installed successfully! Navigate to Coursera to start automating your learning.'
    });
  }

  private async showErrorNotification(errorMessage: string): Promise<void> {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.svg',
      title: 'Automation Error',
      message: `An error occurred: ${errorMessage.substring(0, 100)}...`
    });
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCurrentActiveTab(): Promise<number> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) {
      throw new Error('No active tab found');
    }
    return tabs[0].id;
  }
}

// Initialize the background service
new BackgroundService();
