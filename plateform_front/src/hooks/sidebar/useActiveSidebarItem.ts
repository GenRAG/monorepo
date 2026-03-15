import { useLocation } from "react-router-dom";

export const useActiveSidebarItem = (itemArray: string[]) => {
    const { pathname } = useLocation();

    const lastSegment = pathname.split("/").filter(Boolean).pop();

    const match = itemArray.find((item) => item === lastSegment);

    return match ?? itemArray[0];
};
