"use client";

import Icon from "@/components/ui/icon";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useCookies } from "next-client-cookies";
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

  const navigation = [
    {
      title: "Clientes",
      icon: "profile",
      url: "/clients",
    },
    {
      title: "Assinaturas",
      icon: "card",
      url: "/subscriptions",
      // disable: true,
    },
    {
      title: "Notas Fiscais",
      icon: "doc",
      url: "/fiscal",
    },
    {
      title: "Escritórios",
      icon: "briefcase",
      url: "/offices",
    },
  ];

  const handleClick = () => {
    setValue(!value);
  };

  return (
    <div
      className={twMerge(
        `fixed bottom-0 left-0 top-0 z-20 flex flex-col bg-n-7 px-4 pt-30 transition-all duration-300 dark:bg-n-6 ${
          value ? "w-24" : "w-80"
        }`,
      )}
    >
      <div
        className={`absolute left-0 top-0 flex h-30 w-full items-center ${
          value ? "justify-center" : "justify-between px-6"
        }`}
      >
        {!value && <div className="text-xl font-bold text-n-1">Jurid-IA</div>}
        <button className="group tap-highlight-color" onClick={handleClick}>
          <Icon
            className="fill-white transition-colors group-hover:fill-n-3"
            name={value ? "toggle-on" : "toggle-off"}
          />
        </button>
      </div>

      <div className="mt-20 w-full grow overflow-y-auto scroll-smooth scrollbar-none">
        <div className="flex flex-col gap-2">
          {navigation.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className={cn(
                "flex h-12 items-center rounded-lg text-n-3 transition-colors hover:bg-n-2/10 hover:text-n-1",
                pathname === item.url && "bg-n-2/20 text-n-1",
                value ? "justify-center px-0" : "px-4",
              )}
            >
              <Icon
                name={item.icon}
                className={cn("fill-current", value ? "mr-0" : "mr-4")}
              />
              {!value && (
                <span className="base2 font-semibold">{item.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-n-7 px-4 pb-6 dark:bg-n-6">
        <button
          className={twMerge(
            `base2 flex h-12 w-full items-center rounded-lg font-semibold text-white transition-colors hover:text-n-3`,
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
          <LogOut />
          {!value && <div className="ml-5">Sair</div>}
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
