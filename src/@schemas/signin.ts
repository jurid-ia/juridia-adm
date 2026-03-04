import { z } from "zod";

export const SigninValidationSchema = z.object({
  email: z.string().email({ message: "Email Inválido" }),
  password: z.string().min(1, "A senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

export type SigninValidationData = z.infer<typeof SigninValidationSchema>;
