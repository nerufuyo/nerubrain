// Popup script for Coursera automation extension

import { 
  MessageType, 
  AutomationSettings
} from '../types/index';
import { ChromeStorage } from '../utils/storage';
import { Logger } from '../utils/logger';

class PopupController {
  private readonly logger = Logger.getInstance();
  private readonly storage = ChromeStorage.getInstance();
  
  private currentTab: chrome.tabs.Tab | null = null;
  private settings: AutomationSettings | null = null;
  private isAutomationActive = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.getCurrentTab();
    await this.loadSettings();
    this.setupEventListeners();
    await this.updateUI();
    await this.detectCurrentPage();
  }

  private async getCurrentTab(): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tabs[0] || null;
    } catch (error) {
      this.logger.error('Failed to get current tab:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    this.settings = await this.storage.get<AutomationSettings>('automation_settings');
    if (this.settings) {
      this.populateSettingsUI();
    }
  }

  private setupEventListeners(): void {
    // Action buttons
    document.getElementById('startAutomation')?.addEventListener('click', () => this.startAutomation());
    document.getElementById('stopAutomation')?.addEventListener('click', () => this.stopAutomation());
    
    // Settings toggles
    document.getElementById('quizAutomation')?.addEventListener('change', () => this.updateSettings());
    document.getElementById('videoAutomation')?.addEventListener('change', () => this.updateSettings());
    document.getElementById('readingAutomation')?.addEventListener('change', () => this.updateSettings());
    document.getElementById('linkSharing')?.addEventListener('change', () => this.updateSettings());
    
    // Speed controls
    document.getElementById('videoSpeed')?.addEventListener('change', () => this.updateSettings());
    document.getElementById('quizDelay')?.addEventListener('change', () => this.updateSettings());
    
    // Footer buttons
    document.getElementById('openOptions')?.addEventListener('click', () => this.openOptionsPage());
    document.getElementById('shareLink')?.addEventListener('click', () => this.shareCurrentPage());
    document.getElementById('viewAnalytics')?.addEventListener('click', () => this.viewAnalytics());
  }

  private async startAutomation(): Promise<void> {
    if (!this.currentTab?.id || !this.isCoursera()) {
      this.showError('Please navigate to a Coursera page first');
      return;
    }

    try {
      this.setLoadingState(true);
      this.isAutomationActive = true;
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MessageType.START_AUTOMATION,
        payload: {
          autoNavigate: true,
          settings: this.settings
        },
        timestamp: new Date(),
        id: this.generateId()
      });

      if (response?.success) {
        this.updateStatusIndicator('active', 'Automation Active');
        this.updateActionButtons();
        this.showSuccess('Automation started successfully');
      } else {
        throw new Error(response?.error || 'Unknown error');
      }
    } catch (error) {
      this.showError(`Failed to start automation: ${error}`);
      this.isAutomationActive = false;
    } finally {
      this.setLoadingState(false);
    }
  }

  private async stopAutomation(): Promise<void> {
    if (!this.currentTab?.id) return;

    try {
      this.setLoadingState(true);
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MessageType.STOP_AUTOMATION,
        payload: {},
        timestamp: new Date(),
        id: this.generateId()
      });

      if (response?.success) {
        this.isAutomationActive = false;
        this.updateStatusIndicator('ready', 'Ready');
        this.updateActionButtons();
        this.showSuccess('Automation stopped');
      }
    } catch (error) {
      this.showError(`Failed to stop automation: ${error}`);
    } finally {
      this.setLoadingState(false);
    }
  }

  private async updateSettings(): Promise<void> {
    if (!this.settings) return;

    // Update feature flags
    const quizEnabled = (document.getElementById('quizAutomation') as HTMLInputElement)?.checked;
    const videoEnabled = (document.getElementById('videoAutomation') as HTMLInputElement)?.checked;
    const readingEnabled = (document.getElementById('readingAutomation') as HTMLInputElement)?.checked;
    const linkSharingEnabled = (document.getElementById('linkSharing') as HTMLInputElement)?.checked;

    this.settings.enabledFeatures.forEach(feature => {
      switch (feature.feature) {
        case 'quiz_automation' as any:
          feature.enabled = quizEnabled;
          break;
        case 'video_automation' as any:
          feature.enabled = videoEnabled;
          break;
        case 'reading_automation' as any:
          feature.enabled = readingEnabled;
          break;
        case 'link_sharing' as any:
          feature.enabled = linkSharingEnabled;
          break;
      }
      feature.lastModified = new Date();
    });

    // Update speed settings
    const videoSpeed = parseFloat((document.getElementById('videoSpeed') as HTMLSelectElement)?.value || '1.5');
    const quizDelay = parseInt((document.getElementById('quizDelay') as HTMLInputElement)?.value || '1000');

    this.settings.speedPreferences.videoSpeed = videoSpeed;
    this.settings.speedPreferences.quizDelay = quizDelay;

    // Save settings
    await this.storage.set('automation_settings', this.settings);
    
    // Notify background script
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.UPDATE_SETTINGS,
        payload: this.settings,
        timestamp: new Date(),
        id: this.generateId()
      });
    } catch (error) {
      this.logger.debug('Could not notify background of settings change:', error);
    }
  }

  private populateSettingsUI(): void {
    if (!this.settings) return;

    // Populate feature toggles
    this.settings.enabledFeatures.forEach(feature => {
      let elementId = '';
      switch (feature.feature) {
        case 'quiz_automation' as any:
          elementId = 'quizAutomation';
          break;
        case 'video_automation' as any:
          elementId = 'videoAutomation';
          break;
        case 'reading_automation' as any:
          elementId = 'readingAutomation';
          break;
        case 'link_sharing' as any:
          elementId = 'linkSharing';
          break;
      }
      
      const element = document.getElementById(elementId) as HTMLInputElement;
      if (element) {
        element.checked = feature.enabled;
      }
    });

    // Populate speed settings
    const videoSpeedSelect = document.getElementById('videoSpeed') as HTMLSelectElement;
    if (videoSpeedSelect) {
      videoSpeedSelect.value = this.settings.speedPreferences.videoSpeed.toString();
    }

    const quizDelayInput = document.getElementById('quizDelay') as HTMLInputElement;
    if (quizDelayInput) {
      quizDelayInput.value = this.settings.speedPreferences.quizDelay.toString();
    }
  }

  private async detectCurrentPage(): Promise<void> {
    if (!this.currentTab?.id || !this.isCoursera()) {
      this.updatePageInfo('unknown', false);
      return;
    }

    try {
      // Request page detection from content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MessageType.PAGE_DETECTED,
        payload: {},
        timestamp: new Date(),
        id: this.generateId()
      });

      if (response?.success && response.data) {
        this.updatePageInfo(response.data.pageType, response.data.isAutomatable);
      }
    } catch (error) {
      this.logger.debug('Could not detect page type:', error);
      this.updatePageInfo('unknown', false);
    }
  }

  private updatePageInfo(pageType: string, isAutomatable: boolean): void {
    const pageTypeElement = document.getElementById('pageType');
    const automatableBadge = document.getElementById('automatableBadge');

    if (pageTypeElement) {
      pageTypeElement.textContent = this.formatPageType(pageType);
    }

    if (automatableBadge) {
      automatableBadge.textContent = isAutomatable ? 'Automatable' : 'Not Automatable';
      automatableBadge.className = `automatable-badge ${isAutomatable ? 'yes' : 'no'}`;
    }

    // Update action button availability
    const startButton = document.getElementById('startAutomation') as HTMLButtonElement;
    if (startButton) {
      startButton.disabled = !isAutomatable || this.isAutomationActive;
    }
  }

  private formatPageType(pageType: string): string {
    return pageType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private updateStatusIndicator(status: 'ready' | 'active' | 'error', text: string): void {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    if (statusDot) {
      statusDot.className = `status-dot ${status}`;
    }

    if (statusText) {
      statusText.textContent = text;
    }
  }

  private updateActionButtons(): void {
    const startButton = document.getElementById('startAutomation') as HTMLButtonElement;
    const stopButton = document.getElementById('stopAutomation') as HTMLButtonElement;

    if (startButton) {
      startButton.disabled = this.isAutomationActive || !this.isCoursera();
    }

    if (stopButton) {
      stopButton.disabled = !this.isAutomationActive;
    }
  }

  private async updateUI(): Promise<void> {
    this.updateActionButtons();
    await this.loadProgressData();
    await this.loadStatistics();
  }

  private async loadProgressData(): Promise<void> {
    const courseId = this.extractCourseId();
    if (!courseId) return;

    const progress = await this.storage.get(`course_progress_${courseId}`);
    if (progress) {
      this.updateProgressDisplay(progress);
    }
  }

  private async loadStatistics(): Promise<void> {
    // Load and display statistics
    const completedModulesElement = document.getElementById('completedModules');
    const avgQuizScoreElement = document.getElementById('avgQuizScore');
    const timeSavedElement = document.getElementById('timeSaved');

    // This would be populated with real data from storage
    if (completedModulesElement) completedModulesElement.textContent = '0';
    if (avgQuizScoreElement) avgQuizScoreElement.textContent = '-';
    if (timeSavedElement) timeSavedElement.textContent = '0h 0m';
  }

  private updateProgressDisplay(progress: any): void {
    const progressFill = document.getElementById('progressFill') as HTMLElement;
    const progressText = document.getElementById('progressText');

    if (progressFill && progressText) {
      const percentage = progress.totalProgress || 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${Math.round(percentage)}% Complete`;
    }
  }

  private isCoursera(): boolean {
    return this.currentTab?.url?.includes('coursera.org') || false;
  }

  private extractCourseId(): string | null {
    if (!this.currentTab?.url) return null;
    const match = this.currentTab.url.match(/\/learn\/([^/]+)/);
    return match?.[1] || null;
  }

  private setLoadingState(loading: boolean): void {
    const container = document.querySelector('.popup-container');
    if (container) {
      if (loading) {
        container.classList.add('loading');
      } else {
        container.classList.remove('loading');
      }
    }
  }

  private showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // Simple notification system - could be enhanced
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  private async openOptionsPage(): Promise<void> {
    await chrome.runtime.openOptionsPage();
  }

  private async shareCurrentPage(): Promise<void> {
    if (!this.currentTab?.url) return;
    
    try {
      await navigator.clipboard.writeText(this.currentTab.url);
      this.showSuccess('Link copied to clipboard');
    } catch (error) {
      this.showError('Failed to copy link');
    }
  }

  private async viewAnalytics(): Promise<void> {
    // Open analytics dashboard - could be implemented as a separate page
    this.showSuccess('Analytics feature coming soon');
  }

  private generateId(): string {
    return `popup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
