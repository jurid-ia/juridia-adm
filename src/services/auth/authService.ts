// Payload enviado à API: apenas email e senha (não enviar rememberMe)
interface LoginPayload {
  email: string;
  password: string;
}

async function login(data: LoginPayload): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      },
    );

    if (!response.ok) {
      // Try to parse error message
      const err = await response.json();
      throw new Error(err.message || "Erro ao realizar login");
    }

    const result = await response.json();

    // The backend returns { accessToken, user: {...} }
    // Token handling is done by the caller (SignInForm) using next-client-cookies

    return result;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/** Chamada opcional à API de logout (auditoria/uso futuro). Não bloqueia o fluxo de saída. */
async function logout(accessToken: string): Promise<void> {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    // Ignora erro; logout no cliente segue normalmente
  }
}

export const authService = {
  login,
  logout,
};
