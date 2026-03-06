export const thinScrollbar = {
    /* scrollbar container */
    "&::-webkit-scrollbar": {
        width: "2px",
    },
    /* background of the scrollbar except button or resizer */
    "&::-webkit-scrollbar-track": {
        backgroundColor: "white",
        borderRadius: "8px",
    },
    /* scrollbar itself */
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "green.500",
        borderRadius: "8px",
    },
    /* set button(top and bottom of the scrollbar) */
    "&::-webkit-scrollbar-button": {
        display: "none",
    },
};

export const hiddenScrollBar = {
    "&::-webkit-scrollbar": {
        width: "0px",
        background: "transparent",
    },
};
