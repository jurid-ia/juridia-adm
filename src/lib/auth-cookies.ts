/**
 * Helpers para cookie de autenticação (token) com persistência de 90 dias.
 * Nome do cookie configurável via NEXT_PUBLIC_USER_TOKEN.
 */

const TOKEN_COOKIE_DAYS = 90;

export function getTokenCookieName(): string {
  return process.env.NEXT_PUBLIC_USER_TOKEN || "token";
}

export function getTokenCookieOptions(): {
  path: string;
  expires: Date;
  sameSite: "lax";
} {
  const expires = new Date();
  expires.setDate(expires.getDate() + TOKEN_COOKIE_DAYS);
  return {
    path: "/",
    expires,
    sameSite: "lax",
  };
}
