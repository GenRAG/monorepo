const useDownloadFile = ({ url, filename }: { url: string; filename: string }) => {
    const download = () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    return { download };
};

export default useDownloadFile;
