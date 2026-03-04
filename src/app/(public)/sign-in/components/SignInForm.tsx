"use client";

import { Button } from "@/components/ui/button";
import Field from "@/components/ui/field";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useApiContext } from "@/context/ApiContext";
import { authService } from "@/services/auth/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  SigninValidationData,
  SigninValidationSchema,
} from "@/@schemas/signin";
import { Checkbox } from "@/components/ui/checkbox";
import { getTokenCookieOptions } from "@/lib/auth-cookies";

type SignInFormProps = {
  // Add props if needed
};

const SignInForm = ({}: SignInFormProps) => {
  const cookies = useCookies();
  const router = useRouter();
  const { setToken } = useApiContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<SigninValidationData>({
    resolver: zodResolver(SigninValidationSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SigninValidationData) => {
    setIsLoggingIn(true);
    try {
      // Enviar apenas email e senha à API (não enviar rememberMe)
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      const rememberMe = data.rememberMe ?? true;
      // Gravar token no cookie com duração conforme "Lembrar de mim" (90d ou 7d)
      setToken(response.accessToken, rememberMe);

      if (response.user) {
        const cookieOptions = getTokenCookieOptions(rememberMe);
        cookies.set("user", JSON.stringify(response.user), cookieOptions);
      }

      toast.success(`Bem vindo, ${response.user?.name || "Admin"}`);
      router.push("/clients");
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "Erro ao fazer login";
      toast.error(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4" onKeyDown={handleKeyPress}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Field
                classInput="dark:bg-n-6 dark:border-n-7 dark:focus:bg-transparent"
                placeholder="Email"
                icon="email"
                value={field.value}
                onChange={field.onChange}
                required
                className="w-full"
              />
              <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Field
                classInput="dark:bg-n-6 dark:border-n-7 dark:focus:bg-transparent"
                placeholder="Senha"
                icon="lock"
                type="password"
                value={field.value}
                onChange={field.onChange}
                required
                className="w-full"
              />
              <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <Checkbox
                id="rememberMe"
                checked={field.value ?? false}
                onCheckedChange={(checked) =>
                  field.onChange(checked === true)
                }
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none text-n-4 dark:text-n-3 cursor-pointer"
              >
                Lembrar de mim
              </label>
            </FormItem>
          )}
        />
      </div>

      <button
        className="base2 mb-6 w-fit text-left text-secondary-1 transition-colors hover:text-secondary-1/90 md:mb-3"
        type="button"
        // onClick={() => toast("Funcionalidade de recuperação de senha (Mock)")}
      >
        Esqueceu a senha?
      </button>

      <Button
        onClick={form.handleSubmit(onSubmit)}
        disabled={isLoggingIn}
        variant="secondary"
        className="btn-large w-full md:mb-4"
      >
        {isLoggingIn ? <Loader2 className="mr-2 animate-spin" /> : null}
        {isLoggingIn ? "Entrando..." : "Acessar Administrativo"}
      </Button>
    </Form>
  );
};

export default SignInForm;
