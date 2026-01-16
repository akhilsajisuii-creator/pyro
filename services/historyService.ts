
import { DetectionResult, DetectionStatus } from '../types';

const STORAGE_KEY = 'pyrowatch_history_v1';
const MAX_LOGS = 100;

export const historyService = {
  getLogs: (): DetectionResult[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },

  addLog: (entry: Omit<DetectionResult, 'id' | 'timestamp' | 'date' | 'time'>) => {
    const now = new Date();
    const newEntry: DetectionResult = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: now.toISOString(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const logs = historyService.getLogs();
    const updatedLogs = [newEntry, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    
    // Dispatch a custom event so other components know the history changed
    window.dispatchEvent(new Event('pyrowatch_history_updated'));
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('pyrowatch_history_updated'));
  }
};
