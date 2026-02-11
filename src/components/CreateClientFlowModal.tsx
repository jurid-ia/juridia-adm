"use client";

import { CreateLawyerDTO, CreateOfficeDTO } from "@/@types/admin";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import Field from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { masks } from "@/utils/masks";
import { partnerService } from "@/services/partner/partnerService";
import {
  SignaturePlan,
  subscriptionService,
} from "@/services/subscription/subscriptionService";
import { Building2, ChevronLeft, ChevronRight, FileSignature, User } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

const STEPS = [
  { id: 1, title: "Escritório", icon: Building2 },
  { id: 2, title: "Advogado", icon: User },
  { id: 3, title: "Assinatura", icon: FileSignature },
] as const;

type CreateClientFlowModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateClientFlowModal({
  visible,
  onClose,
  onSuccess,
}: CreateClientFlowModalProps) {
  const api = useApiContext();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Office
  const [officeData, setOfficeData] = useState<CreateOfficeDTO>({
    name: "",
    cnpj: "",
    paymentType: "CNPJ",
    address: "",
    number: "",
    postalCode: "",
  });

  // Step 2: Lawyer
  const [lawyerData, setLawyerData] = useState<CreateLawyerDTO>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    lawFirmId: "",
    role: "ADMIN",
  });

  // Step 3: Subscription
  const [plans, setPlans] = useState<SignaturePlan[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string; discount: number }[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [yearly, setYearly] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    if (visible && step === 2) {
      const load = async () => {
        try {
          const [plansData, partnersRes] = await Promise.all([
            subscriptionService.getPlans(api),
            partnerService.getPartners(api),
          ]);
          setPlans(plansData);
          setPartners(partnersRes.data || []);
        } catch (e) {
          console.error(e);
          toast.error("Erro ao carregar planos e parceiros");
        }
      };
      load();
    }
  }, [visible, step, api]);

  const resetForm = () => {
    setStep(0);
    setOfficeData({
      name: "",
      cnpj: "",
      paymentType: "CNPJ",
      address: "",
      number: "",
      postalCode: "",
    });
    setLawyerData({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      password: "",
      lawFirmId: "",
      role: "ADMIN",
    });
    setSelectedPlanId("");
    setSelectedPartnerId("");
    setYearly(false);
    setIsTrial(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const canGoNext = () => {
    if (step === 0) {
      return (
        officeData.name.trim() !== "" &&
        (officeData.cnpj || "").trim() !== "" &&
        officeData.address.trim() !== "" &&
        officeData.number.trim() !== "" &&
        officeData.postalCode.trim() !== ""
      );
    }
    if (step === 1) {
      return (
        lawyerData.name.trim() !== "" &&
        lawyerData.email.trim() !== "" &&
        lawyerData.phone.trim() !== "" &&
        (lawyerData.password || "").trim() !== ""
      );
    }
    if (step === 2) {
      return selectedPlanId !== "";
    }
    return true;
  };

  const handleNext = async () => {
    if (isLast) {
      await handleSubmitAll();
      return;
    }
    if (step === 0 && canGoNext()) {
      setStep(1);
      return;
    }
    if (step === 1 && canGoNext()) {
      setStep(2);
      return;
    }
    if (!canGoNext()) {
      toast.error("Preencha todos os campos obrigatórios.");
    }
  };

  const handleSubmitAll = async () => {
    if (!selectedPlanId) {
      toast.error("Selecione um plano.");
      return;
    }
    setSubmitting(true);
    try {
      const office = await adminService.createOffice(api, officeData);
      toast.success("Escritório criado.");

      const lawyerPayload: CreateLawyerDTO = {
        ...lawyerData,
        lawFirmId: office.id,
      };
      await adminService.createLawyer(api, lawyerPayload);
      toast.success("Advogado criado.");

      const createdSubscription = await subscriptionService.createSubscription(
        api,
        office.id,
        selectedPlanId,
        yearly,
        isTrial,
        selectedPartnerId || undefined
      );
      toast.success("Assinatura criada.");

      const subscriptionId = (createdSubscription as { id?: string })?.id;
      if (typeof window !== "undefined" && subscriptionId) {
        window.dispatchEvent(
          new CustomEvent("jurid_adm:subscriptions-changed", {
            detail: { subscriptionId },
          })
        );
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.body?.message ||
        error?.message ||
        "Erro ao criar. Verifique os dados e tente novamente.";
      toast.error(typeof msg === "string" ? msg : "Erro ao criar escritório, advogado ou assinatura.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const IconComponent = current.icon;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Criar cliente completo (Escritório + Advogado + Assinatura)"
      classWrap="max-w-xl"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <Fragment key={s.id}>
              <button
                type="button"
                onClick={() => !submitting && setStep(i)}
                className={twMerge(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  i === step
                    ? "border-primary-1 bg-primary-1 text-white dark:bg-primary-1 dark:text-n-1"
                    : "border-n-3 dark:border-n-6 text-n-4 hover:border-n-5 dark:hover:border-n-5",
                  i < step &&
                    "border-primary-1/50 bg-primary-1/10 text-primary-1 dark:bg-primary-1/20"
                )}
              >
                {i < step ? "✓" : s.id}
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-n-4" aria-hidden />
              )}
            </Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3 border-b border-n-3 dark:border-n-6 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-1/10 dark:bg-primary-1/20 text-primary-1">
            <IconComponent className="h-5 w-5" />
          </div>
          <h4 className="base2 font-semibold text-n-7 dark:text-n-1">
            {current.id}. {current.title}
          </h4>
        </div>

        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Field
                label="Nome do Escritório*"
                value={officeData.name}
                onChange={(e: any) =>
                  setOfficeData({ ...officeData, name: e.target.value })
                }
                placeholder="Ex: Silva & Associados"
              />
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Field
                    label={officeData.paymentType === "CPF" ? "CPF*" : "CNPJ*"}
                    value={officeData.cnpj || ""}
                    onChange={(e: any) => {
                      const maskedValue =
                        officeData.paymentType === "CPF"
                          ? masks.cpf(e.target.value)
                          : masks.cnpj(e.target.value);
                      setOfficeData({ ...officeData, cnpj: maskedValue });
                    }}
                    placeholder={
                      officeData.paymentType === "CPF"
                        ? "000.000.000-00"
                        : "00.000.000/0000-00"
                    }
                    maxLength={officeData.paymentType === "CPF" ? 14 : 18}
                  />
                </div>
                <div className="w-1/2">
                  <label className="mb-2 base2 font-semibold flex">
                    Tipo Pagamento*
                  </label>
                  <Select
                    value={officeData.paymentType}
                    onValueChange={(value) =>
                      setOfficeData({
                        ...officeData,
                        paymentType: value as "CNPJ" | "CPF",
                        cnpj: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                      <SelectItem value="CPF">CPF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2/3">
                  <Field
                    label="Endereço*"
                    value={officeData.address}
                    onChange={(e: any) =>
                      setOfficeData({ ...officeData, address: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/3">
                  <Field
                    label="Número*"
                    value={officeData.number}
                    onChange={(e: any) =>
                      setOfficeData({ ...officeData, number: e.target.value })
                    }
                  />
                </div>
              </div>
              <Field
                label="CEP*"
                value={officeData.postalCode}
                onChange={(e: any) =>
                  setOfficeData({
                    ...officeData,
                    postalCode: masks.cep(e.target.value),
                  })
                }
                maxLength={9}
                placeholder="00000-000"
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Field
                label="Nome Completo*"
                value={lawyerData.name}
                onChange={(e: any) =>
                  setLawyerData({ ...lawyerData, name: e.target.value })
                }
                placeholder="Ex: Ana Souza"
              />
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Field
                    label="Email*"
                    type="email"
                    value={lawyerData.email}
                    onChange={(e: any) =>
                      setLawyerData({ ...lawyerData, email: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <Field
                    label="Telefone*"
                    value={lawyerData.phone}
                    onChange={(e: any) =>
                      setLawyerData({
                        ...lawyerData,
                        phone: masks.phone(e.target.value),
                      })
                    }
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Field
                    label="CPF (opcional)"
                    value={lawyerData.cpf || ""}
                    onChange={(e: any) =>
                      setLawyerData({
                        ...lawyerData,
                        cpf: masks.cpf(e.target.value),
                      })
                    }
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="w-1/2">
                  <label className="mb-2 base2 font-semibold flex">
                    Função (Role)*
                  </label>
                  <Select
                    value={lawyerData.role}
                    onValueChange={(value) =>
                      setLawyerData({
                        ...lawyerData,
                        role: value as "ADMIN" | "USER",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="USER">Usuário (Advogado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Field
                label="Senha*"
                type="password"
                value={lawyerData.password || ""}
                onChange={(e: any) =>
                  setLawyerData({ ...lawyerData, password: e.target.value })
                }
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="base2 font-semibold flex">Plano*</label>
                <Combobox
                  options={plans.map((p) => ({ value: p.id, label: p.name }))}
                  value={selectedPlanId}
                  onChange={setSelectedPlanId}
                  placeholder="Selecione um plano"
                  searchPlaceholder="Buscar plano..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="base2 font-semibold flex">
                  Parceiro/Vendedor (opcional)
                </label>
                <Combobox
                  options={partners.map((p) => ({
                    value: p.id,
                    label: `${p.name} (Desconto: ${p.discount}%)`,
                  }))}
                  value={selectedPartnerId}
                  onChange={setSelectedPartnerId}
                  placeholder="Selecione um parceiro"
                  searchPlaceholder="Buscar parceiro..."
                />
              </div>
              {!isTrial && (
                <div className="flex flex-col gap-2">
                  <label className="base2 font-semibold">Ciclo de Pagamento</label>
                  <RadioGroup
                    value={yearly ? "yearly" : "monthly"}
                    onValueChange={(val: string) => setYearly(val === "yearly")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="cycle-monthly" />
                      <label
                        htmlFor="cycle-monthly"
                        className="cursor-pointer"
                      >
                        Mensal
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="cycle-yearly" />
                      <label
                        htmlFor="cycle-yearly"
                        className="cursor-pointer"
                      >
                        Anual (com desconto)
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="base2 font-semibold">Período de Teste</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-trial"
                    checked={isTrial}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      setIsTrial(checked === true)
                    }
                  />
                  <label
                    htmlFor="is-trial"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Ativar Trial (7 dias grátis)
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-n-3 dark:border-n-6">
          <div>
            {!isFirst ? (
              <Button
                variant="secondary"
                onClick={() => setStep(step - 1)}
                disabled={submitting}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <span />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleNext}
              disabled={submitting || (!isLast && !canGoNext())}
              className="gap-1"
            >
              {submitting
                ? "Criando..."
                : isLast
                  ? "Criar tudo"
                  : "Próximo"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
