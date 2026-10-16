// Minimal typing of the Google Picker API (loaded at runtime from apis.google.com, no npm package).
interface DocsView {
    setMimeTypes(mimeTypes: string): DocsView;
    setIncludeFolders(include: boolean): DocsView;
    setEnableDrives(enable: boolean): DocsView;
}

interface PickerResponse {
    action: string;
    docs?: { id: string }[];
}

interface PickerBuilder {
    addView(view: DocsView): PickerBuilder;
    enableFeature(feature: string): PickerBuilder;
    setOAuthToken(token: string): PickerBuilder;
    setDeveloperKey(key: string): PickerBuilder;
    setAppId(appId: string): PickerBuilder;
    setLocale(locale: string): PickerBuilder;
    setMaxItems(max: number): PickerBuilder;
    setCallback(callback: (response: PickerResponse) => void): PickerBuilder;
    build(): { setVisible(visible: boolean): void };
}

interface PickerApi {
    Action: { PICKED: string; CANCEL: string };
    Feature: { MULTISELECT_ENABLED: string; SUPPORT_DRIVES: string };
    DocsView: new () => DocsView;
    PickerBuilder: new () => PickerBuilder;
}

declare global {
    interface Window {
        gapi?: { load(library: string, config: { callback: () => void; onerror: () => void }): void };
        google?: { picker?: PickerApi };
    }
}

let pickerApi: Promise<PickerApi> | null = null;

const loadPickerApi = (): Promise<PickerApi> => {
    pickerApi ??= new Promise<PickerApi>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.onload = () =>
            window.gapi?.load("picker", {
                callback: () => (window.google?.picker ? resolve(window.google.picker) : reject(new Error("Picker"))),
                onerror: () => reject(new Error("Picker")),
            });
        script.onerror = () => reject(new Error("Picker"));
        document.body.appendChild(script);
    }).catch((error: unknown) => {
        // Let the next click retry the load (network blip, blocked script).
        pickerApi = null;
        throw error;
    });
    return pickerApi;
};

interface PickDriveFilesOptions {
    accessToken: string;
    apiKey: string;
    /** Google Cloud project number: with the drive.file scope, picked files are granted to this app. */
    appId: string;
    mimeTypes: readonly string[];
    maxItems: number;
}

/** Opens the Google Picker; resolves with the picked file ids, or [] when the user closes it. */
export const pickDriveFiles = async ({
    accessToken,
    apiKey,
    appId,
    mimeTypes,
    maxItems,
}: PickDriveFilesOptions): Promise<string[]> => {
    const picker = await loadPickerApi();
    const view = () => new picker.DocsView().setMimeTypes(mimeTypes.join(",")).setIncludeFolders(true);

    return new Promise((resolve) => {
        new picker.PickerBuilder()
            .addView(view())
            .addView(view().setEnableDrives(true))
            .enableFeature(picker.Feature.MULTISELECT_ENABLED)
            .enableFeature(picker.Feature.SUPPORT_DRIVES)
            .setOAuthToken(accessToken)
            .setDeveloperKey(apiKey)
            .setAppId(appId)
            .setLocale("fr")
            .setMaxItems(maxItems)
            .setCallback((response) => {
                if (response.action === picker.Action.PICKED) resolve((response.docs ?? []).map((doc) => doc.id));
                if (response.action === picker.Action.CANCEL) resolve([]);
            })
            .build()
            .setVisible(true);
    });
};
