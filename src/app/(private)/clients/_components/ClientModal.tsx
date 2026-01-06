"use client";

import { CreateLawyerDTO, Lawyer, Office } from "@/@types/admin";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import Field from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiContext } from "@/context/ApiContext";
import { adminService } from "@/services/admin/adminService";
import { masks } from "@/utils/masks";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lawyer?: Lawyer;
};

export default function ClientModal({
  isOpen,
  onClose,
  onSuccess,
  lawyer,
}: ClientModalProps) {
  const api = useApiContext();
  const [loading, setLoading] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [formData, setFormData] = useState<CreateLawyerDTO>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    lawFirmId: "",
    role: "USER",
    password: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadOffices();
    }
    
    if (lawyer) {
      setFormData({
        name: lawyer.name,
        email: lawyer.email,
        phone: lawyer.phone,
        cpf: lawyer.cpf || "",
        lawFirmId: lawyer.lawFirmId,
        role: lawyer.role,
        password: "", // Don't show password
      });
    } else {
        setFormData({
            name: "",
            email: "",
            phone: "",
            cpf: "",
            lawFirmId: "",
            role: "USER",
            password: "",
        })
    }
  }, [lawyer, isOpen]);

  const loadOffices = async () => {
      try {
          // Fetch a large number of offices for the dropdown
          const response = await adminService.listOffices(api, { limit: 1000, page: 1 });
          setOffices(response.data);
      } catch (error) {
          console.error("Failed to load offices", error);
      }
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (lawyer) {
        // Remove password if empty to avoid hashing empty string
        const { password, ...rest } = formData;
        const updateData = password ? formData : rest;
        console.log("updateData: ", updateData);
        await adminService.updateLawyer(api, lawyer.id, updateData);
        toast.success("Advogado atualizado!");
      } else {
        await adminService.createLawyer(api, formData);
        toast.success("Advogado criado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar advogado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title={lawyer ? "Editar Advogado" : "Novo Advogado"}
      classWrap="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <Field
          label="Nome Completo*"
          value={formData.name}
          onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Ana Souza"
        />
        
        <div className="flex gap-4">
             <div className="w-1/2">
                <Field
                    label="Email*"
                    type="email"
                    value={formData.email}
                    onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                />
             </div>
             <div className="w-1/2">
                <Field
                    label="Telefone*"
                    value={formData.phone}
                    onChange={(e: any) => setFormData({ ...formData, phone: masks.phone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                />
             </div>
        </div>

        <div className="flex gap-4">
            <div className="w-1/2">
                <Field
                    label="CPF*"
                    value={formData.cpf || ""}
                    onChange={(e: any) => setFormData({ ...formData, cpf: masks.cpf(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                />
            </div>
             <div className="w-1/2">
                <label className="mb-2 base2 font-semibold flex">Função (Role)*</label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as "ADMIN" | "USER" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário (Advogado)</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
             </div>
        </div>

        <div>
            <label className="mb-2 base2 font-semibold flex">Escritório*</label>
            <Combobox
                options={offices.map(office => ({ 
                  value: office.id, 
                  label: `${office.name} ${office.cnpj ? `(${office.cnpj})` : '(CPF)'}` 
                }))}
                value={formData.lawFirmId}
                onChange={(value) => setFormData({ ...formData, lawFirmId: value })}
                placeholder="Selecione um escritório..."
                searchPlaceholder="Buscar escritório..."
            />
        </div>

        <Field
            label={lawyer ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
            type="password"
            value={formData.password || ""}
            onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
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
