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
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
};
function getCookieDomain() {
    if (process.env.NODE_ENV === "production") {
        // Use exactly what's specified in the environment variable
        return process.env.COOKIE_DOMAIN || undefined;
    }
    return undefined;
}
function setCookieWithOptions(c, name, value, options = {}) {
    const finalOptions = { ...exports.DEFAULT_COOKIE_OPTIONS, ...options };
    // For same-domain setup, we don't set the domain attribute
    // The browser will automatically scope it to the exact origin
    let cookie = `${name}=${value}; Path=${finalOptions.path}`;
    if (finalOptions.httpOnly)
        cookie += "; HttpOnly";
    if (finalOptions.secure)
        cookie += "; Secure";
    cookie += `; SameSite=${finalOptions.sameSite}; Max-Age=${finalOptions.maxAge}`;
    // We deliberately omit the Domain attribute for same-domain cookies
    c.header("Set-Cookie", cookie);
}
function clearCookie(c, name) {
    setCookieWithOptions(c, name, "", { maxAge: 0 });
}
