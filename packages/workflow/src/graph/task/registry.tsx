import { Task, TaskType } from "../../types/task";
import { AddDatabase } from "./add-database";
import { AddQuery } from "./add-query";
import { AddReranking } from "./add-reranking";
import { AddResponse } from "./add-response";
import { AddModel } from "./add-model";
import { AddInstruction } from "./add-instruction";
import { AddRewriter } from "./add-rewriter";

export const TaskRegistry: Record<TaskType, Task> = {
    [TaskType.RERANKER]: AddReranking,
    [TaskType.RESPONSE]: AddResponse,
    [TaskType.RETRIEVER]: AddDatabase,
    [TaskType.QUERY]: AddQuery,
    [TaskType.MODEL]: AddModel,
    [TaskType.INSTRUCTION]: AddInstruction,
    [TaskType.REWRITER]: AddRewriter,
};
