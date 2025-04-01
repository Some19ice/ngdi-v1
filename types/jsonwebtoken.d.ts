declare module 'jsonwebtoken' {
  /**
   * Represents the options for signing a JWT
   */
  export interface SignOptions {
    /** Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", "7d" */
    expiresIn?: string | number;
    /** Not before expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", "7d" */
    notBefore?: string | number;
    /** Audience */
    audience?: string | string[];
    /** Issuer */
    issuer?: string;
    /** JWT ID */
    jwtid?: string;
    /** Subject */
    subject?: string;
    /** Token type */
    algorithm?: string;
    /** Key ID */
    keyid?: string;
    /** Callback for when token is noExpiration */
    noTimestamp?: boolean;
    /** Headers */
    header?: object;
    /** Encoding of the jwt */
    encoding?: string;
  }

  /**
   * Represents the options for verifying a JWT
   */
  export interface VerifyOptions {
    /** Expiration time in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", "7d" */
    maxAge?: string | number;
    /** Audience */
    audience?: string | RegExp | Array<string | RegExp>;
    /** Issuer */
    issuer?: string | string[];
    /** JWT ID */
    jwtid?: string;
    /** Subject */
    subject?: string;
    /** Check if the algorithm matches */
    algorithms?: string[];
    /** If true do not validate the expiration of the token */
    ignoreExpiration?: boolean;
    /** If true do not validate the notBefore of the token */
    ignoreNotBefore?: boolean;
    /** If true return the decoded header and payload even if the signature is invalid */
    allowInvalidSignature?: boolean;
    /** Clock tolerance in seconds */
    clockTolerance?: number;
    /** Clock timestamp to verify against */
    clockTimestamp?: number;
    /** Complete response */
    complete?: boolean;
    /** A custom function to verify the issuer */
    isIssuer?: (issuer: string) => boolean;
    /** A custom function to verify the audience */
    isAudience?: (audience: string) => boolean;
    /** A custom function to verify the subject */
    isSubject?: (subject: string) => boolean;
    /** A custom function to verify the jwtid */
    isJwtid?: (jwtid: string) => boolean;
  }

  /**
   * Result of a JWT verification
   */
  export interface JwtPayload {
    [key: string]: any;
    iat?: number;
    exp?: number;
    nbf?: number;
    aud?: string | string[];
    iss?: string;
    jti?: string;
    sub?: string;
  }

  /**
   * Result of a JWT verification with complete option
   */
  export interface JwtVerifyResult {
    header: { [key: string]: any };
    payload: JwtPayload;
    signature: string;
  }

  /**
   * Sign the given payload into a JSON Web Token
   * @param payload Payload to sign, could be an object literal, buffer or string
   * @param secretOrPrivateKey Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA
   * @param options Options for the signature
   * @returns The JSON Web Token string
   */
  export function sign(
    payload: string | Buffer | object, 
    secretOrPrivateKey: string | Buffer, 
    options?: SignOptions
  ): string;

  /**
   * Verify the given token using a secret or a public key to get a decoded token
   * @param token The JWT string to verify
   * @param secretOrPublicKey Either the secret for HMAC algorithms or the PEM encoded public key for RSA and ECDSA
   * @param options Options for the verification
   * @param callback Callback function
   * @returns Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. Otherwise returns an error.
   */
  export function verify(
    token: string, 
    secretOrPublicKey: string | Buffer, 
    options?: VerifyOptions
  ): JwtPayload;

  export function verify(
    token: string, 
    secretOrPublicKey: string | Buffer, 
    options: VerifyOptions & { complete: true }
  ): JwtVerifyResult;

  export function verify(
    token: string, 
    secretOrPublicKey: string | Buffer, 
    callback: (err: Error | null, decoded: JwtPayload | undefined) => void
  ): void;

  export function verify(
    token: string, 
    secretOrPublicKey: string | Buffer, 
    options: VerifyOptions, 
    callback: (err: Error | null, decoded: JwtPayload | undefined) => void
  ): void;

  export function verify(
    token: string, 
    secretOrPublicKey: string | Buffer, 
    options: VerifyOptions & { complete: true }, 
    callback: (err: Error | null, decoded: JwtVerifyResult | undefined) => void
  ): void;

  /**
   * Returns the decoded payload without verifying if the signature is valid
   * @param token JWT string to decode
   * @param options Options for decoding
   * @returns The decoded JWT
   */
  export function decode(
    token: string, 
    options?: { complete?: false; json?: boolean }
  ): JwtPayload | null;

  export function decode(
    token: string, 
    options: { complete: true; json?: boolean }
  ): JwtVerifyResult | null;
} 