export const normalizeNumber = (value: string | undefined) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

export const maskCPF = (value: string) => {
  const cleanValue = normalizeNumber(value).slice(0, 11);
  return cleanValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const maskCNPJ = (value: string) => {
  const cleanValue = normalizeNumber(value).slice(0, 14);
  return cleanValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1"); // Stop after last 2 digits
};

export const maskPhone = (value: string) => {
  const cleanValue = normalizeNumber(value).slice(0, 11);
  return cleanValue
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2");
};

export const maskCEP = (value: string) => {
  const cleanValue = normalizeNumber(value).slice(0, 8);
  return cleanValue.replace(/^(\d{5})(\d)/, "$1-$2");
};

export const masks = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  phone: maskPhone,
  cep: maskCEP,
  normalize: normalizeNumber,
};
