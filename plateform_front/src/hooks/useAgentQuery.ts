import { useState, useCallback } from "react";
import { useExecuteAgentRuntimeMutation } from "services/agentRuntime/agentRuntime";
import { useSendMockQueryMutation } from "services/chat/chat";

interface AgentQueryState {
    text: string;
    isStreaming: boolean;
    error: string | null;
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
    });

    const [executeRuntime] = useExecuteAgentRuntimeMutation();
    const [sendMockQuery] = useSendMockQueryMutation();

    const sendQuery = useCallback(
        async (query: string): Promise<string> => {
            setState({ text: "", isStreaming: true, error: null });

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
            } catch (err) {
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
