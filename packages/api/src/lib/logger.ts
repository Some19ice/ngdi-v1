import winston from "winston"
import { config } from "../config"

const { combine, timestamp, printf, colorize } = winston.format

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata)
  }
  return msg
})

export const logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
  ],
})

// Create a stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}

// Log unhandled rejections
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection", {
    error: reason,
  })
})

// Log uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", {
    error,
  })
  // Give the logger time to write before exiting
  setTimeout(() => {
    process.exit(1)
  }, 1000)
})
