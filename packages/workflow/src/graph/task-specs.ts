import { TaskParamType, TaskType, type TaskSpecRegistry } from "../types/task";
import { LLMS, LLMSRewriter, ReRanker } from "./models";

/**
 * The tasks of a RAG workflow: labels, how they chain and which settings they take.
 * Drawing (icons, custom node components) is added on top by the UI registry (`TaskRegistry`).
 *
 * Renaming an input changes its settings handle: workflows already in DB are repaired by
 * `sanitizeWorkflowEdges`, and `serializeWorkflow` must still produce the blocks expected by the engine.
 */
export const TASK_SPECS: TaskSpecRegistry = {
    [TaskType.QUERY]: {
        type: TaskType.QUERY,
        label: "Question",
        description: "La question posée à votre assistant",
        isEntryPoint: true,
        isEndPoint: false,
        isDeletable: false,
        inputs: [],
        chainOutputs: [{ nodeType: TaskType.REWRITER, optional: true }],
    },
    [TaskType.REWRITER]: {
        type: TaskType.REWRITER,
        label: "Reformulation",
        description: "Reformule la question pour améliorer la recherche dans vos documents.",
        isEntryPoint: false,
        isEndPoint: false,
        isDeletable: true,
        inputs: [
            {
                name: "Modèle de reformulation",
                type: TaskParamType.SELECT,
                nodeType: TaskType.MODEL,
                helperText: "Choisissez le modèle IA pour la reformulation",
                required: true,
                hideHandle: false,
                items: LLMSRewriter,
            },
        ],
        chainOutputs: [],
    },
    [TaskType.RETRIEVER]: {
        type: TaskType.RETRIEVER,
        label: "Recherche",
        description: "Recherche les passages pertinents dans vos bases de connaissances",
        isEntryPoint: false,
        isEndPoint: false,
        isDeletable: false,
        inputs: [
            {
                name: "Bases",
                type: TaskParamType.SELECT,
                nodeType: TaskType.DATASET,
                helperText: "Limitez la recherche à certaines bases de connaissances de l'agent",
                required: false,
                hideHandle: false,
                multiple: true,
                items: [],
            },
        ],
        chainOutputs: [{ nodeType: TaskType.RERANKER, optional: true }],
    },
    [TaskType.RERANKER]: {
        type: TaskType.RERANKER,
        label: "Classement",
        description: "Trie les résultats par ordre de pertinence pour améliorer la réponse",
        isEntryPoint: false,
        isEndPoint: false,
        isDeletable: true,
        inputs: [
            {
                name: "Modèle de tri",
                type: TaskParamType.SELECT,
                nodeType: TaskType.MODEL,
                helperText: "Choisissez le modèle de tri",
                required: true,
                hideHandle: false,
                items: ReRanker,
            },
        ],
        chainOutputs: [],
    },
    [TaskType.RESPONSE]: {
        type: TaskType.RESPONSE,
        label: "Réponse",
        description: "Génère la réponse finale à partir des documents trouvés",
        isEntryPoint: false,
        isEndPoint: true,
        isDeletable: false,
        inputs: [
            {
                name: "Modèle IA",
                type: TaskParamType.SELECT,
                nodeType: TaskType.MODEL,
                helperText: "Choisissez le modèle IA pour la génération de réponse",
                required: true,
                hideHandle: false,
                items: LLMS,
            },
            {
                name: "Instruction",
                type: TaskParamType.STRING,
                nodeType: TaskType.INSTRUCTION,
                helperText: "Rédigez les instructions de votre assistant",
                required: true,
                hideHandle: false,
                items: [],
            },
        ],
    },
    [TaskType.MODEL]: {
        type: TaskType.MODEL,
        label: "Modèle IA",
        description: "Comparez et sélectionnez un modèle d'IA pour votre bloc.",
        isEntryPoint: false,
        isEndPoint: false,
        isDeletable: false,
        inputs: [],
    },
    [TaskType.INSTRUCTION]: {
        type: TaskType.INSTRUCTION,
        label: "Instructions",
        description: "Consignes et personnalité de votre assistant",
        isEntryPoint: false,
        isEndPoint: false,
        isDeletable: false,
        inputs: [],
    },
    [TaskType.DATASET]: {
        type: TaskType.DATASET,
        label: "Base de connaissances",
        description: "Une base de connaissances dans laquelle la recherche est faite",
        isEntryPoint: false,
        isEndPoint: false,
        isDeletable: false,
        inputs: [],
    },
};
