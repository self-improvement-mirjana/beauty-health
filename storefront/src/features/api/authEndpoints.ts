import { baseApi } from '@/features/api/baseApi';
import type { AuthResponseDto, UserDto } from '@/features/auth/types';

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  fullName: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ResetPasswordBody = {
  token: string;
  newPassword: string;
};

export type UpdateProfileBody = {
  fullName: string;
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type PasswordResetInitiatedDto = {
  message: string;
};

const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    login: build.mutation<AuthResponseDto, LoginBody>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email: body.email.trim().toLowerCase(), password: body.password },
      }),
      /**
       * Nemoj invalidirati ovde: RTK može da pokrene `/auth/me` pre `setCredentials`
       * u LoginPage-u; zahtev ode bez Bearer tokena → 401 (bez čišćenja jer nema accessToken u Redux-u).
       * Posle prijave `skip` na `getAuthMe` postaje false i upit kreće sa tokenom.
       */
    }),
    register: build.mutation<AuthResponseDto, RegisterBody>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body: {
          email: body.email.trim().toLowerCase(),
          password: body.password,
          fullName: body.fullName.trim(),
        },
      }),
    }),
    getAuthMe: build.query<UserDto, void>({
      query: () => '/auth/me',
      providesTags: [{ type: 'AuthSession', id: 'ME' }],
    }),
    updateProfile: build.mutation<UserDto, UpdateProfileBody>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body: { fullName: body.fullName.trim() },
      }),
      invalidatesTags: [{ type: 'AuthSession', id: 'ME' }],
    }),
    changePassword: build.mutation<void, ChangePasswordBody>({
      query: (body) => ({
        url: '/auth/me/change-password',
        method: 'POST',
        body: {
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
        },
      }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'AuthSession', id: 'ME' }],
    }),
    forgotPassword: build.mutation<PasswordResetInitiatedDto, ForgotPasswordBody>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email: body.email.trim().toLowerCase() },
      }),
    }),
    resetPassword: build.mutation<void, ResetPasswordBody>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token: body.token.trim(), newPassword: body.newPassword },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetAuthMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
