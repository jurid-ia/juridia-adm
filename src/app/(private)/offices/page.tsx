"use client";

import { Office } from "@/@types/admin";
import { Button } from "@/components/ui/button";
import { DebouncedSearchInput } from "@/components/ui/DebouncedSearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin/adminService";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import OfficeModal from "./_components/OfficeModal";

export default function OfficesPage() {
  const api = useApiContext();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | undefined>(undefined);

  // Pagination & Search State (search fica só no DebouncedSearchInput para evitar re-render da página a cada tecla)
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  // Filter State
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");
  
  // Sort State
  const [sort, setSort] = useState({ by: "name", order: "asc" as 'asc' | 'desc' });
  
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  const handleDebouncedSearch = useCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, []);

  // Load data when page, debouncedSearch, filter or sort changes
  useEffect(() => {
    loadData();
  }, [page, debouncedSearch, paymentTypeFilter, sort]);

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
      
      if (paymentTypeFilter && paymentTypeFilter !== "ALL") params.paymentType = paymentTypeFilter;
      
      const response = await adminService.listOffices(api, params);
      setOffices(response.data);
      setMeta(response.meta);
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
  };

  const handleCreate = () => {
    setEditingOffice(undefined);
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
    setPaymentTypeFilter("ALL");
    setPage(1);
  };

  const hasActiveFilters = paymentTypeFilter && paymentTypeFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Escritórios</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Novo Escritório
        </Button>
      </div>

      {/* Search Input: estado local no componente evita re-render da página a cada tecla */}
      <DebouncedSearchInput
        placeholder="Buscar escritório por nome ou CPF/CNPJ..."
        onDebouncedChange={handleDebouncedSearch}
        delay={500}
        defaultValue={initialSearch}
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
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Tipo de Pagamento</label>
            <Select value={paymentTypeFilter} onValueChange={(value) => { setPaymentTypeFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-n-1 dark:bg-n-8 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-n-3 dark:border-n-6 text-n-4">
                  <SortableHeader label="Nome" sortKey="name" currentSort={sort} onSort={handleSort} />
                  <th className="pb-4 font-semibold">CPF/CNPJ</th>
                  <th className="pb-4 font-semibold">Localização</th>
                  <th className="pb-4 font-semibold">Advogados</th>
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
                    <td className="py-4 text-n-7 dark:text-n-1">
                      {office.cnpj ? (
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] uppercase bg-n-2 dark:bg-n-7 px-1.5 py-0.5 rounded font-semibold",
                            office.paymentType === "CPF" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          )}>
                            {office.paymentType === "CPF" ? "CPF" : "CNPJ"}
                          </span>
                          <span>{office.cnpj}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 text-n-4">{office.address}, {office.number}</td>
                    <td className="py-4 flex flex-col font-medium">
                      <Link
                        href={`/clients?lawFirmId=${office.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-1 hover:underline"
                      >
                        {office._count?.lawyers ?? 0} advogado(s)
                      </Link>
                        <Link
                          href={`/subscriptions?lawFirmId=${office.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs w-max text-n-4 hover:text-primary-1"
                        >
                          Ver assinatura
                        </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && offices.length === 0 && (
                <div className="text-center text-n-4 py-8">Nenhum escritório encontrado.</div>
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

      <OfficeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        office={editingOffice}
      />
    </div>
  );
}
