"use client";

import { Button } from "@/components/ui/button";
import Field from "@/components/ui/field";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useApiContext } from "@/context/ApiContext";
import { authService } from "@/services/auth/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  SigninValidationData,
  SigninValidationSchema,
} from "@/@schemas/signin";

// ... imports

type SignInFormProps = {
  // Add props if needed
};

const SignInForm = ({}: SignInFormProps) => {
  const cookies = useCookies();
  const router = useRouter();
  const { setToken } = useApiContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SigninValidationData>({
    resolver: zodResolver(SigninValidationSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SigninValidationData) => {
    setIsLoggingIn(true);
    try {
      console.log("data: ", data)
      // authService.login now expects the whole data object
      const response = await authService.login(data);
      console.log("response: ", response)
      // response should contain { accessToken, user }
      setToken(response.accessToken);
      cookies.set("token", response.accessToken);

      if (response.user) {
        cookies.set("user", JSON.stringify(response.user));
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
              <div className="relative">
                <Field
                  classInput="dark:bg-n-6 dark:border-n-7 dark:focus:bg-transparent pr-10"
                  placeholder="Senha"
                  icon="lock"
                  type={showPassword ? "text" : "password"}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3.5 flex items-center pr-3.5 text-n-4"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
            </FormItem>
          )}
        />
      </div>

      <button
        className="base2 mb-6 w-fit text-left text-secondary-1 transition-colors hover:text-secondary-1/90 md:mb-3"
        type="button"
        onClick={() => toast("Funcionalidade de recuperação de senha (Mock)")}
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
