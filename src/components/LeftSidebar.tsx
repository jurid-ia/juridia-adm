"use client";

import { useEffect, useState } from "react";

import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import {
  Building2,
  CreditCard,
  Handshake,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users
} from "lucide-react";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

type LeftSidebarProps = {
  value: boolean;
  setValue?: any;
};

const LeftSidebar = ({ value, setValue }: LeftSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const cookies = useCookies();
  const { setToken } = useApiContext();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check cookies or system preference
    const savedTheme = cookies.get("theme") as "light" | "dark" | undefined;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(systemTheme);
        document.documentElement.setAttribute("data-theme", systemTheme);
    }
  }, [cookies]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    cookies.set("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const navigation = [
    {
      title: "Clientes",
      icon: Users,
      url: "/clients",
    },
    {
      title: "Assinaturas",
      icon: CreditCard,
      url: "/subscriptions",
    },
    // {
    //   title: "Notas Fiscais",
    //   icon: FileText,
    //   url: "/fiscal",
    // },
    {
      title: "Escritórios",
      icon: Building2,
      url: "/offices",
    },
    {
      title: "Parceiros",
      icon: Handshake, 
      url: "/partners",
    },
  ];

  const handleClick = () => {
    setValue(!value);
  };

  return (
    <div
      className={twMerge(
        `fixed bottom-0 left-0 top-0 z-20 flex flex-col bg-n-1 border-r border-n-3 dark:border-n-6 px-4 pt-30 transition-all duration-300 dark:bg-n-6 ${
          value ? "w-24" : "w-80"
        }`,
      )}
    >
      <div
        className={`absolute left-0 top-0 flex h-30 w-full items-center ${
          value ? "justify-center" : "justify-between px-6"
        }`}
      >
        {!value && (
            <div className="flex items-center justify-start w-full">
                {/* Logo for Light Mode */}
                <div className="relative h-10 w-full dark:hidden">
                    <Image 
                        src="/logo/logo.png" 
                        alt="Jurid IA" 
                        fill 
                        className="object-contain object-left"
                        priority
                        unoptimized
                    />
                </div>
                {/* Logo for Dark Mode */}
                <div className="relative h-10 w-full hidden dark:block">
                    <Image 
                        src="/logo/logo-white.png" 
                        alt="Jurid IA" 
                        fill 
                        className="object-contain object-left"
                        priority
                        unoptimized
                    />
                </div>
            </div>
        )}
        <button className="group tap-highlight-color" onClick={handleClick}>
          <Menu 
             className="w-6 h-6 text-n-4 transition-colors group-hover:text-n-7 dark:text-n-3 dark:group-hover:text-n-1"
          />
        </button>
      </div>

      <div className="mt-6 w-full grow overflow-y-auto scroll-smooth scrollbar-none">
        <div className="flex flex-col gap-2">
          {navigation.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className={cn(
                "flex h-12 items-center rounded-lg text-n-4 transition-colors hover:bg-n-2 hover:text-n-7 dark:text-n-3 dark:hover:bg-n-8/50 dark:hover:text-n-1",
                pathname === item.url && "bg-n-2 text-n-7 dark:bg-n-8 dark:text-n-1",
                value ? "justify-center px-0" : "px-4",
              )}
            >
              <item.icon
                className={cn("w-6 h-6", value ? "mr-0" : "mr-4")}
              />
              {!value && (
                <span className="base2 font-semibold">{item.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-n-1 border-t border-n-3 dark:border-n-6 px-4 py-6 dark:bg-n-6">
        <button
            className={twMerge(
                `base2 mb-2 flex h-12 w-full items-center rounded-lg font-semibold text-n-4 transition-colors hover:text-n-7 hover:bg-n-2 dark:text-n-3 dark:hover:text-n-1 dark:hover:bg-n-8`,
                value ? "justify-center" : "px-5",
            )}
            onClick={toggleTheme}
        >
            {theme === "light" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            {!value && <div className="ml-5">{theme === "light" ? "Modo Claro" : "Modo Escuro"}</div>}
        </button>

        <button
          className={twMerge(
            `base2 flex h-12 w-full items-center rounded-lg font-semibold text-n-4 transition-colors hover:text-n-7 hover:bg-n-2 dark:text-n-3 dark:hover:text-n-1 dark:hover:bg-n-8`,
            value ? "justify-center" : "px-5",
          )}
          onClick={() => {
            if (confirm("Tem certeza que deseja sair?")) {
              cookies.remove("token");
              // setToken(""); // Optional
              router.push("/sign-in");
            }
          }}
        >
          <LogOut className="w-6 h-6" />
          {!value && <div className="ml-5">Sair</div>}
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
