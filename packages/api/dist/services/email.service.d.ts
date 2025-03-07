/**
 * Email service for sending transactional emails
 */
export declare const emailService: {
    /**
     * Send an email verification link
     */
    sendVerificationEmail: (email: string, name: string, token: string) => Promise<void>;
    /**
     * Send a password reset link
     */
    sendPasswordResetEmail: (email: string, token: string) => Promise<void>;
    /**
     * Send a welcome email after registration
     */
    sendWelcomeEmail: (email: string, name: string) => Promise<void>;
};
