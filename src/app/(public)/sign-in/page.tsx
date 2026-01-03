"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import SignInForm from "./components/SignInForm";

export default function SignInPage() {
  return (
    <>
      <div className="min-h-screen-ios bg-n-7 dark:bg-n-6 relative flex min-h-screen flex-col overflow-x-hidden bg-cover bg-center bg-no-repeat px-2 md:px-4 md:pt-6 md:pb-6 lg:flex-row lg:p-6">
        <div className="relative my-6 hidden w-full max-w-[45rem] items-center justify-center lg:flex lg:w-1/2 xl:max-w-[30rem] xl:p-10 2xl:max-w-[40rem]">
          <div className="block flex h-full min-h-[500px] w-full items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 text-white/50">
            <span className="text-2xl font-bold">Jurid-IA</span>
          </div>
        </div>

        <div className="bg-n-1 dark:bg-n-8 relative my-6 flex w-full grow items-center justify-center rounded-[1.25rem] p-10 md:my-0 md:p-6 lg:m-0 lg:mr-6 lg:w-1/2">
          <div className="m-auto w-full max-w-[31.5rem]">
            <div className="text-n-7 dark:text-n-1 mb-8 w-full text-center text-2xl font-bold">
              Jurid-IA Admin
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
      <ThemeSwitcher />
    </>
  );
}
