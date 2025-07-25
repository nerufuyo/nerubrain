import { ILogger } from '../types/index';

export class Logger implements ILogger {
  private static instance: Logger;
  private readonly prefix = '[Coursera Automation]';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, ...args: any[]): void {
    console.log(`${this.prefix} [INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} [WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} [ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    // Debug logging in development mode
    console.debug(`${this.prefix} [DEBUG] ${message}`, ...args);
  }
}
