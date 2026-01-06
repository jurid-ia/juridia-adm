type ApiResponse = { status: number; body: any };

/**
 * Processa response da API de forma padronizada
 * @throws Error se response não for sucesso (200-299)
 */
export function handleApiResponse<T = any>(response: ApiResponse): T {
  if (response.status >= 200 && response.status < 300) {
    return response.body;
  }
  throw new Error(JSON.stringify(response.body));
}
