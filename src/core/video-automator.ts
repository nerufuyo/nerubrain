import { 
  IModuleProcessor, 
  ModuleType, 
  CourseModule, 
  VideoResult
} from '../types/index';
import { DOMUtils } from '../utils/dom';
import { Logger } from '../utils/logger';

export class VideoAutomator implements IModuleProcessor {
  private readonly logger = Logger.getInstance();
  private readonly defaultSpeed = 1.5;
  private readonly checkInterval = 1000;

  canProcess(moduleType: ModuleType): boolean {
    return moduleType === ModuleType.VIDEO;
  }

  async processModule(module: CourseModule): Promise<VideoResult> {
    this.logger.info(`Starting video automation for: ${module.title}`);
    
    try {
      const videoElement = await this.findVideoElement();
      if (!videoElement) {
        return {
          success: false,
          message: 'No video element found',
          watchedDuration: 0,
          totalDuration: 0,
          speed: 1,
          completed: false
        };
      }

      const result = await this.automateVideo(videoElement);
      return {
        success: true,
        message: 'Video automation completed',
        ...result
      };
    } catch (error) {
      this.logger.error('Video automation failed:', error);
      return {
        success: false,
        message: `Video automation failed: ${error}`,
        watchedDuration: 0,
        totalDuration: 0,
        speed: 1,
        completed: false,
        errors: [String(error)]
      };
    }
  }

  private async findVideoElement(): Promise<HTMLVideoElement | null> {
    const selectors = [
      'video',
      '[data-testid="video-player"] video',
      '.video-player video',
      'iframe[src*="player"]'
    ];

    for (const selector of selectors) {
      const element = await DOMUtils.waitForElement(selector, 5000);
      if (element && element instanceof HTMLVideoElement) {
        return element;
      }
    }

    return null;
  }

  private async automateVideo(video: HTMLVideoElement): Promise<Omit<VideoResult, 'success' | 'message'>> {    
    // Wait for video to load
    await this.waitForVideoLoad(video);
    
    // Set optimal speed
    video.playbackRate = this.defaultSpeed;
    this.logger.debug(`Set video speed to ${this.defaultSpeed}x`);
    
    // Start playback
    try {
      await video.play();
      this.logger.debug('Video playback started');
    } catch (error) {
      this.logger.warn('Could not start video playback:', error);
    }

    // Monitor progress
    const progressResult = await this.monitorVideoProgress(video);
    
    return {
      watchedDuration: progressResult.watchedTime,
      totalDuration: video.duration || 0,
      speed: this.defaultSpeed,
      completed: progressResult.completed
    };
  }

  private async waitForVideoLoad(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        resolve();
        return;
      }

      const onLoadedData = () => {
        video.removeEventListener('loadeddata', onLoadedData);
        resolve();
      };

      video.addEventListener('loadeddata', onLoadedData);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        video.removeEventListener('loadeddata', onLoadedData);
        resolve();
      }, 10000);
    });
  }

  private async monitorVideoProgress(video: HTMLVideoElement): Promise<{ completed: boolean; watchedTime: number }> {
    return new Promise((resolve) => {
      const startTime = video.currentTime;
      let maxWatchedTime = startTime;
      
      const checkProgress = () => {
        maxWatchedTime = Math.max(maxWatchedTime, video.currentTime);
        
        // Check if video is completed
        if (video.ended || video.currentTime >= video.duration - 1) {
          this.logger.info('Video completed');
          resolve({
            completed: true,
            watchedTime: video.duration
          });
          return;
        }

        // Check if video is paused for too long
        if (video.paused && !video.ended) {
          setTimeout(() => {
            if (video.paused && !video.ended) {
              try {
                video.play();
              } catch (error) {
                this.logger.warn('Could not resume video:', error);
              }
            }
          }, 2000);
        }

        setTimeout(checkProgress, this.checkInterval);
      };

      // Start monitoring
      checkProgress();

      // Safety timeout (30 minutes max)
      setTimeout(() => {
        this.logger.warn('Video monitoring timeout reached');
        resolve({
          completed: false,
          watchedTime: maxWatchedTime - startTime
        });
      }, 30 * 60 * 1000);
    });
  }
}
