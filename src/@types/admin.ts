export type Office = {
  id: string;
  name: string;
  cnpj?: string;
  paymentType?: "CPF" | "CNPJ";
  address: string;
  number: string;
  postalCode: string;
  _count?: {
    lawyers: number;
  };
};

export type Lawyer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "USER";
  cpf?: string;
  lawFirmId: string;
  lawFirm?: {
    id: string;
    name: string;
  };
};

export type CreateOfficeDTO = {
  name: string;
  cnpj?: string;
  paymentType: "CPF" | "CNPJ";
  address: string;
  number: string;
  postalCode: string;
};

export type CreateLawyerDTO = {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  password?: string; // Optional on edit
  lawFirmId: string;
  role: "ADMIN" | "USER";
};

export type Partner = {
  id: string;
  name: string;
  email: string;
  code: string;
  walletId: string;
  discount: number;
  commission: number;
  isActive?: boolean;
};

export type CreatePartnerDTO = {
  name: string;
  email: string;
  code: string;
  walletId: string;
  discount: number;
  commission: number;
};
