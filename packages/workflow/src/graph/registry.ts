import React from 'react'
import { TaskType } from '../types/task'

export interface TaskDefinition {
    type: string
    label: string
    color: 'teal' | 'purple' | 'coral' | 'amber' | 'gray'
    icon?: string
    defaultParams?: Record<string, unknown>
    component?: React.ComponentType<any>
}

export type WorkflowRegistry = Map<string, TaskDefinition>

/** @deprecated Use WorkflowRegistry — renamed to avoid collision with the legacy const TaskRegistry */
export type TaskRegistry = WorkflowRegistry

export function createTaskRegistry(definitions: TaskDefinition[]): WorkflowRegistry {
    return new Map(definitions.map(d => [d.type, d]))
}

export const DEFAULT_TASK_REGISTRY: WorkflowRegistry = createTaskRegistry([
    { type: TaskType.QUERY, label: 'Query', color: 'teal' },
    { type: TaskType.REWRITER, label: 'Rewriter', color: 'amber' },
    { type: TaskType.RETRIEVER, label: 'Retriever', color: 'purple' },
    { type: TaskType.RERANKER, label: 'Reranker', color: 'coral' },
    { type: TaskType.RESPONSE, label: 'Response', color: 'teal' },
    { type: TaskType.MODEL, label: 'Model', color: 'gray' },
    { type: TaskType.INSTRUCTION, label: 'Instruction', color: 'gray' },
])
