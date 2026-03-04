/**
 * Helpers para cookie de autenticação (token) conforme AUTHENTICATION_FLOW.md.
 * Nome do cookie configurável via NEXT_PUBLIC_USER_TOKEN.
 * Com "Lembrar de mim": 90 dias; sem: 7 dias (sessão).
 */

const COOKIE_DAYS_REMEMBER_ME = 90;
const COOKIE_DAYS_SESSION = 7;

export function getTokenCookieName(): string {
  return process.env.NEXT_PUBLIC_USER_TOKEN || "token";
}

export function getTokenCookieOptions(rememberMe: boolean = true): {
  path: string;
  expires: Date;
  sameSite: "lax";
  secure?: boolean;
} {
  const days = rememberMe ? COOKIE_DAYS_REMEMBER_ME : COOKIE_DAYS_SESSION;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return {
    path: "/",
    expires,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}
