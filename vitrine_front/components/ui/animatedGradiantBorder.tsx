import { CSSProperties, useEffect, useRef } from "react";

export const AnimatedGradientBorderTW: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boxElement = boxRef.current;

    if (!boxElement) {
      return;
    }

    const updateAnimation = () => {
      const angle =
        (parseFloat(boxElement.style.getPropertyValue("--angle")) + 0.2) % 360;
      boxElement.style.setProperty("--angle", `${angle}deg`);
      requestAnimationFrame(updateAnimation);
    };

    requestAnimationFrame(updateAnimation);
  }, []);

  return (
    <div
      ref={boxRef}
      style={
        {
          "--angle": "0deg",
          "--border-color": "linear-gradient(var(--angle), #070707 0%, #070707 65%, #ff4a3888 75%, #ff7a68ff 85%, #ff4a3888 95%, #070707 100%)",
          "--bg-color": "linear-gradient(#131219, #131219)",
        } as CSSProperties
      }
      className="relative bg-gray-900/95 rounded-lg shadow-lg overflow-hidden border-2 border-[#0000] [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
    >
      {children}
    </div>
  );
};