"use client";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useApiContext } from "@/context/ApiContext";
import { cn, formatDate } from "@/lib/utils";
import { Subscription, subscriptionService } from "@/services/subscription/subscriptionService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/** Retorna YYYY-MM-DD em UTC (para datas vindas da API, que vêm em UTC). */
function toUTCYYYYMMDD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Retorna YYYY-MM-DD em horário local (para data escolhida no calendário). */
function toLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [savingExpiration, setSavingExpiration] = useState(false);
  const [treatAsPaidLocal, setTreatAsPaidLocal] = useState(false);
  const [savingTreatAsPaid, setSavingTreatAsPaid] = useState(false);

  const isTrial = subscription?.paymentId?.startsWith("trial") ?? false;

  const currentExpirationUtc =
    isTrial && subscription?.expirationDate
      ? toUTCYYYYMMDD(new Date(subscription.expirationDate))
      : "";
  const isSameExpirationDate =
    !!newExpirationDate && newExpirationDate === currentExpirationUtc;
  const canSaveNewExpiration =
    !!newExpirationDate && !isSameExpirationDate && !savingExpiration;

  useEffect(() => {
    if (isOpen && subscription) {
      loadHistory();
      setTreatAsPaidLocal(subscription.treatAsPaid ?? false);
      if (isTrial && subscription.expirationDate) {
        const expUtc = toUTCYYYYMMDD(new Date(subscription.expirationDate));
        const todayUtc = toUTCYYYYMMDD(new Date());
        setNewExpirationDate(expUtc >= todayUtc ? expUtc : todayUtc);
      }
    }
  }, [isOpen, subscription, isTrial]);

  const handleTreatAsPaidChange = async (checked: boolean | "indeterminate") => {
    if (!subscription || checked === "indeterminate") return;
    setSavingTreatAsPaid(true);
    try {
      await subscriptionService.updateTreatAsPaid(api, subscription.id, checked === true);
      setTreatAsPaidLocal(checked === true);
      toast.success(checked ? "Marcado como tratado como pago." : "Desmarcado.");
      onRefresh();
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setSavingTreatAsPaid(false);
    }
  };

  const addDaysToExpiration = (days: number) => {
    if (!newExpirationDate) return;
    const d = new Date(newExpirationDate + "T12:00:00.000Z");
    d.setUTCDate(d.getUTCDate() + days);
    setNewExpirationDate(toUTCYYYYMMDD(d));
  };

  const handleUpdateExpiration = async () => {
    if (!subscription || !newExpirationDate) return;
    const todayUtc = toUTCYYYYMMDD(new Date());
    if (newExpirationDate < todayUtc) {
      toast.error("Selecione uma data futura.");
      return;
    }
    setSavingExpiration(true);
    try {
      await subscriptionService.updateExpiration(
        api,
        subscription.id,
        new Date(newExpirationDate).toISOString(),
      );
      toast.success("Data de expiração atualizada!");
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar data de expiração");
    } finally {
      setSavingExpiration(false);
    }
  };

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

  const handleRenewYearly = async () => {
    if (!subscription) return;
    if (!confirm("Deseja gerar uma nova cobrança anual para renovar esta assinatura?")) return;
    
    setActionLoading(true);
    try {
      await subscriptionService.renewYearly(api, subscription.id);
      toast.success("Nova cobrança gerada com sucesso!");
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Erro ao gerar renovação");
    } finally {
      setActionLoading(false);
    }
  };

  const translateStatus = (status: string) => {
      const map: Record<string, string> = {
          'ACTIVE': 'Ativa',
          'INACTIVE': 'Inativa',
          'EXPIRED': 'Expirada',
          'CANCELED': 'Cancelada', 
          'RECEIVED': 'Recebido',
          'PENDING': 'Pendente',
          'OVERDUE': 'Atrasado',
          'CONFIRMED': 'Confirmado'
      };
      return map[status] || status;
  };

  const statusColor = (status: string) => {
      switch (status) {
          case 'RECEIVED': return 'text-green-600 bg-green-100';
          case 'PENDING': return 'text-yellow-600 bg-yellow-100';
          case 'OVERDUE': return 'text-red-600 bg-red-100';
          case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
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
                        {translateStatus(subscription.status)}
                    </span>
                </div>
                <div className="text-sm text-n-4">
                    <p>Plano: {subscription.signaturePlan?.name}</p>
                    <p>Ciclo: {subscription.yearly ? 'Anual' : 'Mensal'}</p>
                    <p>Expira em: {formatDate(subscription.expirationDate)}</p>
                    {/* {subscription.paymentId && <p className="text-xs mt-1">Ref Pagamento: {subscription.paymentId}</p>} */}
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

                {(subscription.status === 'CANCELED' || subscription.status === 'INACTIVE' || subscription.status === 'OVERDUE') && !isTrial && (
                    <div className="flex gap-2 mt-2">
                         {subscription.yearly ? (
                            <Button 
                                variant="blue" 
                                className="h-8 text-xs bg-primary-1 hover:bg-primary-1/90 text-white"
                                onClick={handleRenewYearly}
                                disabled={actionLoading}
                             >
                                 {actionLoading ? "Gerando..." : "Gerar Nova Cobrança (Anual)"}
                             </Button>
                         ) : (
                            <Button 
                                variant="blue" 
                                className="h-8 text-xs bg-primary-1 hover:bg-primary-1/90 text-white"
                                onClick={handleReactivate}
                                disabled={actionLoading}
                             >
                                 {actionLoading ? "Reativando..." : "Reativar Assinatura"}
                             </Button>
                         )}
                    </div>
                )}

                {isTrial && (
                  <div className="mt-4 pt-4 border-t border-n-3/50 dark:border-n-6/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Checkbox
                        id="treat-as-paid"
                        checked={treatAsPaidLocal}
                        onCheckedChange={handleTreatAsPaidChange}
                        disabled={savingTreatAsPaid}
                      />
                      <label
                        htmlFor="treat-as-paid"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Trial extendido
                      </label>
                      {savingTreatAsPaid && (
                        <span className="text-xs text-n-4">Salvando...</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-2">Prorrogar trial</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="flex flex-col">

                        <label className="text-sm text-n-4">Nova data de expiração:</label>
                        <DatePicker
                          value={newExpirationDate}
                          onChange={(d) =>
                            setNewExpirationDate(d ? toLocalYYYYMMDD(d) : "")
                          }
                          minDate={new Date()}
                          placeholder="Nova data de expiração"
                          className="min-w-[180px]"
                        />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 text-xs"
                          onClick={() => addDaysToExpiration(7)}
                        >
                          +7 dias
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 text-xs"
                          onClick={() => addDaysToExpiration(14)}
                        >
                          +14 dias
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant={canSaveNewExpiration ? "blue" : "secondary"}
                          className={cn(
                            "h-9 text-xs w-fit transition-colors",
                            canSaveNewExpiration
                              ? "bg-primary-1 hover:bg-primary-1/90 text-white"
                              : "opacity-60 cursor-not-allowed"
                          )}
                          onClick={handleUpdateExpiration}
                          disabled={!canSaveNewExpiration}
                        >
                          {savingExpiration
                            ? "Salvando..."
                            : "Salvar nova data"}
                        </Button>
                        {isSameExpirationDate && (
                          <span className="text-xs text-n-4 dark:text-n-3">
                            Altere a data acima para poder salvar.
                          </span>
                        )}
                      </div>
                    </div>
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
                                            {translateStatus(charge.status)}
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
