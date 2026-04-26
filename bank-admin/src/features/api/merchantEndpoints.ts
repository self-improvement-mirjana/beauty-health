import { api } from './baseApi';

export interface MerchantDto {
  id: number;
  name: string;
  slug: string;
  returnUrlSuccess: string | null;
  returnUrlFailure: string | null;
  webhookUrl: string | null;
  signingMode: string;
  status: string;
  createdAt: string;
  credentials?: CredentialDto[];
}

export interface CredentialDto {
  id: number;
  type: string;
  serial: string;
  fingerprintSha256: string | null;
  validFrom: string;
  validTo: string;
  revokedAt: string | null;
}

export interface CreateMerchantRequest {
  name: string;
  slug: string;
  returnUrlSuccess?: string;
  returnUrlFailure?: string;
  webhookUrl?: string;
  signingMode: string;
}

export interface IssueCredentialRequest {
  type: string;
  validityDays: number;
}
export interface IssueCredentialResponse {
  id: number;
  serial: string;
  type: string;
  fingerprintSha256: string | null;
  privateKeyPem?: string;
  hmacSecret?: string;
  publicKeyPem?: string;
}

export interface RevealResponse {
  privateKeyPem?: string;
  hmacSecret?: string;
}

const merchantsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMerchants: build.query<MerchantDto[], void>({
      query: () => '/api/v1/admin/merchants',
      providesTags: ['Merchants'],
    }),
    getMerchant: build.query<MerchantDto, number>({
      query: (id) => `/api/v1/admin/merchants/${id}`,
      providesTags: ['Merchants'],
    }),
    createMerchant: build.mutation<MerchantDto, CreateMerchantRequest>({
      query: (body) => ({ url: '/api/v1/admin/merchants', method: 'POST', body }),
      invalidatesTags: ['Merchants'],
    }),
    updateMerchant: build.mutation<MerchantDto, { id: number; body: Partial<CreateMerchantRequest> }>(
      {
        query: ({ id, body }) => ({
          url: `/api/v1/admin/merchants/${id}`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: ['Merchants'],
      },
    ),
    issueCredential: build.mutation<
      IssueCredentialResponse,
      { merchantId: number; body: IssueCredentialRequest }
    >({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/admin/merchants/${merchantId}/credentials`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Credentials', 'Merchants'],
    }),
    revealCredential: build.mutation<
      RevealResponse,
      { merchantId: number; credentialId: number }
    >({
      query: ({ merchantId, credentialId }) => ({
        url: `/api/v1/admin/merchants/${merchantId}/credentials/${credentialId}/reveal`,
        method: 'POST',
      }),
    }),
    revokeCredential: build.mutation<void, { merchantId: number; credentialId: number }>({
      query: ({ merchantId, credentialId }) => ({
        url: `/api/v1/admin/merchants/${merchantId}/credentials/${credentialId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: ['Credentials', 'Merchants'],
    }),
  }),
});

export const {
  useGetMerchantsQuery,
  useGetMerchantQuery,
  useCreateMerchantMutation,
  useUpdateMerchantMutation,
  useIssueCredentialMutation,
  useRevealCredentialMutation,
  useRevokeCredentialMutation,
} = merchantsApi;
