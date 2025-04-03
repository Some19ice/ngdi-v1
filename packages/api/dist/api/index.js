"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vercel_1 = require("hono/vercel");
const src_1 = __importDefault(require("../src"));
// Export the handler function for Vercel serverless
exports.default = (0, vercel_1.handle)(src_1.default);
