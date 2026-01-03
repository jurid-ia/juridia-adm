"use client";

import { Lawyer } from "@/@types/admin";
import { Button } from "@/components/ui/button";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ClientModal from "./_components/ClientModal";

export default function ClientsPage() {
  const api = useApiContext();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | undefined>(
    undefined,
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.listLawyers(api);
      setLawyers(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar advogados");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lawyer: Lawyer) => {
    setEditingLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLawyer(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Advogados</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Novo Advogado
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-n-1 p-6 shadow-sm dark:bg-n-7">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-n-3 text-n-4 dark:border-n-6">
                <th className="pb-4 font-semibold">Nome</th>
                <th className="pb-4 font-semibold">Email</th>
                <th className="pb-4 font-semibold">Escritório</th>
                <th className="pb-4 font-semibold">Role</th>
                <th className="pb-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lawyers.map((lawyer) => (
                <tr
                  key={lawyer.id}
                  className="border-b border-n-3/50 transition-colors hover:bg-n-2/50 dark:border-n-6/50 dark:hover:bg-n-6/50"
                >
                  <td className="py-4 font-semibold text-n-7 dark:text-n-1">
                    {lawyer.name}
                  </td>
                  <td className="py-4 text-n-4">{lawyer.email}</td>
                  <td className="py-4 font-medium">
                    {lawyer.lawFirm?.name || "Sem escritório"}
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        lawyer.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {lawyer.role}
                    </span>
                  </td>
                  <td className="flex gap-2 py-4">
                    <Button
                      onClick={() => handleEdit(lawyer)}
                      variant="secondary"
                      className="h-8 px-3 text-xs"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && lawyers.length === 0 && (
          <div className="py-8 text-center text-n-4">
            Nenhum advogado encontrado.
          </div>
        )}
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        lawyer={editingLawyer}
      />
    </div>
  );
}
