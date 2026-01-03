"use client";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { SignaturePlan, Subscription, subscriptionService } from "@/services/subscription/subscriptionService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: Subscription; // If present, it's edit mode
};

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  subscription,
}: SubscriptionModalProps) {
  const api = useApiContext();
  const [loading, setLoading] = useState(false);
  
  // Data lists
  const [offices, setOffices] = useState<any[]>([]);
  const [plans, setPlans] = useState<SignaturePlan[]>([]);
  
  // Filters
  const [selectedOfficeId, setSelectedOfficeId] = useState(subscription?.lawFirmId || "");
  const [selectedPlanId, setSelectedPlanId] = useState(subscription?.signaturePlanId || "");
  const [yearly, setYearly] = useState(subscription?.yearly || false);
  const [isTrial, setIsTrial] = useState(false); // Only for creation

  useEffect(() => {
     if (isOpen) {
         fetchOptions();
         if (subscription) {
             setSelectedOfficeId(subscription.lawFirmId);
             setSelectedPlanId(subscription.signaturePlanId);
             setYearly(subscription.yearly);
         } else {
             setSelectedOfficeId("");
             setSelectedPlanId("");
             setYearly(false);
             setIsTrial(false);
         }
     }
  }, [isOpen, subscription]);

  const fetchOptions = async () => {
      try {
          const [officesData, plansData] = await Promise.all([
              adminService.listOffices(api),
              subscriptionService.getPlans(api)
          ]);
          setOffices(officesData);
          setPlans(plansData);
      } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar opções");
      }
  };

  const handleSubmit = async () => {
    if (!selectedOfficeId || !selectedPlanId) {
        toast.error("Selecione o escritório e o plano");
        return;
    }

    setLoading(true);
    try {
      if (subscription && subscription.status === 'ACTIVE') {
          await subscriptionService.changePlan(api, subscription.id, selectedPlanId, yearly);
          toast.success("Plano atualizado!");
      } else {
          // If editing a non-active subscription or creating new, we treat as NEW creation
          await subscriptionService.createSubscription(api, selectedOfficeId, selectedPlanId, yearly, isTrial);
          toast.success("Nova assinatura criada!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar assinatura");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title={subscription ? "Detalhes da Assinatura" : "Nova Assinatura"}
      classWrap="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        
        <div>
            <label className="mb-2 base2 font-semibold flex">Escritório (Cliente)</label>
            <select
                className="w-full h-13 px-3.5 bg-n-2 border-2 border-n-2 rounded-xl base2 text-n-7 outline-none dark:bg-n-8 dark:border-n-6 dark:text-n-3"
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                disabled={!!subscription} // Cannot change client on edit
            >
                <option value="">Selecione um escritório</option>
                {offices.map(o => (
                    <option key={o.id} value={o.id}>{o.name} - {o.cnpj || "Sem CNPJ"}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="mb-2 base2 font-semibold flex">Plano</label>
            <select
                className="w-full h-13 px-3.5 bg-n-2 border-2 border-n-2 rounded-xl base2 text-n-7 outline-none dark:bg-n-8 dark:border-n-6 dark:text-n-3"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                // disabled={!!subscription} // Now allowed
            >
                <option value="">Selecione um plano</option>
                {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {p.pixPrice}</option>
                ))}
            </select>
        </div>

        <div className="flex flex-col gap-2">
            <label className="base2 font-semibold">Ciclo de Pagamento</label>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="cycle" 
                        checked={!yearly} 
                        onChange={() => setYearly(false)}
                        // disabled={!!subscription} // Now allowed
                        className="accent-primary-1"
                    />
                    <span>Mensal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="cycle" 
                        checked={yearly} 
                        onChange={() => setYearly(true)}
                        // disabled={!!subscription} // Now allowed
                        className="accent-primary-1"
                    />
                    <span>Anual (com desconto)</span>
                </label>
            </div>
        </div>

        {!subscription && (
            <div className="flex flex-col gap-2">
                <label className="base2 font-semibold">Período de Teste</label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isTrial} 
                        onChange={(e) => setIsTrial(e.target.checked)}
                        className="w-4 h-4 accent-primary-1"
                    />
                    <span>Ativar Trial (7 dias grátis)</span>
                </label>
            </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          {!subscription && (
            <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Salvando..." : "Criar Assinatura"}
            </Button>
          )}
      </div>
      </div>
    </Modal>
  );
}
