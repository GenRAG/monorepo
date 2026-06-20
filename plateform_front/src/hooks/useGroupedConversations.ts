import { useMemo } from "react";
import { ConversationPreview } from "services/chat/chat";

interface ConversationGroup {
    label: string;
    items: ConversationPreview[];
}

export const useGroupedConversations = (conversations: ConversationPreview[]): ConversationGroup[] => {
    return useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const weekAgo = new Date(today.getTime() - 7 * 86400000);

        const labeled = {
            today: [] as ConversationPreview[],
            yesterday: [] as ConversationPreview[],
            week: [] as ConversationPreview[],
            older: [] as ConversationPreview[],
        };

        conversations.forEach((c) => {
            if (!c.updatedAt) {
                labeled.older.push(c);
                return;
            }
            const d = new Date(c.updatedAt);
            if (d >= today) labeled.today.push(c);
            else if (d >= yesterday) labeled.yesterday.push(c);
            else if (d >= weekAgo) labeled.week.push(c);
            else labeled.older.push(c);
        });

        return [
            { label: "Aujourd'hui", items: labeled.today },
            { label: "Hier", items: labeled.yesterday },
            { label: "Cette semaine", items: labeled.week },
            { label: "Plus ancien", items: labeled.older },
        ].filter((g) => g.items.length > 0);
    }, [conversations]);
};
