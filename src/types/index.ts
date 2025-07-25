// Core interfaces for the Coursera automation extension

export interface CourseModule {
  readonly id: string;
  readonly title: string;
  readonly type: ModuleType;
  readonly completed: boolean;
  readonly url: string;
  readonly estimatedTime?: number;
}

export interface CourseProgress {
  courseId: string;
  completedModules: CourseModule[];
  quizScores: QuizScore[];
  timeSpent: TimeMetrics;
  lastActivity: Date;
  totalProgress: number;
}

export interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  attemptCount: number;
  completedAt: Date;
}

export interface TimeMetrics {
  totalTime: number;
  activeTime: number;
  videoTime: number;
  readingTime: number;
  quizTime: number;
}

export interface AutomationSettings {
  enabledFeatures: FeatureFlag[];
  speedPreferences: SpeedSettings;
  safetySettings: SafetyConfig;
  notifications: NotificationSettings;
}

export interface FeatureFlag {
  feature: AutomationFeature;
  enabled: boolean;
  lastModified: Date;
}

export interface SpeedSettings {
  videoSpeed: number;
  readingSpeed: number;
  quizDelay: number;
  navigationDelay: number;
}

export interface SafetyConfig {
  maxRetries: number;
  timeoutMs: number;
  enableErrorReporting: boolean;
  respectRateLimit: boolean;
}

export interface NotificationSettings {
  showProgress: boolean;
  showErrors: boolean;
  showCompletion: boolean;
  sound: boolean;
}

export enum ModuleType {
  VIDEO = 'video',
  READING = 'reading',
  QUIZ = 'quiz',
  DISCUSSION = 'discussion',
  ASSIGNMENT = 'assignment',
  UNGRADED_PLUGIN = 'ungraded_plugin',
  PEER_REVIEW = 'peer_review'
}

export enum AutomationFeature {
  QUIZ_AUTOMATION = 'quiz_automation',
  VIDEO_AUTOMATION = 'video_automation',
  READING_AUTOMATION = 'reading_automation',
  DISCUSSION_AUTOMATION = 'discussion_automation',
  LINK_SHARING = 'link_sharing',
  ANALYTICS = 'analytics'
}

export enum PageType {
  COURSE_HOME = 'course_home',
  MODULE_PAGE = 'module_page',
  VIDEO_LECTURE = 'video_lecture',
  QUIZ_PAGE = 'quiz_page',
  READING_PAGE = 'reading_page',
  DISCUSSION_PAGE = 'discussion_page',
  UNKNOWN = 'unknown'
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  duration?: number;
}

export interface QuizResult extends ProcessingResult {
  score?: number;
  maxScore?: number;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect?: boolean;
  explanation?: string;
}

export interface VideoResult extends ProcessingResult {
  watchedDuration: number;
  totalDuration: number;
  speed: number;
  completed: boolean;
}

export interface ReadingResult extends ProcessingResult {
  wordsRead: number;
  estimatedReadingTime: number;
  actualTime: number;
  comprehensionScore?: number;
}

// Event types for extension communication
export interface ExtensionMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  id: string;
}

export enum MessageType {
  START_AUTOMATION = 'start_automation',
  STOP_AUTOMATION = 'stop_automation',
  UPDATE_SETTINGS = 'update_settings',
  GET_PROGRESS = 'get_progress',
  ERROR_OCCURRED = 'error_occurred',
  AUTOMATION_COMPLETE = 'automation_complete',
  PAGE_DETECTED = 'page_detected'
}

// Storage interface
export interface IStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Logger interface
export interface ILogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// Module processor interface
export interface IModuleProcessor {
  canProcess(moduleType: ModuleType): boolean;
  processModule(module: CourseModule): Promise<ProcessingResult>;
}

// Page detector interface
export interface IPageDetector {
  detectPageType(): PageType;
  extractPageData(): any;
  isAutomatable(): boolean;
}
