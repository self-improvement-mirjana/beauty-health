import { api } from './baseApi';

export interface HostedPaymentInfo {
  merchantName: string;
  amount: { formatted: string; raw: number; currency: string };
  externalOrderId: string;
  expiresAt: string | null;
  status: string;
}

export interface PayCardRequest {
  pan: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  holderName: string;
}

export interface PayCardResponse {
  status: string;
  returnUrl: string;
}

const hostedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHostedPayment: build.query<HostedPaymentInfo, string>({
      query: (ref) => `/api/v1/hosted/${ref}`,
      providesTags: ['Hosted'],
    }),
    payCard: build.mutation<PayCardResponse, { ref: string; body: PayCardRequest }>({
      query: ({ ref, body }) => ({ url: `/api/v1/hosted/${ref}/pay`, method: 'POST', body }),
    }),
  }),
});

export const { useGetHostedPaymentQuery, usePayCardMutation } = hostedApi;
