type LogLevel = 'info' | 'warn' | 'error'

interface LogMessage {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
}

class Logger {
  private static instance: Logger
  private logQueue: LogMessage[] = []
  private isProcessing = false

  private constructor() {
    // Initialize logger
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private async processQueue() {
    if (this.isProcessing || this.logQueue.length === 0) return

    this.isProcessing = true
    const batch = this.logQueue.splice(0, 10)

    try {
      // Send logs to your logging service (e.g., Vercel, DataDog, etc.)
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
    } catch (error) {
      console.error('Failed to send logs:', error)
      // Re-add failed logs to queue
      this.logQueue.unshift(...batch)
    }

    this.isProcessing = false
    if (this.logQueue.length > 0) {
      this.processQueue()
    }
  }

  log(level: LogLevel, message: string, data?: any) {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    }

    this.logQueue.push(logMessage)
    this.processQueue()

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console[level](message, data)
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }
}

export const logger = Logger.getInstance() 