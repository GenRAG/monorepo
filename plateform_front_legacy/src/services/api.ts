import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    credentials: 'include',
  }),
  endpoints: () => ({}),
})