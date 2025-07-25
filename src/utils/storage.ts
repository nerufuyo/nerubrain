import { IStorage } from '../types/index';

export class ChromeStorage implements IStorage {
  private static instance: ChromeStorage;

  private constructor() {}

  public static getInstance(): ChromeStorage {
    if (!ChromeStorage.instance) {
      ChromeStorage.instance = new ChromeStorage();
    }
    return ChromeStorage.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }
}
