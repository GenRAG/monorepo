import { motion } from "framer-motion";
import { DEMO_EASE } from "components/ui/demo/DemoStage";

interface DemoWordsProps {
    text: string;
    count?: number;
    stagger?: number;
}

export const splitWords = (text: string) => text.split(" ");

export const DemoWords = ({ text, count, stagger = 0 }: DemoWordsProps) => {
    const words = splitWords(text);
    const visible = count === undefined ? words : words.slice(0, count);

    return (
        <>
            {visible.map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4, delay: i * stagger, ease: DEMO_EASE }}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                    {i < words.length - 1 ? `${word} ` : word}
                </motion.span>
            ))}
        </>
    );
};
