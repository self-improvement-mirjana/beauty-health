import { baseApi } from '@/features/api/baseApi';

export type AdminKpiSummaryDto = {
  orderCount: number;
  revenueTotal: number;
};

export type AdminPaymentsReportDto = {
  successCount: number;
  failureCount: number;
  successRatePercent: number;
};

export type AdminFunnelReportDto = {
  checkoutStartCount: number;
  orderCreatedCount: number;
};

const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminAnalyticsKpi: build.query<AdminKpiSummaryDto, void>({
      query: () => '/admin/analytics/kpi-summary',
    }),
    adminAnalyticsPayments: build.query<AdminPaymentsReportDto, void>({
      query: () => '/admin/analytics/payments',
    }),
    adminAnalyticsFunnel: build.query<AdminFunnelReportDto, void>({
      query: () => '/admin/analytics/funnel',
    }),
  }),
});

export const {
  useAdminAnalyticsKpiQuery,
  useAdminAnalyticsPaymentsQuery,
  useAdminAnalyticsFunnelQuery,
} = analyticsApi;
