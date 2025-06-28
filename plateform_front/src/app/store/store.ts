import { configureStore } from '@reduxjs/toolkit'
import { backendApi } from '@/src/services/api'

export const store = configureStore({
  reducer: {
    [backendApi.reducerPath]: backendApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(backendApi.middleware),
})