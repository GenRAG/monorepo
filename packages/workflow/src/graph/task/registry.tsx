import { AddDatabase } from "./add-database";
import { AddQuery } from "./add-query";
import { AddReranking } from "./add-reranking";
import { AddResponse } from "./add-response";
import { AddModel } from "./add-model";
import { AddInstruction } from "./add-instruction";
import { AddRewriter } from "./add-rewriter";

export const TaskRegistry = {
    RERANKER: AddReranking,
    RESPONSE: AddResponse,
    RETRIEVER: AddDatabase,
    QUERY: AddQuery,
    MODEL: AddModel,
    INSTRUCTION: AddInstruction,
    REWRITER: AddRewriter,
};
