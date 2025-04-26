"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COOKIE_OPTIONS = void 0;
exports.getCookieDomain = getCookieDomain;
exports.setCookieWithOptions = setCookieWithOptions;
exports.clearCookie = clearCookie;
exports.DEFAULT_COOKIE_OPTIONS = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
};
function getCookieDomain() {
    if (process.env.NODE_ENV === "production") {
        // Use cookie domain from environment variable if available
        // This improves cross-subdomain support while maintaining security
        const cookieDomain = process.env.COOKIE_DOMAIN;
        // Only use domain setting when explicitly configured
        return cookieDomain || undefined;
    }
    return undefined;
}
function setCookieWithOptions(c, name, value, options = {}) {
    const finalOptions = { ...exports.DEFAULT_COOKIE_OPTIONS, ...options };
    const domain = getCookieDomain();
    let cookie = `${name}=${value}; Path=${finalOptions.path}`;
    if (finalOptions.httpOnly)
        cookie += "; HttpOnly";
    if (finalOptions.secure)
        cookie += "; Secure";
    cookie += `; SameSite=${finalOptions.sameSite}; Max-Age=${finalOptions.maxAge}`;
    // Only add domain if explicitly set
    if (domain)
        cookie += `; Domain=${domain}`;
    c.header("Set-Cookie", cookie);
}
function clearCookie(c, name) {
    // Set cookie with past expiration to clear it
    let cookie = `${name}=; Path=/; Max-Age=0; HttpOnly`;
    if (process.env.NODE_ENV === "production")
        cookie += "; Secure";
    cookie += `; SameSite=${exports.DEFAULT_COOKIE_OPTIONS.sameSite}`;
    const domain = getCookieDomain();
    if (domain)
        cookie += `; Domain=${domain}`;
    c.header("Set-Cookie", cookie);
}
