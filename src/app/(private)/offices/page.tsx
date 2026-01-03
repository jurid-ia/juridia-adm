"use client";

import { Office } from "@/@types/admin";
import { Button } from "@/components/ui/button";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OfficeModal from "./_components/OfficeModal";

export default function OfficesPage() {
  const api = useApiContext();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.listOffices(api);
      setOffices(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar escritórios");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (office: Office) => {
      setEditingOffice(office);
      setIsModalOpen(true);
  }

  const handleCreate = () => {
      setEditingOffice(undefined);
      setIsModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Escritórios</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Novo Escritório
        </Button>
      </div>

      <div className="bg-n-1 dark:bg-n-7 rounded-xl p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-n-3 dark:border-n-6 text-n-4">
                <th className="pb-4 font-semibold">Nome</th>
                <th className="pb-4 font-semibold">CNPJ</th>
                <th className="pb-4 font-semibold">Localização</th>
                <th className="pb-4 font-semibold">Advogados</th>
                <th className="pb-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((office) => (
                <tr
                  key={office.id}
                  className="border-b border-n-3/50 dark:border-n-6/50 hover:bg-n-2/50 dark:hover:bg-n-6/50 transition-colors cursor-pointer group"
                  onClick={() => handleEdit(office)}
                >
                  <td className="py-4 font-semibold text-n-7 dark:text-n-1">{office.name}</td>
                  <td className="py-4 text-n-4">{office.cnpj || "-"}</td>
                  <td className="py-4 text-n-4">{office.address}, {office.number}</td>
                  <td className="py-4 font-medium">
                    {office._count?.lawyers || 0}
                  </td>
                  <td className="py-4">
                      <Button onClick={(e) => { e.stopPropagation(); handleEdit(office); }} variant="secondary" className="h-8 px-3 text-xs">Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && offices.length === 0 && (
            <div className="text-center text-n-4 py-8">Nenhum escritório encontrado.</div>
        )}
      </div>

      <OfficeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        office={editingOffice}
      />
    </div>
  );
}
