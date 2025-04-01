import { config } from "../config"
import nodemailer from "nodemailer"

/**
 * Email service for sending verification and password reset emails
 */
class EmailService {
  /**
   * Send a verification email to a user
   * @param email Email address to send to
   * @param token Verification token
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // In a production environment, this would integrate with a real email service
    // For development, we just log the verification link
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`

    console.log(`📧 Verification email for ${email}:`)
    console.log(`Verification URL: ${verificationUrl}`)
    console.log(`Token: ${token}`)
  }

  /**
   * Send a password reset email to a user
   * @param email Email address to send to
   * @param token Password reset token
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // In a production environment, this would integrate with a real email service
    // For development, we just log the reset link
    const resetUrl = `${config.frontendUrl}/reset-password/${token}`

    console.log(`📧 Password reset email for ${email}:`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Token: ${token}`)
  }

  /**
   * Send a welcome email after registration
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = "Welcome to our platform"
    const html = `
      <h1>Welcome!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `

    await this.sendEmail(email, subject, html)
  }

  /**
   * Send an email using the configured email provider
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    // In a production environment, this would integrate with a real email service
    // For development, we just log the email
    console.log(`📧 Email to ${to}:`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${html}`)
  }
}

export const emailService = new EmailService()

/**
 * Helper function to send an email
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  // Create a test account if in development mode
  let testAccount
  let transporter

  if (config.env === "development" && !config.email.host) {
    // Create a test account using Ethereal Email for development
    testAccount = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  } else {
    // Use configured SMTP server
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    })
  }

  // Send email
  const info = await transporter.sendMail({
    from: `"${config.appName}" <${config.email.from}>`,
    to,
    subject,
    html,
  })

  // Log email URL in development mode
  if (config.env === "development" && testAccount) {
    console.log("Email sent: %s", info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  }
}
