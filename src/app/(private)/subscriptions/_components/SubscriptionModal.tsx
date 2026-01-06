import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { partnerService } from "@/services/partner/partnerService"; // Import partnerService
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
  const [partners, setPartners] = useState<any[]>([]); // Partners List
  
  // Filters
  const [selectedOfficeId, setSelectedOfficeId] = useState(subscription?.lawFirmId || "");
  const [selectedPlanId, setSelectedPlanId] = useState(subscription?.signaturePlanId || "");
  const [selectedPartnerId, setSelectedPartnerId] = useState(""); // Partner Selection
  const [yearly, setYearly] = useState(subscription?.yearly || false);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
     if (isOpen) {
         fetchOptions();
         if (subscription) {
             setSelectedOfficeId(subscription.lawFirmId);
             setSelectedPlanId(subscription.signaturePlanId);
             setYearly(subscription.yearly);
             // Note: We don't have partnerId in subscription object yet to pre-fill, assuming new logic mainly
         } else {
             setSelectedOfficeId("");
             setSelectedPlanId("");
             setSelectedPartnerId("");
             setYearly(false);
             setIsTrial(false);
         }
     }
  }, [isOpen, subscription]);

  const fetchOptions = async () => {
      try {
          const [officesData, plansData, partnersData] = await Promise.all([
              adminService.listOffices(api, { limit: 1000, page: 1 }),
              subscriptionService.getPlans(api),
              partnerService.getPartners(api)
          ]);

          console.log("offices: ",  officesData)
          console.log("plans: ",  plansData)
          console.log("partners: ",  partnersData)
          setOffices(officesData.data);
          setPlans(plansData);
          setPartners(partnersData.data);
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
          // Pass partnerId
          await subscriptionService.createSubscription(
              api, 
              selectedOfficeId, 
              selectedPlanId, 
              yearly, 
              isTrial,
              selectedPartnerId || undefined // Pass undefined if empty string
          );
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
        
        <div className="flex flex-col gap-2">
            <label className="base2 font-semibold flex">Escritório (Cliente)</label>
            <Combobox
                options={offices.map(o => ({ value: o.id, label: `${o.name}` }))}
                value={selectedOfficeId}
                onChange={setSelectedOfficeId}
                placeholder="Selecione um escritório"
                searchPlaceholder="Buscar escritório..."
                disabled={!!subscription}
            />
        </div>

        <div className="flex flex-col gap-2">
            <label className="base2 font-semibold flex">Plano</label>
            <Combobox
                options={plans.map(p => ({ value: p.id, label: `${p.name} - R$ ${p.pixPrice}` }))}
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                placeholder="Selecione um plano"
                searchPlaceholder="Buscar plano..."
            />
        </div>

        {!subscription && (
             <div className="flex flex-col gap-2">
                <label className="base2 font-semibold flex">Parceiro/Vendedor (Opcional)</label>
                <Combobox
                    options={partners.map(p => ({ value: p.id, label: `${p.name} (Desconto: ${p.discount}%)` }))}
                    value={selectedPartnerId}
                    onChange={setSelectedPartnerId}
                    placeholder="Selecione um parceiro"
                    searchPlaceholder="Buscar parceiro..."
                />
            </div>
        )}

        {!isTrial && (
            <div className="flex flex-col gap-2">
                <label className="base2 font-semibold">Ciclo de Pagamento</label>
                <RadioGroup 
                    value={yearly ? 'yearly' : 'monthly'} 
                    onValueChange={(val: string) => setYearly(val === 'yearly')}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="cycle-monthly" />
                        <label htmlFor="cycle-monthly" className="cursor-pointer">Mensal</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="cycle-yearly" />
                        <label htmlFor="cycle-yearly" className="cursor-pointer">Anual (com desconto)</label>
                    </div>
                </RadioGroup>
            </div>
        )}

        {!subscription && (
            <div className="flex flex-col gap-2">
                <label className="base2 font-semibold">Período de Teste</label>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="is-trial" 
                        checked={isTrial}
                        onCheckedChange={(checked: boolean | 'indeterminate') => setIsTrial(checked === true)}
                    />
                    <label
                        htmlFor="is-trial"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Ativar Trial (7 dias grátis)
                    </label>
                </div>
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
