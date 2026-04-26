import { api } from './baseApi';

export interface TransactionDto {
  id: number;
  paymentRef: string;
  merchantName: string;
  externalOrderId: string;
  amount: { formatted: string; raw: number; currency: string };
  intentStatus: string;
  cardTransactionStatus: string | null;
  declineReason: string | null;
  processedAt: string;
}

export interface DashboardDto {
  totalTransactions: number;
  approvedCount: number;
  declinedCount: number;
  totalAmountRsd: { formatted: string; raw: number; currency: string };
  recentIntents: TransactionDto[];
}

const txApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query<TransactionDto[], { merchantId?: number; status?: string }>({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params.merchantId) qp.set('merchantId', String(params.merchantId));
        if (params.status) qp.set('status', params.status);
        return `/api/v1/admin/transactions?${qp.toString()}`;
      },
      providesTags: ['Transactions'],
    }),
    getDashboard: build.query<DashboardDto, void>({
      query: () => '/api/v1/admin/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetTransactionsQuery, useGetDashboardQuery } = txApi;
