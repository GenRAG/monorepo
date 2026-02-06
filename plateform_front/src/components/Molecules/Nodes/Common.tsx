import { TaskParamType } from "lib/type/task"

export const ColorForHandle: Record<TaskParamType, string> = {
  BROWSER_INSTANCE: "!bg-sky-400",
  STRING: "!bg-amber-400",
  NUMBER: "!bg-lime-400",
  DOCUMENT: "!bg-red-400",
  SELECT: "!bg-orange-400",
}

export const LLMS = [
  "GPT-3",
  "Mistral",
  "GPT-4o",
  "GPT-3.5",
]

export const ReRanker = [
  "GPT-3",
  "BGE",
  "Claude",
  "colBERT",
]