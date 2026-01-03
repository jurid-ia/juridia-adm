/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import axios from "axios";
import { useCookies } from "next-client-cookies";
import { createContext, useContext, useState } from "react";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

interface ApiContextProps {
  PostAPI: (
    url: string,
    data: unknown,
    auth: boolean,
  ) => Promise<{ status: number; body: any }>;
  GetAPI: (
    url: string,
    auth: boolean,
  ) => Promise<{ status: number; body: any }>;
  PutAPI: (
    url: string,
    data: unknown,
    auth: boolean,
  ) => Promise<{ status: number; body: any }>;
  PatchAPI: (
    url: string,
    data: unknown,
    auth: boolean,
  ) => Promise<{ status: number; body: any }>;
  DeleteAPI: (
    url: string,
    auth: boolean,
  ) => Promise<{ status: number; body: any }>;
  setToken: (token: string) => void;
}

const ApiContext = createContext<ApiContextProps | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

export const ApiContextProvider = ({ children }: ProviderProps) => {
  const cookies = useCookies();
  const [token, setTokenState] = useState<string | undefined>(cookies.get("token"));

  const api = axios.create({
    baseURL,
  });

  const setToken = (newToken: string) => {
      setTokenState(newToken);
      // Ensure cookie is also synced if not already
      cookies.set("token", newToken); 
  };

  function config(auth: boolean) {
    // Attempt to get from state, fallback to cookie (for initial load consistency)
    const currentToken = token || cookies.get("token");
    return {
      headers: {
        Authorization: auth ? `Bearer ${currentToken}` : "",
        "ngrok-skip-browser-warning": "any",
      },
    };
  }

   async function PostAPI(url: string, data: unknown, auth: boolean) {
    const connect = await api
      .post(url, data, config(auth))
      .then(({ data }) => {
        return {
          status: 200,
          body: data,
        };
      })
      .catch((err) => {
        const message = err.response?.data || "Erro desconhecido";
        const status = err.response?.status || 500;
        return { status, body: message };
      });

    return connect;
  }

  async function GetAPI(url: string, auth: boolean) {
    const connect = await api
      .get(url, config(auth))
      .then(({ data }) => {
        return {
          status: 200,
          body: data,
        };
      })
      .catch((err) => {
        const message = err.response?.data || "Erro desconhecido";
        const status = err.response?.status || 500;
        return { status, body: message };
      });

    return connect;
  }

  async function PutAPI(url: string, data: unknown, auth: boolean) {
    const connect = await api
      .put(url, data, config(auth))
      .then(({ data }) => {
        return {
          status: 200,
          body: data,
        };
      })
      .catch((err) => {
        const message = err.response?.data || "Erro desconhecido";
        const status = err.response?.status || 500;
        return { status, body: message };
      });

    return connect;
  }

  async function DeleteAPI(url: string, auth: boolean) {
    const connect = await api
      .delete(url, config(auth))
      .then(({ data }) => {
        return {
          status: 200,
          body: data,
        };
      })
      .catch((err) => {
        const message = err.response?.data || "Erro desconhecido";
        const status = err.response?.status || 500;
        return { status, body: message };
      });

    return connect;
  }

  async function PatchAPI(url: string, data: unknown, auth: boolean) {
    const connect = await api
      .patch(url, data, config(auth))
      .then(({ data }) => {
        return {
          status: 200,
          body: data,
        };
      })
      .catch((err) => {
        const message = err.response?.data || "Erro desconhecido";
        const status = err.response?.status || 500;
        return { status, body: message };
      });

    return connect;
  }

  return (
    <ApiContext.Provider
      value={{
        PostAPI,
        GetAPI,
        PutAPI,
        PatchAPI,
        DeleteAPI,
        setToken,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export function useApiContext() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error(
      "useApiContext deve ser usado dentro de um ApiContextProvider",
    );
  }
  return context;
}
