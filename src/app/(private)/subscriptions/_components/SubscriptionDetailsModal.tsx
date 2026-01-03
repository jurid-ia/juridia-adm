"use client";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { useApiContext } from "@/context/ApiContext";
import { formatDate } from "@/lib/utils";
import { Subscription, subscriptionService } from "@/services/subscription/subscriptionService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SubscriptionDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subscription?: Subscription;
  onRefresh: () => void;
};

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
  onRefresh,
}: SubscriptionDetailsModalProps) {
  const api = useApiContext();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && subscription) {
      loadHistory();
    }
  }, [isOpen, subscription]);

  const loadHistory = async () => {
    if (!subscription) return;
    setLoading(true);
    try {
      const data = await subscriptionService.getHistory(api, subscription.id);
      setHistory(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;
    
    setActionLoading(true);
    try {
      await subscriptionService.cancelSubscription(api, subscription.id);
      toast.success("Assinatura cancelada com sucesso");
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;
    if (!confirm("Deseja reativar esta assinatura (criar uma nova com os mesmos dados)?")) return;
    
    setActionLoading(true);
    try {
      await subscriptionService.reactivateSubscription(api, subscription.id);
      toast.success("Assinatura reativada!");
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Erro ao reativar assinatura");
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor = (status: string) => {
      switch (status) {
          case 'RECEIVED': return 'text-green-600 bg-green-100';
          case 'PENDING': return 'text-yellow-600 bg-yellow-100';
          case 'OVERDUE': return 'text-red-600 bg-red-100';
          default: return 'text-gray-600 bg-gray-100';
      }
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title="Detalhes e Histórico"
      classWrap="max-w-2xl"
    >
      <div className="flex flex-col gap-6">
        {subscription && (
            <div className="bg-n-2 dark:bg-n-6 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">{subscription.lawFirm?.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        subscription.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                        {subscription.status}
                    </span>
                </div>
                <div className="text-sm text-n-4">
                    <p>Plano: {subscription.signaturePlan?.name}</p>
                    <p>Ciclo: {subscription.yearly ? 'Anual' : 'Mensal'}</p>
                    <p>Expira em: {formatDate(subscription.expirationDate)}</p>
                    {subscription.paymentId && <p className="text-xs mt-1">Ref Pagamento: {subscription.paymentId}</p>}
                </div>
                
                {subscription.status === 'ACTIVE' && (
                    <div className="flex gap-2 mt-2">
                         <Button 
                            variant="red" 
                            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleCancel}
                            disabled={actionLoading}
                         >
                             {actionLoading ? "Cancelando..." : "Cancelar Assinatura"}
                         </Button>
                    </div>
                )}

                {(subscription.status === 'CANCELED' || subscription.status === 'INACTIVE') && (
                    <div className="flex gap-2 mt-2">
                         <Button 
                            variant="blue" 
                            className="h-8 text-xs bg-primary-1 hover:bg-primary-1/90 text-white"
                            onClick={handleReactivate}
                            disabled={actionLoading}
                         >
                             {actionLoading ? "Reativando..." : "Reativar Assinatura"}
                         </Button>
                    </div>
                )}
            </div>
        )}


        <div>
            <h3 className="font-semibold mb-3">Histórico de Cobranças</h3>
            {loading ? (
                <div>Carregando histórico...</div>
            ) : history.length === 0 ? (
                <div className="text-n-4 text-sm">Nenhuma cobrança encontrada no provedor.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-n-3 dark:border-n-5 text-n-4">
                                <th className="p-2">Data Venc.</th>
                                <th className="p-2">Valor</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((charge: any) => (
                                <tr key={charge.id} className="border-b border-n-3/50 dark:border-n-6/50">
                                    <td className="p-2">{formatDate(charge.dueDate || charge.dateCreated)}</td>
                                    <td className="p-2">R$ {charge.value.toFixed(2)}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor(charge.status)}`}>
                                            {charge.status}
                                        </span>
                                    </td>
                                    <td className="p-2">
                                        {charge.invoiceUrl && (
                                            <a href={charge.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-primary-1 hover:underline mr-2">
                                                Fatura
                                            </a>
                                        )}
                                        {charge.bankSlipUrl && (
                                            <a href={charge.bankSlipUrl} target="_blank" rel="noopener noreferrer" className="text-primary-1 hover:underline">
                                                Boleto
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        <div className="flex justify-end mt-2">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
      </div>
      </div>
    </Modal>
  );
}
