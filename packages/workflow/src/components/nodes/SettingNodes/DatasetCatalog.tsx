import { createContext, useContext } from "react";

export interface DatasetCatalogEntry {
    name: string;
    documentsCount: number;
}

/**
 * Datasets the app knows about, keyed by id, so DATASET nodes can show a name instead of an id.
 * `null` (default): unknown, nodes stay neutral (e.g. a read-only viewer). A loaded catalog without the id means the
 * dataset was deleted or is out of reach: the node shows an error (the runtime ignores it).
 */
const DatasetCatalogContext = createContext<Record<string, DatasetCatalogEntry> | null>(null);

export const DatasetCatalogProvider = DatasetCatalogContext.Provider;

export const useDatasetCatalog = () => useContext(DatasetCatalogContext);
