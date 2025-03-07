/**
 * Application configuration
 */
export declare const config: {
    env: string;
    port: number;
    appName: string;
    frontendUrl: string;
    rateLimit: {
        standard: {
            window: number;
            max: number;
        };
        auth: {
            window: number;
            max: number;
        };
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string;
        methods: string[];
        allowedHeaders: string[];
    };
    database: {
        url: string;
    };
    supabase: {
        url: string;
        anonKey: string;
    };
    logging: {
        level: string;
    };
    server: {
        host: string;
        nodeEnv: string;
    };
    db: {
        directUrl: string | undefined;
    };
    corsOrigins: string[];
    email: {
        host: string | undefined;
        port: number;
        user: string | undefined;
        password: string | undefined;
        from: string;
    };
};
