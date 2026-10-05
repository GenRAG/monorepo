import { useState } from "react";
import { Box, Grid, HStack, Skeleton, Stack, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation, useDeleteMeMutation, useGetMeQuery, useUpdateMeMutation } from "services/auth/auth";
import { useAuth } from "app/AuthContext";
import useThemedToast from "hooks/useThemedToast";
import { getApiErrorMessage } from "utils/apiError";
import ProfileHero from "./ProfileHero";
import ProfileSidebar, { ProfileSection } from "./ProfileSidebar";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import OrganizationSection from "./sections/OrganizationSection";
import SecuritySection from "./sections/SecuritySection";
import AppearanceSection from "./sections/AppearanceSection";
import DangerZone from "components/ui/DangerZone";

const ProfileSkeleton = () => (
    <Stack p={{ base: 4, lg: 16 }} align="center" gap={8} minH="100vh" bg="surfacePrimary" overflow="auto">
        <Stack w="60%" gap={0}>
            <HStack spacing={4} px={6} pt={6} pb={5}>
                <Skeleton boxSize="52px" borderRadius="8px" />
                <VStack align="start" spacing={2}>
                    <Skeleton h="16px" w="160px" borderRadius="4px" />
                    <Skeleton h="12px" w="200px" borderRadius="4px" />
                </VStack>
            </HStack>
            <Skeleton h="420px" borderBottomRadius="14px" />
        </Stack>
    </Stack>
);

export const ProfilePage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useThemedToast();
    const [section, setSection] = useState<ProfileSection>("info");

    const { data: user } = useGetMeQuery();
    const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
    const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();
    const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation();

    if (!user) return <ProfileSkeleton />;

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
        } catch (err: unknown) {
            toast({ title: getApiErrorMessage(err) ?? "Erreur", status: "error" });
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
                            {section === "organization" && <OrganizationSection />}
                            {section === "security" && (
                                <SecuritySection onChangePassword={handleChangePassword} isLoading={isChangingPw} />
                            )}
                            {section === "appearance" && <AppearanceSection />}
                        </Box>
                    </Grid>
                </Stack>
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
        </Stack>
    );
};
