import { useState } from "react";

const useDragDrop = (onDrop: (e: React.DragEvent) => void) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        onDrop(e);
    };

    return {
        isDragging,
        handleDragOver,
        handleDragLeave,
        handleDrop,
    };
};

export default useDragDrop;
