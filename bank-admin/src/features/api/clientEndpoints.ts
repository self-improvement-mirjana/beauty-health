import { api } from './baseApi';

export interface BankClientDto {
  id: number;
  fullName: string;
  email: string;
  taxId: string | null;
  status: string;
  createdAt: string;
  cards?: VirtualCardDto[];
}

export interface VirtualCardDto {
  id: number;
  panLast4: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  balance: { formatted: string; raw: number; currency: string };
  status: string;
  createdAt: string;
}

export interface CreateClientRequest {
  fullName: string;
  email: string;
  taxId?: string;
}
export interface IssueCardRequest {
  holderName: string;
  initialBalance: number;
  expMonths: number;
}
export interface TopupRequest {
  amount: number;
}

const clientsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getClients: build.query<BankClientDto[], void>({
      query: () => '/api/v1/admin/clients',
      providesTags: ['Clients'],
    }),
    getClient: build.query<BankClientDto, number>({
      query: (id) => `/api/v1/admin/clients/${id}`,
      providesTags: ['Clients'],
    }),
    createClient: build.mutation<BankClientDto, CreateClientRequest>({
      query: (body) => ({ url: '/api/v1/admin/clients', method: 'POST', body }),
      invalidatesTags: ['Clients'],
    }),
    issueCard: build.mutation<VirtualCardDto, { clientId: number; body: IssueCardRequest }>({
      query: ({ clientId, body }) => ({
        url: `/api/v1/admin/clients/${clientId}/cards`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients', 'Cards'],
    }),
    topupCard: build.mutation<VirtualCardDto, { cardId: number; body: TopupRequest }>({
      query: ({ cardId, body }) => ({
        url: `/api/v1/admin/cards/${cardId}/topup`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cards', 'Clients'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useIssueCardMutation,
  useTopupCardMutation,
} = clientsApi;
