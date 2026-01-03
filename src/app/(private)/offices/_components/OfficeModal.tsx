"use client";

import { CreateOfficeDTO, Office } from "@/@types/admin";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/field";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { masks } from "@/utils/masks";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type OfficeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  office?: Office;
};

export default function OfficeModal({
  isOpen,
  onClose,
  onSuccess,
  office,
}: OfficeModalProps) {
  const api = useApiContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOfficeDTO>({
    name: "",
    cnpj: "",
    paymentType: "CNPJ",
    address: "",
    number: "",
    postalCode: "",
  });

  useEffect(() => {
    if (office) {
      setFormData({
        name: office.name,
        cnpj: office.cnpj || "",
        paymentType: office.paymentType || "CNPJ",
        address: office.address,
        number: office.number,
        postalCode: office.postalCode,
      });
    } else {
        setFormData({
            name: "",
            cnpj: "",
            paymentType: "CNPJ",
            address: "",
            number: "",
            postalCode: "",
        })
    }
  }, [office, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (office) {
        await adminService.updateOffice(api, office.id, formData);
        toast.success("Escritório atualizado!");
      } else {
        await adminService.createOffice(api, formData);
        toast.success("Escritório criado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar escritório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title={office ? "Editar Escritório" : "Novo Escritório"}
      classWrap="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <Field
          label="Nome do Escritório"
          value={formData.name}
          onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Silva & Associados"
        />
        
        <div className="flex gap-4">
             <div className="w-1/2">
                <Field
                    label="CNPJ"
                    value={formData.cnpj || ""}
                    onChange={(e: any) => setFormData({ ...formData, cnpj: masks.cnpj(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                />
             </div>
             <div className="w-1/2">
                <label className="mb-2 base2 font-semibold flex">Tipo Pagamento</label>
                 <select
                    className="w-full h-13 px-3.5 bg-n-2 border-2 border-n-2 rounded-xl base2 text-n-7 outline-none dark:bg-n-8 dark:border-n-6 dark:text-n-3"
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as "CNPJ" | "CPF" })}
                >
                    <option value="CNPJ">CNPJ</option>
                    <option value="CPF">CPF</option>
                </select>
             </div>
        </div>

        <div className="flex gap-4">
            <div className="w-2/3">
                <Field
                    label="Endereço"
                    value={formData.address}
                    onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>
            <div className="w-1/3">
                 <Field
                    label="Número"
                    value={formData.number}
                    onChange={(e: any) => setFormData({ ...formData, number: e.target.value })}
                />
            </div>
        </div>

        <Field
            label="CEP"
            value={formData.postalCode}
            onChange={(e: any) => setFormData({ ...formData, postalCode: masks.cep(e.target.value) })} // Applied CEP mask
            maxLength={9} // Added maxLength for CEP
            placeholder="00000-000" // Added placeholder for CEP
        />

        <div className="flex justify-end gap-2 mt-4">
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
