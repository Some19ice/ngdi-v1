/**
 * Logging Utilities
 * 
 * This module provides utilities for logging events in the application.
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
}

// Maximum number of logs to keep in memory
const MAX_LOGS = 1000;

// In-memory log storage
const logs: LogEntry[] = [];

/**
 * Log a message
 * @param level Log level
 * @param message Log message
 * @param context Additional context
 * @param userId User ID if available
 */
export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  userId?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    userId,
  };
  
  // Add to in-memory logs
  logs.unshift(entry);
  
  // Trim logs if needed
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }
  
  // Log to console
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(message, context);
      break;
    case LogLevel.INFO:
      console.info(message, context);
      break;
    case LogLevel.WARN:
      console.warn(message, context);
      break;
    case LogLevel.ERROR:
      console.error(message, context);
      break;
  }
  
  // In a real application, we would also send logs to a server
  // sendLogsToServer(entry);
}

/**
 * Log a debug message
 * @param message Log message
 * @param context Additional context
 * @param userId User ID if available
 */
export function debug(
  message: string,
  context?: Record<string, any>,
  userId?: string
): void {
  log(LogLevel.DEBUG, message, context, userId);
}

/**
 * Log an info message
 * @param message Log message
 * @param context Additional context
 * @param userId User ID if available
 */
export function info(
  message: string,
  context?: Record<string, any>,
  userId?: string
): void {
  log(LogLevel.INFO, message, context, userId);
}

/**
 * Log a warning message
 * @param message Log message
 * @param context Additional context
 * @param userId User ID if available
 */
export function warn(
  message: string,
  context?: Record<string, any>,
  userId?: string
): void {
  log(LogLevel.WARN, message, context, userId);
}

/**
 * Log an error message
 * @param message Log message
 * @param context Additional context
 * @param userId User ID if available
 */
export function error(
  message: string,
  context?: Record<string, any>,
  userId?: string
): void {
  log(LogLevel.ERROR, message, context, userId);
}

/**
 * Get all logs
 * @returns All logs
 */
export function getLogs(): LogEntry[] {
  return [...logs];
}

/**
 * Get logs by level
 * @param level Log level
 * @returns Logs of the specified level
 */
export function getLogsByLevel(level: LogLevel): LogEntry[] {
  return logs.filter(entry => entry.level === level);
}

/**
 * Get logs by user
 * @param userId User ID
 * @returns Logs for the specified user
 */
export function getLogsByUser(userId: string): LogEntry[] {
  return logs.filter(entry => entry.userId === userId);
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logs.length = 0;
}
