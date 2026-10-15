import { Center, Divider, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation, useDeleteMeMutation, useGetMeQuery, useUpdateMeMutation } from "services/auth/auth";
import { useAuth } from "app/AuthContext";
import useThemedToast from "hooks/useThemedToast";
import { getApiErrorMessage } from "utils/apiError";
import Banner from "components/ui/Banner";
import Button from "components/ui/Button";
import DangerZone from "components/ui/DangerZone";
import { ProfileBlock } from "./ProfileBlock";
import ProfileHero from "./ProfileHero";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import OrganizationSection from "./sections/OrganizationSection";
import SecuritySection from "./sections/SecuritySection";
import AppearanceSection from "./sections/AppearanceSection";

export type ProfileTab = "info" | "organization" | "security" | "appearance";

/** Contenu d'un onglet du profil : le chargement du compte et les actions vivent ici, pas dans la modal. */
export const ProfileContent = ({ tab, onAccountDeleted }: { tab: ProfileTab; onAccountDeleted: () => void }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useThemedToast();

    const { data: user, isLoading, isError, refetch } = useGetMeQuery();
    const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
    const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();
    const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation();

    if (isLoading) {
        return (
            <Stack spacing={4}>
                <Skeleton h="90px" borderRadius="12px" />
                <Skeleton h="320px" borderRadius="12px" />
            </Stack>
        );
    }

    if (isError || !user) {
        return (
            <Center h="100%" flexDirection="column" gap={3}>
                <Text color="textError">Votre profil n&apos;a pas pu être chargé.</Text>
                <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                    Réessayer
                </Button>
            </Center>
        );
    }

    const handleSaveName = async (name: string) => {
        try {
            await updateMe({ name }).unwrap();
            toast({ title: "Profil mis à jour", status: "success" });
        } catch {
            toast({ title: "Erreur lors de la mise à jour", status: "error" });
        }
    };

    const handleChangePassword = async (current: string, next: string) => {
        try {
            await changePassword({
                currentPassword: current,
                newPassword: next,
            }).unwrap();
            toast({ title: "Mot de passe modifié", status: "success" });
            return true;
        } catch (err: unknown) {
            toast({ title: getApiErrorMessage(err) ?? "Erreur", status: "error" });
            return false;
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteMe().unwrap();
            onAccountDeleted();
            logout();
            void navigate("/login");
        } catch {
            toast({ title: "Erreur lors de la suppression", status: "error" });
        }
    };

    const divider = <Divider borderColor="borderDefault" />;

    switch (tab) {
        case "info":
            return (
                <Stack spacing={8} divider={divider}>
                    <ProfileHero user={user} />
                    <PersonalInfoSection user={user} onSave={handleSaveName} isLoading={isUpdating} />
                </Stack>
            );
        case "organization":
            return <OrganizationSection />;
        case "security":
            return (
                <Stack spacing={8} divider={divider}>
                    {/* `=== false` : sans le champ (back pas encore déployé), on garde le formulaire, le back répond 400. */}
                    {user.hasPassword === false ? (
                        <ProfileBlock title="Sécurité" subtitle="Votre compte n'a pas encore de mot de passe.">
                            <Banner variant="blue" title="Pas encore de mot de passe">
                                Vous vous connectez avec Google. Pour vous connecter aussi par email, créez un mot de
                                passe avec « Mot de passe oublié » sur la page de connexion.
                            </Banner>
                        </ProfileBlock>
                    ) : (
                        <SecuritySection onChangePassword={handleChangePassword} isLoading={isChangingPw} />
                    )}
                    <DangerZone
                        title="Supprimer le compte"
                        description="Supprime définitivement le compte, ses documents, conversations et workflows."
                        modalTitle="Supprimer le compte"
                        modalDescription="Cette action supprimera définitivement votre compte, votre entreprise, vos agents et vos documents."
                        confirmText={user.email}
                        onConfirm={handleDeleteAccount}
                        isLoading={isDeleting}
                    />
                </Stack>
            );
        case "appearance":
            return <AppearanceSection />;
    }
};
