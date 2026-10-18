/** Storage quota of one dataset (sum of its documents' sizes). */
export const MAX_DATASET_STORAGE_BYTES = 100 * 1024 * 1024;

/** The RAG engine searches at most this many datasets in one query: an agent cannot use more. */
export const MAX_DATASETS_PER_AGENT = 50;
