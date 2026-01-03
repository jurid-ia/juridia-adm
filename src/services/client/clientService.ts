export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  officeId?: string;
  officeName?: string;
  createdAt: string;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "João da Silva",
    email: "joao@example.com",
    phone: "(11) 99999-9999",
    officeName: "Silva & Associados",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria@example.com",
    phone: "(21) 98888-8888",
    createdAt: new Date().toISOString(),
  },
];

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...MOCK_CLIENTS];
  },

  createClient: async (
    client: Omit<Client, "id" | "createdAt">,
  ): Promise<Client> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newClient = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    MOCK_CLIENTS.push(newClient);
    return newClient;
  },

  updateClient: async (
    id: string,
    client: Partial<Client>,
  ): Promise<Client> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = MOCK_CLIENTS.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Client not found");
    MOCK_CLIENTS[index] = { ...MOCK_CLIENTS[index], ...client };
    return MOCK_CLIENTS[index];
  },
};
