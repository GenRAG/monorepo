import { TaskType } from "@genrag/workflow";
import { useGetModelsGenerationQuery, useGetModelsRerankQuery } from "services/models/models";

export const useModelsFor = (ownerType?: TaskType) => {
    const isReranker = ownerType === TaskType.RERANKER;

    const generation = useGetModelsGenerationQuery(undefined, { skip: isReranker });
    const rerank = useGetModelsRerankQuery(undefined, { skip: !isReranker });

    return isReranker ? rerank : generation;
};
