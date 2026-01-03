"use client";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/field";
import { FiscalNote, fiscalService } from "@/services/fiscal/fiscalService";
import { useState } from "react";
import toast from "react-hot-toast";

type FiscalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  note?: FiscalNote;
};

import { useApiContext } from "@/context/ApiContext"; // Import context

export default function FiscalModal({
  isOpen,
  onClose,
  onSuccess,
  note,
}: FiscalModalProps) {
  const api = useApiContext(); // Get api
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: note?.clientName || "",
    clientId: note?.clientId || "", 
    paymentId: "", // Add paymentId support
    value: note?.value || 0,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (note) {
          toast.success("Edição não suportada pelo Asaas (somente cancelamento)");
      } else {
        // We need real IDs. For now, letting user input them or assume they are valid
        // Ideally we would select from a list of Offices/Payments.
        await fiscalService.generateNote(api, {
            customerId: formData.clientId, 
            paymentId: formData.paymentId,
            value: Number(formData.value)
        });
        toast.success("Nota Fiscal emitida!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao emitir nota (Verifique IDs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title={note ? "Editar Nota (Mock)" : "Emitir Nota Fiscal"}
      classWrap="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <Field
          label="ID do Cliente (Asaas)"
          value={formData.clientId}
          onChange={(e: any) => setFormData({ ...formData, clientId: e.target.value })}
          placeholder="cus_..."
        />

        <Field
          label="ID do Pagamento (Asaas)"
          value={formData.paymentId}
          onChange={(e: any) => setFormData({ ...formData, paymentId: e.target.value })}
          placeholder="pay_... (Obrigatório segundo AsaasService)"
        />
        
        <Field
            label="Valor do Serviço (R$)"
            type="number"
            value={String(formData.value)}
            onChange={(e: any) => setFormData({ ...formData, value: e.target.value })}
        />

        <div className="bg-n-2 dark:bg-n-8 p-3 rounded-lg text-sm text-n-4">
            <p>Impostos estimados (15%): R$ {(Number(formData.value) * 0.15).toFixed(2)}</p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Emitindo..." : "Emitir Nota"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
