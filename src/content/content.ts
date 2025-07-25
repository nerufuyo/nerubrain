// Content script for Coursera automation extension

import { 
  ExtensionMessage, 
  MessageType, 
  AutomationSettings,
  PageType,
  ModuleType
} from '../types/index';
import { CourseraPageDetector } from '../core/page-detector';
import { QuizAutomator } from '../core/quiz-automator';
import { VideoAutomator } from '../core/video-automator';
import { Logger } from '../utils/logger';
import { ChromeStorage } from '../utils/storage';

class ContentScript {
  private readonly logger = Logger.getInstance();
  private readonly storage = ChromeStorage.getInstance();
  private readonly pageDetector = new CourseraPageDetector();
  
  private quizAutomator = new QuizAutomator();
  private videoAutomator = new VideoAutomator();
  
  private isAutomationActive = false;
  private settings: AutomationSettings | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.logger.info('Content script initialized on Coursera page');
    
    // Load settings
    await this.loadSettings();
    
    // Set up message listeners
    this.setupMessageListeners();
    
    // Detect page type
    await this.detectAndReportPage();
    
    // Set up page navigation listeners
    this.setupNavigationListeners();
  }

  private async loadSettings(): Promise<void> {
    this.settings = await this.storage.get<AutomationSettings>('automation_settings');
    if (!this.settings) {
      this.logger.warn('No settings found, using defaults');
    }
  }

  private setupMessageListeners(): void {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep message channel open
    });
  }

  private async handleMessage(message: ExtensionMessage, sendResponse: (response: any) => void): Promise<void> {
    try {
      this.logger.info('Content script received message:', message);
      const { type, payload } = message;
      
      switch (type) {
        case MessageType.START_AUTOMATION:
          await this.startAutomation(payload);
          sendResponse({ success: true });
          break;

        case MessageType.STOP_AUTOMATION:
          await this.stopAutomation();
          sendResponse({ success: true });
          break;

        case MessageType.UPDATE_SETTINGS:
          this.settings = payload;
          sendResponse({ success: true });
          break;

        case MessageType.PAGE_DETECTED:
          await this.detectAndReportPage();
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

  private async startAutomation(config: any): Promise<void> {
    if (this.isAutomationActive) {
      this.logger.warn('Automation already active');
      return;
    }

    this.logger.info('Starting automation');
    this.isAutomationActive = true;

    try {
      const pageType = this.pageDetector.detectPageType();
      this.logger.info(`Detected page type: ${pageType}`);
      
      if (!this.pageDetector.isAutomatable()) {
        // Instead of throwing an error, try to detect what type of content is available
        const url = window.location.href;
        this.logger.warn(`Page type ${pageType} is not directly automatable, but checking for automation opportunities...`);
        
        // Try to find quiz elements even if page type is unknown
        if (url.includes('quiz') || url.includes('assignment') || url.includes('exam')) {
          this.logger.info('Found quiz-related URL, attempting quiz automation...');
          await this.executeAutomation(PageType.QUIZ_PAGE, config);
          return;
        }
        
        // Try to find video elements
        const videoElement = document.querySelector('video');
        if (videoElement) {
          this.logger.info('Found video element, attempting video automation...');
          await this.executeAutomation(PageType.VIDEO_LECTURE, config);
          return;
        }
        
        throw new Error(`Page type ${pageType} is not automatable. URL: ${url}`);
      }

      await this.executeAutomation(pageType, config);
      
    } catch (error) {
      this.logger.error('Automation failed:', error);
      await this.reportError(error);
    } finally {
      this.isAutomationActive = false;
    }
  }

  private async stopAutomation(): Promise<void> {
    this.logger.info('Stopping automation');
    this.isAutomationActive = false;
  }

  private async executeAutomation(pageType: PageType, config: any): Promise<void> {
    const moduleType = this.mapPageTypeToModuleType(pageType);
    
    if (!moduleType) {
      throw new Error(`Cannot map page type ${pageType} to module type`);
    }

    const module = {
      id: this.generateModuleId(),
      title: document.title,
      type: moduleType,
      completed: false,
      url: window.location.href
    };

    let result;
    
    switch (moduleType) {
      case ModuleType.QUIZ:
        if (this.quizAutomator.canProcess(moduleType)) {
          result = await this.quizAutomator.processModule(module);
        }
        break;
        
      case ModuleType.VIDEO:
        if (this.videoAutomator.canProcess(moduleType)) {
          result = await this.videoAutomator.processModule(module);
        }
        break;
        
      default:
        throw new Error(`Automation not implemented for module type: ${moduleType}`);
    }

    if (result) {
      await this.reportAutomationComplete(result);
      
      // Save progress
      await this.saveProgress(module, result);
      
      // Auto-navigate to next module if configured
      if (config.autoNavigate && result.success) {
        await this.navigateToNext();
      }
    }
  }

  private mapPageTypeToModuleType(pageType: PageType): ModuleType | null {
    const mapping: Record<string, ModuleType> = {
      [PageType.QUIZ_PAGE]: ModuleType.QUIZ,
      [PageType.VIDEO_LECTURE]: ModuleType.VIDEO,
      [PageType.READING_PAGE]: ModuleType.READING,
      [PageType.DISCUSSION_PAGE]: ModuleType.DISCUSSION
    };

    return mapping[pageType] || null;
  }

  private async detectAndReportPage(): Promise<void> {
    const pageType = this.pageDetector.detectPageType();
    const pageData = this.pageDetector.extractPageData();
    
    this.logger.debug(`Detected page type: ${pageType}`, pageData);
    
    // Report to background script
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.PAGE_DETECTED,
        payload: { pageType, pageData, isAutomatable: this.pageDetector.isAutomatable() },
        timestamp: new Date(),
        id: this.generateId()
      });
    } catch (error) {
      this.logger.debug('Could not send page detection to background:', error);
    }
  }

  private setupNavigationListeners(): void {
    // Listen for URL changes (SPA navigation)
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => this.detectAndReportPage(), 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(() => this.detectAndReportPage(), 1000);
    });
  }

  private async navigateToNext(): Promise<void> {
    // Look for "Next" button
    const nextSelectors = [
      '[data-testid="next-button"]',
      '.next-item-button',
      'button:contains("Next")',
      'a:contains("Next")'
    ];

    for (const selector of nextSelectors) {
      const nextButton = document.querySelector(selector);
      if (nextButton && this.isElementVisible(nextButton)) {
        this.logger.info('Navigating to next module');
        (nextButton as HTMLElement).click();
        return;
      }
    }

    this.logger.warn('Next button not found');
  }

  private async saveProgress(module: any, result: any): Promise<void> {
    const courseId = this.extractCourseId();
    if (!courseId) return;

    const progressKey = `course_progress_${courseId}`;
    const existingProgress = await this.storage.get(progressKey) || {
      courseId,
      completedModules: [],
      quizScores: [],
      timeSpent: { totalTime: 0, activeTime: 0, videoTime: 0, readingTime: 0, quizTime: 0 },
      lastActivity: new Date(),
      totalProgress: 0
    };

    // Update progress based on result
    if (result.success) {
      (existingProgress as any).completedModules.push(module);
      (existingProgress as any).lastActivity = new Date();
      
      if (module.type === ModuleType.QUIZ && result.score !== undefined) {
        (existingProgress as any).quizScores.push({
          quizId: module.id,
          score: result.score,
          maxScore: result.maxScore || 100,
          attemptCount: 1,
          completedAt: new Date()
        });
      }
    }

    await this.storage.set(progressKey, existingProgress);
  }

  private async reportAutomationComplete(result: any): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.AUTOMATION_COMPLETE,
        payload: result,
        timestamp: new Date(),
        id: this.generateId()
      });
    } catch (error) {
      this.logger.debug('Could not report automation completion:', error);
    }
  }

  private async reportError(error: any): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.ERROR_OCCURRED,
        payload: {
          message: error.message || String(error),
          stack: error.stack,
          url: window.location.href,
          pageType: this.pageDetector.detectPageType()
        },
        timestamp: new Date(),
        id: this.generateId()
      });
    } catch (reportError) {
      this.logger.error('Could not report error:', reportError);
    }
  }

  private extractCourseId(): string | null {
    const match = window.location.pathname.match(/\/learn\/([^/]+)/);
    return match?.[1] || null;
  }

  private isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  private generateModuleId(): string {
    return `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContentScript());
} else {
  new ContentScript();
}
