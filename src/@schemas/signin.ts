import { z } from "zod";

export const SigninValidationSchema = z.object({
  email: z.string().email({ message: "Email Inválido" }),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type SigninValidationData = z.infer<typeof SigninValidationSchema>;
