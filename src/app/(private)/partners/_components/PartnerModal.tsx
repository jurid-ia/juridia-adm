
"use client";

import { Partner } from "@/@types/admin";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/field";
import { useApiContext } from "@/context/ApiContext";
import { partnerService } from "@/services/partner/partnerService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PartnerFormData {
    name: string;
    email: string;
    code: string;
    walletId: string;
    discount: string;
    commission: string;
}

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partner?: Partner;
}

export default function PartnerModal({
  isOpen,
  onClose,
  onSuccess,
  partner,
}: PartnerModalProps) {
  const api = useApiContext();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<PartnerFormData>({
    name: "",
    email: "",
    code: "",
    walletId: "",
    discount: "0",
    commission: "0",
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        email: partner.email,
        code: partner.code,
        walletId: partner.walletId,
        discount: String(partner.discount),
        commission: String(partner.commission),
      });
    } else {
      setFormData({
        name: "",
        email: "",
        code: "",
        walletId: "",
        discount: "0",
        commission: "0",
      });
    }
  }, [partner, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.code || !formData.walletId) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
    }

    setLoading(true);
    try {
      const payload = {
          ...formData,
          discount: Number(formData.discount),
          commission: Number(formData.commission)
      };

      if (partner) {
        await partnerService.updatePartner(api, partner.id, payload);
        toast.success("Parceiro atualizado com sucesso!");
      } else {
        await partnerService.createPartner(api, payload);
        toast.success("Parceiro criado com sucesso!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
        console.error(error);
        toast.error("Erro ao salvar parceiro: " + (error.message || "Unknown error"));
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title={partner ? "Editar Parceiro" : "Novo Parceiro"}
      classWrap="max-w-[500px]"
    >
      <div className="flex flex-col gap-4">
        <Field
            label="Nome*"
            value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do parceiro"
            required
        />

        <Field
            label="Email*"
            value={formData.email}
            onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
            type="email"
            required
        />

        <div className="flex gap-4">
            <div className="w-1/2">
                <Field
                    label="Código (Cupom)*"
                    value={formData.code}
                    onChange={(e: any) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="EX: PARCEIRO10"
                    required
                />
            </div>
            <div className="w-1/2">
                <Field
                    label="Wallet ID (Asaas)*"
                    value={formData.walletId}
                    onChange={(e: any) => setFormData({ ...formData, walletId: e.target.value })}
                    placeholder="wallet_..."
                    required
                />
            </div>
        </div>

        <div className="flex gap-4">
            <div className="w-1/2">
                <Field
                    label="Desconto (%)*"
                    value={formData.discount}
                    onChange={(e: any) => setFormData({ ...formData, discount: e.target.value })}
                    type="number"
                    required
                />
            </div>
            <div className="w-1/2">
                <Field
                    label="Comissão (%)*"
                    value={formData.commission}
                    onChange={(e: any) => setFormData({ ...formData, commission: e.target.value })}
                    type="number"
                    required
                />
            </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
            </Button>
        </div>
      </div>
    </Modal>
  );
}
