"use client";

import { Partner } from "@/@types/admin";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useApiContext } from "@/context/ApiContext";
import { formatDate } from "@/lib/utils";
import { partnerService } from "@/services/partner/partnerService";
import { Subscription, subscriptionService } from "@/services/subscription/subscriptionService";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SubscriptionDetailsModal from "./_components/SubscriptionDetailsModal";
import SubscriptionModal from "./_components/SubscriptionModal";

export default function SubscriptionsPage() {
  const api = useApiContext();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>(undefined);
  const [viewingSub, setViewingSub] = useState<Subscription | undefined>(undefined);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");
  const [yearlyFilter, setYearlyFilter] = useState("ALL");
  const [partnerFilter, setPartnerFilter] = useState("ALL");
  
  // Sort State
  const [sort, setSort] = useState({ by: "createdAt", order: "desc" as 'asc' | 'desc' });
  
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  // Load partners list
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const response = await partnerService.getPartners(api, { limit: 1000 });
        setPartners(response.data);
      } catch (error) {
        console.error("Erro ao carregar parceiros:", error);
      }
    };
    loadPartners();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load data when page, debouncedSearch, filters or sort changes
  useEffect(() => {
    loadData();
  }, [page, debouncedSearch, statusFilter, paymentTypeFilter, yearlyFilter, partnerFilter, sort]);

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
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
      if (paymentTypeFilter && paymentTypeFilter !== "ALL") params.paymentType = paymentTypeFilter;
      if (yearlyFilter && yearlyFilter !== "ALL") params.yearly = yearlyFilter;
      if (partnerFilter && partnerFilter !== "ALL") params.partnerId = partnerFilter;
      
      const response = await subscriptionService.getSubscriptions(api, params);
      setSubscriptions(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSub(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };
  
  const handleDetails = (e: React.MouseEvent, sub: Subscription) => {
      e.stopPropagation();
      setViewingSub(sub);
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
    setPaymentTypeFilter("ALL");
    setYearlyFilter("ALL");
    setPartnerFilter("ALL");
    setPage(1);
  };

  const hasActiveFilters = 
    (statusFilter && statusFilter !== "ALL") || 
    (paymentTypeFilter && paymentTypeFilter !== "ALL") || 
    (yearlyFilter && yearlyFilter !== "ALL") || 
    (partnerFilter && partnerFilter !== "ALL");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Assinaturas</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Nova Assinatura
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-4" />
        <input
          type="text"
          placeholder="Buscar assinatura por cliente ou plano..."
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Status</label>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Ativa</SelectItem>
                <SelectItem value="INACTIVE">Inativa</SelectItem>
                <SelectItem value="OVERDUE">Atrasada</SelectItem>
                <SelectItem value="EXPIRED">Expirada</SelectItem>
                <SelectItem value="CANCELED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Tipo de Pagamento</label>
            <Select value={paymentTypeFilter} onValueChange={(value) => { setPaymentTypeFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Período</label>
            <Select value={yearlyFilter} onValueChange={(value) => { setYearlyFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="true">Anual</SelectItem>
                <SelectItem value="false">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-n-7 dark:text-n-3">Parceiro</label>
            <Select value={partnerFilter} onValueChange={(value) => { setPartnerFilter(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os parceiros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-n-1 dark:bg-n-8 rounded-xl p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-n-3 dark:border-n-6 text-n-4">
                  <SortableHeader label="Cliente" sortKey="lawFirm" currentSort={sort} onSort={handleSort} />
                  <th className="pb-4 font-semibold">Plano</th>
                  <SortableHeader label="Parceiro" sortKey="partner" currentSort={sort} onSort={handleSort} />
                  <SortableHeader label="Status" sortKey="status" currentSort={sort} onSort={handleSort} />
                  <SortableHeader label="Validade" sortKey="expirationDate" currentSort={sort} onSort={handleSort} />
                  <th className="pb-4 font-semibold">Valor</th>
                  <th className="pb-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-n-3/50 dark:border-n-6/50 hover:bg-n-2/50 dark:hover:bg-n-6/50 transition-colors cursor-pointer group"
                    onClick={(e) => handleDetails(e, sub)}
                  >
                    <td className="py-4 font-semibold text-n-7 dark:text-n-1">{sub.lawFirm?.name || 'Cliente Removido'}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-n-2 dark:bg-n-6 rounded text-sm font-medium">
                          {sub.signaturePlan?.name || 'Plano Removido'}
                          {sub.paymentId?.startsWith('trial') ? (
                              <span className="ml-1 text-xs text-orange-500 font-bold">(Trial)</span>
                          ) : (
                              sub.yearly && <span className="ml-1 text-xs text-primary-1">(Anual)</span>
                          )}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-n-4">
                        {sub.partner?.name || '-'}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                          sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          (sub.status === 'EXPIRED' || sub.status === 'OVERDUE' || sub.status === 'CANCELED') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                          {sub.status === 'ACTIVE' ? 'Ativa' : 
                           sub.status === 'INACTIVE' ? 'Inativa' : 
                           sub.status === 'EXPIRED' ? 'Expirada' :
                           sub.status === 'CANCELED' ? 'Cancelada' :
                           sub.status === 'PENDING' ? 'Pendente' :
                           sub.status === 'OVERDUE' ? 'Atrasada' :
                           sub.status}
                      </span>
                    </td>
                    <td className="py-4 text-n-4">
                      {sub.expirationDate ? formatDate(sub.expirationDate) : "-"}
                    </td>

                    <td className="py-4 font-medium">
                      R$ {(() => {
                          const price = Number(sub.signaturePlan?.pixPrice || 0);
                          const yearlyDiscount = Number(sub.signaturePlan?.yearlyDiscount || 0);
                          const partnerDiscount = Number(sub.appliedPartnerDiscount ?? sub.partner?.discount ?? 0);
                          
                          let total = price;

                          if (sub.yearly) {
                             total = price * 12;
                             total = total * (1 - yearlyDiscount / 100);
                          }

                          const discounted = total * (1 - partnerDiscount / 100);
                          return discounted.toFixed(2);
                      })()}
                    </td>
                    <td className="py-4">
                        <div className="flex gap-2">
                          <Button 
                              variant="secondary" 
                              className="h-8 px-3 text-xs"
                              onClick={(e) => handleDetails(e, sub)}
                          >
                              Detalhes
                          </Button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && subscriptions.length === 0 && (
                <div className="text-center text-n-4 py-8">Nenhuma assinatura encontrada.</div>
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
      
      {
        isModalOpen && (
          <SubscriptionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={loadData}
            subscription={editingSub}
          />
        )
      }
      {
        !!viewingSub && (
          <SubscriptionDetailsModal
            isOpen={!!viewingSub}
            onClose={() => setViewingSub(undefined)}
            subscription={viewingSub}
            onRefresh={loadData}
          />
        )
      }
    </div>
  );
}
