import { AddDatabase } from "lib/workflow/task/add-database";
import { AddQuery } from "lib/workflow/task/add-query";
import { AddReranking } from "lib/workflow/task/add-reranking";
import { AddResponse } from "lib/workflow/task/add-response";

export const TaskRegistry = {
  RERANKER: AddReranking,
  RESPONSE: AddResponse,
  RETRIEVER: AddDatabase,
  QUERY: AddQuery
};