import 'express-oauth2-jwt-bearer';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                payload: {
                    sub?: string;
                    aud?: string | string[];
                    iss?: string;
                    exp?: number;
                    iat?: number;
                    scope?: string;
                    permissions?: string[];
                    [key: string]: unknown;
                };
            };
        }
    }
}
