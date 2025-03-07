"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const config_1 = require("../config");
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Email service for sending transactional emails
 */
exports.emailService = {
    /**
     * Send an email verification link
     */
    sendVerificationEmail: async (email, name, token) => {
        const verificationUrl = `${config_1.config.frontendUrl}/verify-email?token=${token}`;
        const subject = "Verify your email address";
        const html = `
      <h1>Email Verification</h1>
      <p>Hello ${name},</p>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `;
        await sendEmail(email, subject, html);
    },
    /**
     * Send a password reset link
     */
    sendPasswordResetEmail: async (email, token) => {
        const resetUrl = `${config_1.config.frontendUrl}/reset-password?token=${token}`;
        const subject = "Reset your password";
        const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;
        await sendEmail(email, subject, html);
    },
    /**
     * Send a welcome email after registration
     */
    sendWelcomeEmail: async (email, name) => {
        const subject = "Welcome to our platform";
        const html = `
      <h1>Welcome!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `;
        await sendEmail(email, subject, html);
    },
};
/**
 * Helper function to send an email
 */
async function sendEmail(to, subject, html) {
    // Create a test account if in development mode
    let testAccount;
    let transporter;
    if (config_1.config.env === "development" && !config_1.config.email.host) {
        // Create a test account using Ethereal Email for development
        testAccount = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
    else {
        // Use configured SMTP server
        transporter = nodemailer_1.default.createTransport({
            host: config_1.config.email.host,
            port: config_1.config.email.port,
            secure: config_1.config.email.port === 465, // true for 465, false for other ports
            auth: {
                user: config_1.config.email.user,
                pass: config_1.config.email.password,
            },
        });
    }
    // Send email
    const info = await transporter.sendMail({
        from: `"${config_1.config.appName}" <${config_1.config.email.from}>`,
        to,
        subject,
        html,
    });
    // Log email URL in development mode
    if (config_1.config.env === "development" && testAccount) {
        console.log("Email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    }
}
