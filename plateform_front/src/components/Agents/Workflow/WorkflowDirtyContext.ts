import { createContext, useContext } from "react";

const WorkflowDirtyContext = createContext<() => void>(() => {});

export const WorkflowDirtyProvider = WorkflowDirtyContext.Provider;
export const useMarkWorkflowDirty = () => useContext(WorkflowDirtyContext);
