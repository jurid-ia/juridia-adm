"use client";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Building2, User, FileSignature, ChevronRight, ChevronLeft } from "lucide-react";
import { Fragment, useState } from "react";
import { twMerge } from "tailwind-merge";

const STEPS = [
  {
    id: 1,
    title: "1. Criar Escritório",
    icon: Building2,
    content: (
      <div className="space-y-3 text-sm text-n-6 dark:text-n-3">
        <p className="font-medium text-n-7 dark:text-n-1">Onde: Menu <strong>Escritórios</strong> → botão <strong>Novo Escritório</strong>.</p>
        <p>Informações necessárias:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Nome do Escritório</strong> (obrigatório)</li>
          <li><strong>CPF ou CNPJ</strong> conforme tipo de pagamento</li>
          <li><strong>Tipo de Pagamento</strong>: CPF ou CNPJ</li>
          <li><strong>Endereço</strong>, <strong>Número</strong> e <strong>CEP</strong></li>
        </ul>
        <p className="text-n-5 dark:text-n-4 text-xs">Todo advogado pertence a um escritório — crie o escritório sempre primeiro.</p>
      </div>
    ),
  },
  {
    id: 2,
    title: "2. Criar Advogado(s)",
    icon: User,
    content: (
      <div className="space-y-3 text-sm text-n-6 dark:text-n-3">
        <p className="font-medium text-n-7 dark:text-n-1">Onde: Menu <strong>Advogados</strong> → botão <strong>Novo Advogado</strong>.</p>
        <p>Informações necessárias:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Nome</strong>, <strong>E-mail</strong> (único), <strong>Telefone</strong>, <strong>Senha</strong></li>
          <li><strong>Escritório</strong> (obrigatório) — selecione o criado na etapa 1</li>
          <li><strong>Função (Role)</strong>: ADMIN ou USER</li>
          <li>CPF opcional, recomendado para cobrança</li>
        </ul>
        <p className="text-n-5 dark:text-n-4 text-xs">O primeiro usuário do escritório deve ser <strong>ADMIN</strong>.</p>
      </div>
    ),
  },
  {
    id: 3,
    title: "3. Criar Assinatura",
    icon: FileSignature,
    content: (
      <div className="space-y-3 text-sm text-n-6 dark:text-n-3">
        <p className="font-medium text-n-7 dark:text-n-1">Onde: Menu <strong>Assinaturas</strong> → botão <strong>Nova Assinatura</strong>.</p>
        <p>Informações necessárias:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Escritório</strong> e <strong>Plano</strong> (ex.: Iniciante, Escritório, Corporativo)</li>
          <li><strong>Ciclo</strong>: Mensal ou Anual (com desconto)</li>
          <li><strong>Período de Teste</strong>: opção Trial (7 dias grátis)</li>
          <li>Parceiro/Vendedor opcional</li>
        </ul>
        <p className="text-n-5 dark:text-n-4 text-xs">Sem assinatura ativa o uso do produto pode ser limitado.</p>
      </div>
    ),
  },
] as const;

type OnboardingFlowModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function OnboardingFlowModal({ visible, onClose }: OnboardingFlowModalProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  if (!visible) return null;

  const IconComponent = current.icon;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Como criar um usuário do zero"
      classWrap="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <Fragment key={s.id}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={twMerge(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  i === step
                    ? "border-primary-1 bg-primary-1 text-white dark:bg-primary-1 dark:text-n-1"
                    : "border-n-3 dark:border-n-6 text-n-4 hover:border-n-5 dark:hover:border-n-5",
                  i < step && "border-primary-1/50 bg-primary-1/10 text-primary-1 dark:bg-primary-1/20"
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

        {/* Step title + icon */}
        <div className="flex items-center gap-3 border-b border-n-3 dark:border-n-6 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-1/10 dark:bg-primary-1/20 text-primary-1">
            <IconComponent className="h-5 w-5" />
          </div>
          <h4 className="base2 font-semibold text-n-7 dark:text-n-1">{current.title}</h4>
        </div>

        {/* Step content */}
        <div className="min-h-[140px]">{current.content}</div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-n-3 dark:border-n-6">
          <div>
            {!isFirst ? (
              <Button variant="secondary" onClick={handlePrev} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <span />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Fechar
            </Button>
            <Button onClick={handleNext} className="gap-1">
              {isLast ? "Entendi" : "Próximo"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
