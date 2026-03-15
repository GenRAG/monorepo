import { AddDatabase } from "lib/workflow/task/add-database";
import { AddQuery } from "lib/workflow/task/add-query";
import { AddReranking } from "lib/workflow/task/add-reranking";
import { AddResponse } from "lib/workflow/task/add-response";
import { AddModel } from "lib/workflow/task/add-model";
import { AddInstruction } from "lib/workflow/task/add-instruction";
import { AddRewriter } from "lib/workflow/task/add-rewriter";

type TaskComponent =
    | typeof AddReranking
    | typeof AddResponse
    | typeof AddDatabase
    | typeof AddQuery
    | typeof AddModel
    | typeof AddInstruction
    | typeof AddRewriter;

export const TaskRegistry: Record<string, TaskComponent> = {
    RERANKER: AddReranking,
    RESPONSE: AddResponse,
    RETRIEVER: AddDatabase,
    QUERY: AddQuery,
    MODEL: AddModel,
    INSTRUCTION: AddInstruction,
    REWRITER: AddRewriter,
};
