import { useState } from "react";
import { Box, Grid, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation, useDeleteMeMutation, useGetMeQuery, useUpdateMeMutation } from "services/auth/auth";
import { useAuth } from "app/AuthContext";
import useThemedToast from "hooks/useThemedToast";
import ProfileHero from "./ProfileHero";
import ProfileSidebar, { ProfileSection } from "./ProfileSidebar";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import SecuritySection from "./sections/SecuritySection";
import DangerZone from "components/ui/DangerZone";

export const ProfilePage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useThemedToast();
    const [section, setSection] = useState<ProfileSection>("info");

    const { data: user } = useGetMeQuery();
    const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
    const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();
    const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation();

    if (!user) return null;

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
            await changePassword({ currentPassword: current, newPassword: next }).unwrap();
            toast({ title: "Mot de passe modifié", status: "success" });
        } catch (err: any) {
            toast({ title: err?.data?.message ?? "Erreur", status: "error" });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteMe().unwrap();
            logout();
            void navigate("/login");
        } catch {
            toast({ title: "Erreur lors de la suppression", status: "error" });
        }
    };

    return (
        <Stack p={{ base: 4, lg: 16 }} align="center" gap={8} minH="100vh" bg="surfacePrimary" overflow="auto">
            <Stack w="60%" h="100%">
                <Stack gap="0">
                    <ProfileHero user={user} />

                    <Grid
                        templateColumns="220px 1fr"
                        bg="surfaceCard"
                        border="1px solid"
                        borderColor="borderDefault"
                        borderBottomRadius="14px"
                        overflow="hidden"
                        flex={1}
                    >
                        <ProfileSidebar activeSection={section} onSectionChange={setSection} />
                        <Box>
                            {section === "info" && (
                                <PersonalInfoSection user={user} onSave={handleSaveName} isLoading={isUpdating} />
                            )}
                            {section === "security" && (
                                <SecuritySection onChangePassword={handleChangePassword} isLoading={isChangingPw} />
                            )}
                        </Box>
                    </Grid>
                </Stack>
                <DangerZone
                    title="Supprimer le compte"
                    description="Supprime définitivement le compte, ses documents, conversations et workflows."
                    modalTitle="Supprimer le compte"
                    modalDescription="Cette action supprimera définitivement votre compte, tous vos workspaces, agents et documents."
                    confirmText={user.email}
                    onConfirm={handleDeleteAccount}
                    isLoading={isDeleting}
                />
            </Stack>
        </Stack>
    );
};
