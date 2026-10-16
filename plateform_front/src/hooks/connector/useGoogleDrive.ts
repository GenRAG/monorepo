import { useState } from "react";
import { hasGrantedAllScopesGoogle, TokenResponse, useGoogleLogin } from "@react-oauth/google";
import { useImportFromGoogleDriveMutation, useSyncGoogleDriveMutation } from "services/connector/connector";
import { FailedFile } from "types/connector/connector";
import { ACCEPTED_TYPES } from "hooks/useUploadDocuments";
import { pickDriveFiles } from "lib/googlePicker";
import useThemedToast from "hooks/useThemedToast";
import useApiErrorToast from "hooks/useApiErrorToast";
import { pluralize } from "utils/dataset/datasetStatus";

// Only files the user picks are reachable: a non-sensitive scope, so no Google security audit.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const PICKER_MIME_TYPES = [
    ...ACCEPTED_TYPES,
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.presentation",
];
const MAX_FILES_PER_IMPORT = 20;

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY ?? "";
const APP_ID = process.env.REACT_APP_GOOGLE_APP_ID ?? "";

export const isGoogleDriveConfigured = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID && API_KEY && APP_ID);

const describeFailures = (failed: FailedFile[]) =>
    failed.map(({ name, reason }) => `${name} : ${reason}`).join(" · ") || undefined;

/** Google Drive import and resync: a short-lived token is requested on each action, nothing is stored. */
export const useGoogleDrive = (workspaceId: string, datasetId: string) => {
    const toast = useThemedToast();
    const showApiError = useApiErrorToast();
    const [importFiles, { isLoading: isImporting }] = useImportFromGoogleDriveMutation();
    const [syncFiles, { isLoading: isSyncing }] = useSyncGoogleDriveMutation();
    const [isPicking, setIsPicking] = useState(false);

    const withDriveAccess = (action: (accessToken: string) => Promise<void>) => (response: TokenResponse) => {
        if (!hasGrantedAllScopesGoogle(response, DRIVE_SCOPE)) {
            toast({ title: "Accès à Google Drive refusé", status: "error", duration: 5000 });
            return;
        }
        void action(response.access_token);
    };

    const onLoginError = () => toast({ title: "Connexion à Google impossible", status: "error", duration: 5000 });

    const pickAndImport = async (accessToken: string) => {
        setIsPicking(true);
        let fileIds: string[];
        try {
            fileIds = await pickDriveFiles({
                accessToken,
                apiKey: API_KEY,
                appId: APP_ID,
                mimeTypes: PICKER_MIME_TYPES,
                maxItems: MAX_FILES_PER_IMPORT,
            });
        } catch {
            toast({ title: "Impossible d'ouvrir Google Drive", status: "error", duration: 5000 });
            return;
        } finally {
            setIsPicking(false);
        }
        if (fileIds.length === 0) return;

        try {
            const { imported, failed } = await importFiles({ workspaceId, datasetId, accessToken, fileIds }).unwrap();
            toast({
                title: `${pluralize(imported, "fichier importé", "fichiers importés")} depuis Google Drive`,
                description: describeFailures(failed),
                status: failed.length === 0 ? "success" : imported === 0 ? "error" : "warning",
                duration: failed.length === 0 ? 4000 : 8000,
            });
        } catch (error) {
            showApiError("Import depuis Google Drive impossible", error);
        }
    };

    const sync = async (accessToken: string) => {
        try {
            const { updated, unchanged, removed, failed } = await syncFiles({
                workspaceId,
                datasetId,
                accessToken,
            }).unwrap();
            const removedSummary =
                removed.length > 0
                    ? `, ${pluralize(removed.length, "supprimé (corbeille Drive)", "supprimés (corbeille Drive)")}`
                    : "";
            const removedDetail = removed.length > 0 ? `Supprimés : ${removed.join(", ")}` : undefined;
            toast({
                title: `${pluralize(updated, "document mis à jour", "documents mis à jour")}, ${pluralize(unchanged, "déjà à jour", "déjà à jour")}${removedSummary}`,
                description: [removedDetail, describeFailures(failed)].filter(Boolean).join(" · ") || undefined,
                status: failed.length === 0 ? "success" : "warning",
                duration: failed.length === 0 ? 4000 : 8000,
            });
        } catch (error) {
            showApiError("Resynchronisation avec Google Drive impossible", error);
        }
    };

    const requestImport = useGoogleLogin({
        scope: DRIVE_SCOPE,
        onSuccess: withDriveAccess(pickAndImport),
        onError: onLoginError,
    });
    const requestSync = useGoogleLogin({ scope: DRIVE_SCOPE, onSuccess: withDriveAccess(sync), onError: onLoginError });

    return {
        importFromDrive: () => requestImport(),
        syncDrive: () => requestSync(),
        isImporting: isPicking || isImporting,
        isSyncing,
    };
};
