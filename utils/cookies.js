// Cookie utility functions for secure token management

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
};

export function setAuthCookie(token) {
  if (typeof document === "undefined") return;

  const options = [];
  options.push(`${COOKIE_NAME}=${encodeURIComponent(token)}`);
  options.push(`path=${COOKIE_OPTIONS.path}`);
  options.push(`max-age=${COOKIE_OPTIONS.maxAge}`);
  options.push(`SameSite=${COOKIE_OPTIONS.sameSite}`);

  if (COOKIE_OPTIONS.secure) {
    options.push("Secure");
  }

  document.cookie = options.join("; ");
}

export function getAuthCookie() {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function removeAuthCookie() {
  if (typeof document === "undefined") return;

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=strict`;
}

export { COOKIE_NAME };
