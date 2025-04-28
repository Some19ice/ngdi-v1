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
   * @param name Optional user's name
   */
  async sendVerificationEmail(
    email: string,
    token: string,
    name?: string
  ): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`
    const userName = name || email.split("@")[0]

    const subject = "Please verify your email address"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `

    // In development mode, just log the email
    if (config.env === "development") {
      console.log(`📧 Verification email for ${email}:`)
      console.log(`Verification URL: ${verificationUrl}`)
      console.log(`Token: ${token}`)
    }

    // Send the actual email
    try {
      await this.sendEmail(email, subject, html)
    } catch (error) {
      console.error(`Failed to send verification email to ${email}:`, error)
      // In development, make sure we still log the token
      if (config.env === "development") {
        console.log(`[DEV] Verification token for ${email}: ${token}`)
      }
      throw error
    }
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${config.appName}!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>If you have any questions, please don't hesitate to contact our support team at ${config.email.from}.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `

    await this.sendEmail(email, subject, html)
  }

  /**
   * Send a verification success email
   */
  async sendVerificationSuccessEmail(
    email: string,
    name?: string
  ): Promise<void> {
    const userName = name || email.split("@")[0]

    const subject = "Email Verification Successful"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verified Successfully</h2>
        <p>Hello ${userName},</p>
        <p>Your email address has been successfully verified. Thank you!</p>
        <p>You now have full access to all features of our platform.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `

    try {
      await this.sendEmail(email, subject, html)
    } catch (error) {
      console.error(
        `Failed to send verification success email to ${email}:`,
        error
      )
    }
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
