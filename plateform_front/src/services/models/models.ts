import { backendApi } from "services/api";
import { RagModel } from "types/models/models";

export const extendedModelsApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getModelsGeneration: builder.query<RagModel[], void>({
            query: () => ({ url: `/rag/models/generation` }),
            keepUnusedDataFor: 300,
        }),
        getModelsRerank: builder.query<RagModel[], void>({
            query: () => ({ url: `/rag/models/rerank` }),
            keepUnusedDataFor: 300,
        }),
    }),
});

export const { useGetModelsGenerationQuery, useGetModelsRerankQuery } = extendedModelsApi;
