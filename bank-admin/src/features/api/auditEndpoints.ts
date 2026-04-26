import { api } from './baseApi';

export interface AuditEntryDto {
  id: number;
  actorType: string;
  actorId: string;
  action: string;
  target: string | null;
  metadataJson: string | null;
  createdAt: string;
}

const auditApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAuditLog: build.query<AuditEntryDto[], { page?: number; size?: number }>({
      query: (params) =>
        `/api/v1/admin/audit?page=${params.page ?? 0}&size=${params.size ?? 50}`,
      providesTags: ['Audit'],
    }),
  }),
});

export const { useGetAuditLogQuery } = auditApi;
