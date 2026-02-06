import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

console.log('API URL =', process.env.REACT_APP_BACKEND_URL)

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    credentials: 'include',
  }),
  tagTypes: ['User'],
  endpoints: () => ({}),
})