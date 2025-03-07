/**
 * CORS configuration for the API
 */
export declare const corsOptions: {
    origin: (origin: string | undefined) => boolean;
    credentials: boolean;
    allowMethods: string[];
    allowHeaders: string[];
    exposeHeaders: string[];
    maxAge: number;
};
