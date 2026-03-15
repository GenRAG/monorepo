import useThemedToast from "hooks/useThemedToast";

export const useCopyToClipboard = () => {
    const toast = useThemedToast();

    const copyToClipboard = async (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast({
                    title: "Copied to clipboard",
                    description: "The text has been copied to your clipboard.",
                    status: "success",
                    duration: 3000,
                });
            })
            .catch(() => {
                toast({
                    title: "Failed to copy to clipboard",
                    description: "Please try again.",
                    status: "error",
                    duration: 3000,
                });
            });
    };

    return { copyToClipboard };
};
