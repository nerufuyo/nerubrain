import { 
  IModuleProcessor, 
  ModuleType, 
  CourseModule, 
  QuizResult
} from '../types/index';
import { DOMUtils } from '../utils/dom';
import { Logger } from '../utils/logger';

export class QuizAutomator implements IModuleProcessor {
  private readonly logger = Logger.getInstance();
  private readonly delayBetweenActions = 1000;

  canProcess(moduleType: ModuleType): boolean {
    return moduleType === ModuleType.QUIZ;
  }

  async processModule(module: CourseModule): Promise<QuizResult> {
    this.logger.info(`Starting quiz automation for: ${module.title}`);
    
    try {
      const questions = await this.detectQuestions();
      if (questions.length === 0) {
        return {
          success: false,
          message: 'No questions found on this page',
          errors: ['Quiz questions not detected']
        };
      }

      const answers = await this.processQuestions(questions);
      const submitted = await this.submitQuiz();

      if (submitted) {
        const score = await this.getQuizScore();
        return {
          success: true,
          message: `Quiz completed successfully`,
          score: score.score,
          maxScore: score.maxScore,
          answers
        };
      } else {
        return {
          success: false,
          message: 'Failed to submit quiz',
          answers
        };
      }
    } catch (error) {
      this.logger.error('Quiz automation failed:', error);
      return {
        success: false,
        message: `Quiz automation failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  private async detectQuestions(): Promise<Element[]> {
    const selectors = [
      '[data-testid="quiz-question"]',
      '.quiz-question',
      '.question-container',
      '[role="group"]'
    ];

    for (const selector of selectors) {
      const questions = Array.from(document.querySelectorAll(selector));
      if (questions.length > 0) {
        this.logger.debug(`Found ${questions.length} questions using selector: ${selector}`);
        return questions;
      }
    }

    return [];
  }

  private async processQuestions(questions: Element[]): Promise<any[]> {
    const answers = [];
    
    for (let i = 0; i < questions.length; i++) {
      await DOMUtils.delay(this.delayBetweenActions);
      
      const question = questions[i];
      if (question) {
        const answer = await this.processQuestion(question, i);
        answers.push(answer);
        
        this.logger.debug(`Processed question ${i + 1}/${questions.length}`);
      }
    }

    return answers;
  }

  private async processQuestion(questionElement: Element, index: number): Promise<any> {
    const questionText = this.extractQuestionText(questionElement);
    const questionType = this.detectQuestionType(questionElement);
    
    this.logger.debug(`Processing ${questionType} question: ${questionText.substring(0, 50)}...`);

    switch (questionType) {
      case 'multiple_choice':
        return await this.handleMultipleChoice(questionElement, index, questionText);
      case 'multiple_select':
        return await this.handleMultipleSelect(questionElement, index, questionText);
      case 'text_input':
        return await this.handleTextInput(questionElement, index, questionText);
      default:
        this.logger.warn(`Unknown question type: ${questionType}`);
        return {
          questionId: `question-${index}`,
          questionText,
          questionType,
          selectedAnswer: null,
          processed: false
        };
    }
  }

  private extractQuestionText(element: Element): string {
    const selectors = [
      '.question-text',
      '[data-testid="question-text"]',
      'h3',
      'p',
      '.prompt'
    ];

    for (const selector of selectors) {
      const textElement = element.querySelector(selector);
      if (textElement) {
        return DOMUtils.getTextContent(textElement);
      }
    }

    return DOMUtils.getTextContent(element);
  }

  private detectQuestionType(element: Element): string {
    if (element.querySelector('input[type="radio"]')) return 'multiple_choice';
    if (element.querySelector('input[type="checkbox"]')) return 'multiple_select';
    if (element.querySelector('input[type="text"], textarea')) return 'text_input';
    return 'unknown';
  }

  private async handleMultipleChoice(element: Element, index: number, questionText: string): Promise<any> {
    const options = Array.from(element.querySelectorAll('input[type="radio"]'));
    
    if (options.length === 0) {
      return { questionId: `question-${index}`, processed: false, error: 'No options found' };
    }

    // Simple strategy: select first option (can be enhanced with AI)
    const selectedOption = options[0] as HTMLInputElement;
    await DOMUtils.safeClick(selectedOption);
    
    return {
      questionId: `question-${index}`,
      questionText,
      questionType: 'multiple_choice',
      selectedAnswer: selectedOption.value || 'option-0',
      processed: true
    };
  }

  private async handleMultipleSelect(element: Element, index: number, questionText: string): Promise<any> {
    const options = Array.from(element.querySelectorAll('input[type="checkbox"]'));
    
    if (options.length === 0) {
      return { questionId: `question-${index}`, processed: false, error: 'No options found' };
    }

    // Simple strategy: select first option
    const selectedOption = options[0] as HTMLInputElement;
    await DOMUtils.safeClick(selectedOption);
    
    return {
      questionId: `question-${index}`,
      questionText,
      questionType: 'multiple_select',
      selectedAnswer: [selectedOption.value || 'option-0'],
      processed: true
    };
  }

  private async handleTextInput(element: Element, index: number, questionText: string): Promise<any> {
    const input = element.querySelector('input[type="text"], textarea') as HTMLInputElement;
    
    if (!input) {
      return { questionId: `question-${index}`, processed: false, error: 'No input field found' };
    }

    // Simple placeholder text - would need AI for meaningful answers
    const placeholderAnswer = "Sample answer";
    input.value = placeholderAnswer;
    DOMUtils.dispatchEvent(input, 'input');
    
    return {
      questionId: `question-${index}`,
      questionText,
      questionType: 'text_input',
      selectedAnswer: placeholderAnswer,
      processed: true
    };
  }

  private async submitQuiz(): Promise<boolean> {
    const submitSelectors = [
      '[data-testid="submit-button"]',
      'button[type="submit"]',
      '.submit-quiz',
      'button:contains("Submit")'
    ];

    for (const selector of submitSelectors) {
      const submitButton = document.querySelector(selector);
      if (submitButton && DOMUtils.isVisible(submitButton)) {
        this.logger.info('Submitting quiz...');
        const success = await DOMUtils.safeClick(submitButton);
        if (success) {
          await DOMUtils.delay(2000); // Wait for submission
          return true;
        }
      }
    }

    this.logger.warn('Submit button not found or not clickable');
    return false;
  }

  private async getQuizScore(): Promise<{ score: number; maxScore: number }> {
    // Wait for results to load
    await DOMUtils.delay(3000);
    
    const scoreSelectors = [
      '[data-testid="quiz-score"]',
      '.quiz-score',
      '.score-display',
      '.grade'
    ];

    for (const selector of scoreSelectors) {
      const scoreElement = document.querySelector(selector);
      if (scoreElement) {
        const scoreText = DOMUtils.getTextContent(scoreElement);
        const scoreMatch = scoreText.match(/(\d+)\/(\d+)|(\d+)%/);
        
        if (scoreMatch) {
          return {
            score: parseInt(scoreMatch[1] || scoreMatch[3] || '0') || 0,
            maxScore: parseInt(scoreMatch[2] || '100') || 100
          };
        }
      }
    }

    return { score: 0, maxScore: 100 };
  }
}
