"use client";

import { Lawyer, Office } from "@/@types/admin";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { DebouncedSearchInput } from "@/components/ui/DebouncedSearchInput";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ClientModal from "./_components/ClientModal";

export default function ClientsPage() {
  const api = useApiContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lawFirmIdFromUrl = searchParams.get("lawFirmId");

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | undefined>(undefined);

  // Pagination & Search State (search fica só no DebouncedSearchInput para evitar re-render da página a cada tecla)
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Filter States (officeFilter pode vir da URL ao navegar da tela de escritórios)
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [officeFilter, setOfficeFilter] = useState(lawFirmIdFromUrl ?? "ALL");
  
  // Sort State
  const [sort, setSort] = useState({ by: "name", order: "asc" as 'asc' | 'desc' });
  
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  // Sincronizar filtro por escritório quando a URL tiver lawFirmId (ex.: link "Ver advogados" na tela de escritórios)
  useEffect(() => {
    if (lawFirmIdFromUrl) setOfficeFilter(lawFirmIdFromUrl);
  }, [lawFirmIdFromUrl]);

  // Load offices list
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const response = await adminService.listOffices(api, { limit: 1000 });
        setOffices(response.data);
      } catch (error) {
        console.error("Erro ao carregar escritórios:", error);
      }
    };
    loadOffices();
  }, []);

  const handleDebouncedSearch = useCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, []);

  // Load data when page, debouncedSearch, filters or sort changes
  useEffect(() => {
    loadData();
  }, [page, debouncedSearch, roleFilter, officeFilter, sort]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        search: debouncedSearch,
        sortBy: sort.by,
        sortOrder: sort.order,
      };
      
      // Add filters if selected (skip "ALL")
      if (roleFilter && roleFilter !== "ALL") params.role = roleFilter;
      if (officeFilter && officeFilter !== "ALL") params.lawFirmId = officeFilter;
      
      const response = await adminService.listLawyers(api, params);
      setLawyers(response.data);
      setMeta(response.meta);
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

  const handleSort = (key: string) => {
    setSort(prev => ({
      by: key,
      order: prev.by === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setRoleFilter("ALL");
    setOfficeFilter("ALL");
    setPage(1);
    // Remove lawFirmId da URL ao limpar filtros
    if (lawFirmIdFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("lawFirmId");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    }
  };

  const hasActiveFilters = 
    (roleFilter && roleFilter !== "ALL") || 
    (officeFilter && officeFilter !== "ALL");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Advogados</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Novo Advogado
        </Button>
      </div>

      {/* Search Input: estado local no componente evita re-render da página a cada tecla */}
      <DebouncedSearchInput
        placeholder="Buscar advogado por nome ou email..."
        onDebouncedChange={handleDebouncedSearch}
        delay={500}
      />

      {/* Filters */}
      <div className="bg-n-2/30 dark:bg-n-8/50 rounded-xl p-4 border border-n-3/50 dark:border-n-6/50">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-n-4" />
          <span className="text-sm font-semibold text-n-7 dark:text-n-1">
            Filtros
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-primary-1 hover:text-primary-1/80 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Tipo de Usuário</label>
            <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="USER">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Escritório</label>
            <Select value={officeFilter} onValueChange={(value) => { setOfficeFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os escritórios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-n-1 p-6 shadow-sm dark:bg-n-8">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-n-3 text-n-4 dark:border-n-6">
                  <SortableHeader label="Nome" sortKey="name" currentSort={sort} onSort={handleSort} />
                  <SortableHeader label="Email" sortKey="email" currentSort={sort} onSort={handleSort} />
                  <th className="pb-4 font-semibold">Escritório</th>
                  <SortableHeader label="Role" sortKey="role" currentSort={sort} onSort={handleSort} />
                  <th className="pb-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lawyers.map((lawyer) => (
                  <tr
                    key={lawyer.id}
                    onClick={() => handleEdit(lawyer)}
                    className="cursor-pointer border-b border-n-3/50 transition-colors hover:bg-n-2/50 dark:border-n-6/50 dark:hover:bg-n-6/50"
                  >
                    <td className="py-4 font-semibold text-n-7 dark:text-n-1">
                      {lawyer.name}
                    </td>
                    <td className="py-4 text-n-4">{lawyer.email}</td>
                    <td className="py-4 font-medium">
                      {lawyer.lawFirm ? (
                        <span className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/offices?search=${encodeURIComponent(lawyer.lawFirm.name)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-1 hover:underline"
                          >
                            {lawyer.lawFirm.name}
                          </Link>
                          {lawyer.lawFirmId && (
                            <Link
                              href={`/subscriptions?lawFirmId=${lawyer.lawFirmId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-n-4 hover:text-primary-1"
                            >
                              Ver assinatura
                            </Link>
                          )}
                        </span>
                      ) : (
                        "Sem escritório"
                      )}
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          lawyer.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {lawyer.role}
                      </span>
                    </td>
                    <td className="flex gap-2 py-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(lawyer);
                        }}
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

            {!loading && lawyers.length === 0 && (
              <div className="py-8 text-center text-n-4">
                Nenhum advogado encontrado.
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              totalItems={meta.total}
            />
          </>
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
