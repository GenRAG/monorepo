const FR_DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

export const toShortLabel = (isoDate: string): string => {
    const date = new Date(`${isoDate}T00:00:00`);
    return `${FR_DAYS[date.getDay()]} ${date.getDate()}`;
};

export const fmtDateTime = (isoDateTime: string): string => {
    const date = new Date(isoDateTime);
    const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const day = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    return `${time}, ${day}`;
};
