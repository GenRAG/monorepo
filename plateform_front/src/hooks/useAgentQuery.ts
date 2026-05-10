import { useState, useCallback } from "react";
import { useExecuteAgentRuntimeMutation } from "services/agentRuntime/agentRuntime";
import { useSendMockQueryMutation } from "services/chat/chat";

export class InsufficientCreditsError extends Error {
    constructor() {
        super("Pas de crédits disponibles.");
        this.name = "InsufficientCreditsError";
    }
}

interface AgentQueryState {
    text: string;
    isStreaming: boolean;
    error: string | null;
    isOutOfCredits: boolean;
}

export const useAgentQuery = (
    workspaceId: string,
    agentId: string,
    useMock = false,
) => {
    const [state, setState] = useState<AgentQueryState>({
        text: "",
        isStreaming: false,
        error: null,
        isOutOfCredits: false,
    });

    const [executeRuntime] = useExecuteAgentRuntimeMutation();
    const [sendMockQuery] = useSendMockQueryMutation();

    const sendQuery = useCallback(
        async (query: string): Promise<string> => {
            setState({
                text: "",
                isStreaming: true,
                error: null,
                isOutOfCredits: false,
            });

            try {
                let answer: string;

                if (!useMock) {
                    const result = await executeRuntime({
                        workspaceId,
                        agentId,
                        query,
                    }).unwrap();
                    answer = result.answer ?? "";
                } else {
                    const result = await sendMockQuery({ query }).unwrap();
                    answer = result.response[0] ?? "";
                }

                setState((prev) => ({ ...prev, text: answer }));
                return answer;
            } catch (err: any) {
                const status = err?.status ?? err?.originalStatus;
                if (status === 403 || status === 402) {
                    const creditsError = new InsufficientCreditsError();
                    setState((prev) => ({
                        ...prev,
                        error: creditsError.message,
                        isOutOfCredits: true,
                    }));
                    throw creditsError;
                }
                setState((prev) => ({ ...prev, error: String(err) }));
                throw err;
            } finally {
                setState((prev) => ({ ...prev, isStreaming: false }));
            }
        },
        [workspaceId, agentId, executeRuntime, sendMockQuery, useMock],
    );

    return { ...state, sendQuery };
};
