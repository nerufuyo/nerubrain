import { 
  IPageDetector, 
  PageType
} from '../types/index';
import { DOMUtils } from '../utils/dom';

export class CourseraPageDetector implements IPageDetector {
  private readonly pagePatterns = {
    [PageType.COURSE_HOME]: /\/learn\/[^/]+\/?$/,
    [PageType.MODULE_PAGE]: /\/learn\/[^/]+\/[^/]+\/?$/,
    [PageType.VIDEO_LECTURE]: /\/learn\/[^/]+\/lecture\/[^/]+/,
    [PageType.QUIZ_PAGE]: /\/learn\/[^/]+\/(quiz|assignment-submission|exam)\/[^/]+/,
    [PageType.READING_PAGE]: /\/learn\/[^/]+\/supplement\/[^/]+/,
    [PageType.DISCUSSION_PAGE]: /\/learn\/[^/]+\/discussions/
  };

  detectPageType(): PageType {
    const currentURL = DOMUtils.getCurrentURL();
    
    for (const [pageType, pattern] of Object.entries(this.pagePatterns)) {
      if (pattern.test(currentURL)) {
        return pageType as PageType;
      }
    }
    
    return PageType.UNKNOWN;
  }

  extractPageData(): any {
    const pageType = this.detectPageType();
    
    switch (pageType) {
      case PageType.QUIZ_PAGE:
        return this.extractQuizData();
      case PageType.VIDEO_LECTURE:
        return this.extractVideoData();
      case PageType.READING_PAGE:
        return this.extractReadingData();
      default:
        return { pageType, url: DOMUtils.getCurrentURL() };
    }
  }

  isAutomatable(): boolean {
    const pageType = this.detectPageType();
    return [
      PageType.QUIZ_PAGE,
      PageType.VIDEO_LECTURE,
      PageType.READING_PAGE,
      PageType.DISCUSSION_PAGE
    ].includes(pageType);
  }

  private extractQuizData(): any {
    const questions = document.querySelectorAll('[data-testid="quiz-question"]');
    const submitButton = document.querySelector('[data-testid="submit-button"]');
    
    return {
      pageType: PageType.QUIZ_PAGE,
      questionCount: questions.length,
      hasSubmitButton: !!submitButton,
      questions: Array.from(questions).map((q, index) => ({
        id: `question-${index}`,
        text: DOMUtils.getTextContent(q.querySelector('.question-text')),
        type: this.detectQuestionType(q)
      }))
    };
  }

  private extractVideoData(): any {
    const videoElement = document.querySelector('video');
    const titleElement = document.querySelector('[data-testid="lecture-title"]');
    
    return {
      pageType: PageType.VIDEO_LECTURE,
      hasVideo: !!videoElement,
      title: DOMUtils.getTextContent(titleElement),
      duration: videoElement?.duration || 0,
      currentTime: videoElement?.currentTime || 0
    };
  }

  private extractReadingData(): any {
    const contentArea = document.querySelector('[data-testid="reading-content"]');
    const titleElement = document.querySelector('h1');
    
    return {
      pageType: PageType.READING_PAGE,
      title: DOMUtils.getTextContent(titleElement),
      wordCount: this.estimateWordCount(contentArea),
      hasContent: !!contentArea
    };
  }

  private detectQuestionType(questionElement: Element): string {
    if (questionElement.querySelector('input[type="radio"]')) {
      return 'multiple_choice';
    }
    if (questionElement.querySelector('input[type="checkbox"]')) {
      return 'multiple_select';
    }
    if (questionElement.querySelector('input[type="text"], textarea')) {
      return 'text_input';
    }
    return 'unknown';
  }

  private estimateWordCount(element: Element | null): number {
    if (!element) return 0;
    const text = DOMUtils.getTextContent(element);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}
