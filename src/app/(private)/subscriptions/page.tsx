"use client";

import { Button } from "@/components/ui/button";
import { useApiContext } from "@/context/ApiContext";
import { formatDate } from "@/lib/utils";
import { Subscription, subscriptionService } from "@/services/subscription/subscriptionService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SubscriptionDetailsModal from "./_components/SubscriptionDetailsModal";
import SubscriptionModal from "./_components/SubscriptionModal";

export default function SubscriptionsPage() {
  const api = useApiContext();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>(undefined);
  const [viewingSub, setViewingSub] = useState<Subscription | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getSubscriptions(api);
      setSubscriptions(data);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-n-7 dark:text-n-1">Assinaturas</h1>
        <Button onClick={handleCreate}>
          <span className="mr-2">+</span> Nova Assinatura
        </Button>
      </div>

      <div className="bg-n-1 dark:bg-n-7 rounded-xl p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-n-3 dark:border-n-6 text-n-4">
                <th className="pb-4 font-semibold">Cliente</th>
                <th className="pb-4 font-semibold">Plano</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold">Validade</th>
                <th className="pb-4 font-semibold">Valor</th>
                <th className="pb-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-n-3/50 dark:border-n-6/50 hover:bg-n-2/50 dark:hover:bg-n-6/50 transition-colors cursor-pointer group"
                  onClick={() => handleEdit(sub)}
                >
                  <td className="py-4 font-semibold text-n-7 dark:text-n-1">{sub.lawFirm?.name || 'Cliente Removido'}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-n-2 dark:bg-n-6 rounded text-sm font-medium">
                        {sub.signaturePlan?.name || 'Plano Removido'}
                        {sub.yearly && <span className="ml-1 text-xs text-primary-1">(Anual)</span>}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                        sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        sub.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 
                        sub.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {sub.status === 'ACTIVE' ? 'Ativa' : sub.status === 'INACTIVE' ? 'Inativa' : sub.status}
                    </span>
                  </td>
                  <td className="py-4 text-n-4">
                    {sub.expirationDate ? formatDate(sub.expirationDate) : "-"}
                  </td>
                  <td className="py-4 font-medium">
                    R$ {Number(sub.signaturePlan?.pixPrice || 0).toFixed(2)}
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
                         <Button 
                            variant="secondary" 
                            className="h-8 px-3 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(sub);
                            }}
                        >
                            Editar
                        </Button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && subscriptions.length === 0 && (
            <div className="text-center text-n-4 py-8">Nenhuma assinatura encontrada.</div>
        )}
      </div>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        subscription={editingSub}
      />
      
      <SubscriptionDetailsModal
        isOpen={!!viewingSub}
        onClose={() => setViewingSub(undefined)}
        subscription={viewingSub}
        onRefresh={loadData}
      />
    </div>
  );
}
