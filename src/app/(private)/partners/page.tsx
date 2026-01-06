
"use client";

import { Partner } from "@/@types/admin";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useApiContext } from "@/context/ApiContext";
import { partnerService } from "@/services/partner/partnerService";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PartnerModal from "./_components/PartnerModal";

export default function PartnersPage() {
  const api = useApiContext();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>(undefined);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Filter State
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Sort State
  const [sort, setSort] = useState({ by: "name", order: "asc" as 'asc' | 'desc' });
  
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load data when page, debouncedSearch, filter or sort changes
  useEffect(() => {
    loadData();
  }, [page, debouncedSearch, statusFilter, sort]);

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
      
      if (statusFilter && statusFilter !== "ALL") params.isActive = statusFilter;
      
      const response = await partnerService.getPartners(api, params);
      setPartners(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar parceiros");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Tem certeza que deseja remover este parceiro?")) return;
      try {
          await partnerService.deletePartner(api, id);
          toast.success("Parceiro removido!");
          loadData();
      } catch (error) {
          toast.error("Erro ao remover parceiro");
      }
  }

  const handleCreate = () => {
    setEditingPartner(undefined);
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
    setStatusFilter("ALL");
    setPage(1);
  };

  const hasActiveFilters = statusFilter && statusFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Parceiros</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Novo Parceiro
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-4" />
        <input
          type="text"
          placeholder="Buscar parceiro por nome, email ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-n-3 dark:border-n-6 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

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
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Status</label>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
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
                  <SortableHeader label="Código" sortKey="code" currentSort={sort} onSort={handleSort} />
                  <th className="pb-4 font-semibold">Comissão</th>
                  <th className="pb-4 font-semibold">Desconto</th>
                  <th className="pb-4 font-semibold">Wallet ID</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="cursor-pointer border-b border-n-3/50 transition-colors hover:bg-n-2/50 dark:border-n-6/50 dark:hover:bg-n-6/50"
                    onClick={() => handleEdit(partner)}
                  >
                    <td className="py-4 font-semibold text-n-7 dark:text-n-1">
                      {partner.name}
                    </td>
                    <td className="py-4 text-xs text-n-4">{partner.email}</td>
                    <td className="py-4 font-mono text-xs font-medium">
                      {partner.code}
                    </td>
                    <td className="py-4 text-sm">{partner.commission}%</td>
                    <td className="py-4 text-sm">{partner.discount}%</td>
                    <td className="py-4 text-xs text-n-4 font-mono">
                      {partner.walletId?.substring(0, 8) || '****'}****
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          partner.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {partner.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="flex gap-2 py-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(partner);
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

            {!loading && partners.length === 0 && (
              <div className="py-8 text-center text-n-4">
                Nenhum parceiro encontrado.
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

      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        partner={editingPartner}
      />
    </div>
  );
}
