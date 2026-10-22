import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import type { BillingSummary, Invoice } from "types/billing/billing";

/** The checkout and portal mutations return a Stripe page to send the browser to. */
export const billingApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getBillingSummary: builder.query<BillingSummary, string>({
            query: (workspaceId) => `/workspaces/${workspaceId}/billing`,
            providesTags: (_result, _error, workspaceId) => [{ type: Tag.Credits, id: workspaceId }],
        }),
        getInvoices: builder.query<Invoice[], string>({
            query: (workspaceId) => `/workspaces/${workspaceId}/billing/invoices`,
            providesTags: (_result, _error, workspaceId) => [{ type: Tag.Credits, id: workspaceId }],
        }),
        startSubscription: builder.mutation<{ url: string }, string>({
            query: (workspaceId) => ({ url: `/workspaces/${workspaceId}/billing/subscription`, method: "POST" }),
        }),
        startTopUp: builder.mutation<{ url: string }, { workspaceId: string; amountEuros: number }>({
            query: ({ workspaceId, amountEuros }) => ({
                url: `/workspaces/${workspaceId}/billing/top-up`,
                method: "POST",
                body: { amountEuros },
            }),
        }),
        openBillingPortal: builder.mutation<{ url: string }, string>({
            query: (workspaceId) => ({ url: `/workspaces/${workspaceId}/billing/portal`, method: "POST" }),
        }),
    }),
});

export const {
    useGetBillingSummaryQuery,
    useGetInvoicesQuery,
    useStartSubscriptionMutation,
    useStartTopUpMutation,
    useOpenBillingPortalMutation,
} = billingApi;
