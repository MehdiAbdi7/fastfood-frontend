import { api } from "@/server/api";
import type { ApiEnvelope } from "@/types/api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserRole,
} from "@/types/user";
import type { Store } from "@/types/store";

interface LoginPayload {
  email: string;
  password: string;
}

interface GetUsersParams {
  store?: Store;
  role?: UserRole;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Ne renvoie plus que le User : le token part désormais dans un cookie
    // posé par le backend, que le JavaScript ne voit jamais.
    login: builder.mutation<User, LoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiEnvelope<User>) => response.data,
    }),

    logout: builder.mutation<null, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),

    checkUser: builder.query<User, void>({
      query: () => "/auth",
      transformResponse: (response: ApiEnvelope<User>) => response.data,
      providesTags: ["User"],
    }),

    getUsers: builder.query<User[], GetUsersParams | void>({
      query: (params) => ({ url: "/auth/users", params: params ?? undefined }),
      transformResponse: (response: ApiEnvelope<User[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: "User" as const, id: u._id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    createUser: builder.mutation<User, CreateUserPayload>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { id: string; body: UpdateUserPayload }>({
      query: ({ id, body }) => ({
        url: `/auth/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Self-service, disponible pour tout rôle : contact uniquement (jamais
    // role/store — voir PATCH /auth/me côté backend).
    updateOwnProfile: builder.mutation<
      User,
      Pick<UpdateUserPayload, "firstname" | "lastname" | "email" | "tel">
    >({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      transformResponse: (response: ApiEnvelope<User>) => response.data,
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation<null, string>({
      query: (id) => ({ url: `/auth/users/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useCheckUserQuery,
  useLazyCheckUserQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateOwnProfileMutation,
  useDeleteUserMutation,
} = authApi;
