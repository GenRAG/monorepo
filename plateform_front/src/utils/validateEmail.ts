export const emailPattern =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

export const validateEmail = (email?: string): string | true => {
    if (!email) return "Ce champ est obligatoire.";
    if (!emailPattern.test(email))
        return "Le format de l'adresse email est incorrect.";
    return true;
};
