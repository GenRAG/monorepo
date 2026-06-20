import { useLocation } from "react-router-dom";

export const useActiveSidebarItem = (itemArray: string[]) => {
    const { pathname } = useLocation();

    const segments = pathname.split("/").filter(Boolean);

    const match = segments.find((segment) => itemArray.includes(segment));

    return match ?? null;
};
