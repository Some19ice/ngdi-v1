"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const config_1 = require("../config");
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Email service for sending verification and password reset emails
 */
class EmailService {
    /**
     * Send a verification email to a user
     * @param email Email address to send to
     * @param token Verification token
     */
    async sendVerificationEmail(email, token) {
        // In a production environment, this would integrate with a real email service
        // For development, we just log the verification link
        const verificationUrl = `${config_1.config.frontendUrl}/verify-email?token=${token}`;
        console.log(`📧 Verification email for ${email}:`);
        console.log(`Verification URL: ${verificationUrl}`);
        console.log(`Token: ${token}`);
    }
    /**
     * Send a password reset email to a user
     * @param email Email address to send to
     * @param token Password reset token
     */
    async sendPasswordResetEmail(email, token) {
        // In a production environment, this would integrate with a real email service
        // For development, we just log the reset link
        const resetUrl = `${config_1.config.frontendUrl}/reset-password/${token}`;
        console.log(`📧 Password reset email for ${email}:`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`Token: ${token}`);
    }
    /**
     * Send a welcome email after registration
     */
    async sendWelcomeEmail(email, name) {
        const subject = "Welcome to our platform";
        const html = `
      <h1>Welcome!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `;
        await this.sendEmail(email, subject, html);
    }
    /**
     * Send an email using the configured email provider
     * @param to Recipient email address
     * @param subject Email subject
     * @param html Email HTML content
     */
    async sendEmail(to, subject, html) {
        // In a production environment, this would integrate with a real email service
        // For development, we just log the email
        console.log(`📧 Email to ${to}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
    }
}
exports.emailService = new EmailService();
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
