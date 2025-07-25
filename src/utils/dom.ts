// DOM utility functions for Coursera automation

export class DOMUtils {
  /**
   * Wait for an element to appear in the DOM
   */
  static async waitForElement(
    selector: string, 
    timeout: number = 10000,
    parent: Document | Element = document
  ): Promise<Element | null> {
    return new Promise((resolve) => {
      const element = parent.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = parent.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(parent, {
        childList: true,
        subtree: true
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Safe click with retry mechanism
   */
  static async safeClick(element: Element, retries: number = 3): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        if (element instanceof HTMLElement) {
          element.click();
          return true;
        }
        break;
      } catch (error) {
        console.warn(`Click attempt ${i + 1} failed:`, error);
        await this.delay(500);
      }
    }
    return false;
  }

  /**
   * Extract text content safely
   */
  static getTextContent(element: Element | null): string {
    return element?.textContent?.trim() || '';
  }

  /**
   * Check if element is visible
   */
  static isVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  /**
   * Scroll element into view smoothly
   */
  static scrollIntoView(element: Element): void {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
  }

  /**
   * Simple delay utility
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current page URL
   */
  static getCurrentURL(): string {
    return window.location.href;
  }

  /**
   * Check if current page matches pattern
   */
  static matchesPattern(pattern: string): boolean {
    return new RegExp(pattern).test(this.getCurrentURL());
  }

  /**
   * Safely dispatch events
   */
  static dispatchEvent(element: Element, eventType: string): void {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  }
}
