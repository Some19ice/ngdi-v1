"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
const { combine, timestamp, printf, colorize } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }
    return msg;
});
exports.logger = winston_1.default.createLogger({
    level: config_1.config.env === "development" ? "debug" : "info",
    format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp(), logFormat),
        }),
    ],
});
// Create a stream for Morgan HTTP logging
exports.httpLogStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
// Log unhandled rejections
process.on("unhandledRejection", (reason) => {
    exports.logger.error("Unhandled Rejection", {
        error: reason,
    });
});
// Log uncaught exceptions
process.on("uncaughtException", (error) => {
    exports.logger.error("Uncaught Exception", {
        error,
    });
    // Give the logger time to write before exiting
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});
