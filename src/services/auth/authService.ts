import { SigninValidationData } from "@/@schemas/signin";

// "Login" that hits the real backend
async function login(data: SigninValidationData): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

export const authService = {
  login,
};
