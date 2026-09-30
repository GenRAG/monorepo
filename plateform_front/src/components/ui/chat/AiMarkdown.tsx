import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// LLM answers are untrusted (prompt injection through indexed documents). The browser would fetch a markdown
// image automatically, so an injected prompt could exfiltrate conversation data through the image URL without
// any click. Images are therefore rendered as their alt text; everything else keeps the default rendering.
const components: Components = {
    img: ({ alt }) => <>{alt}</>,
};

interface AiMarkdownProps {
    children: string;
}

/** Markdown renderer for AI-generated answers (playground, assistant, onboarding comparison). */
export const AiMarkdown = ({ children }: AiMarkdownProps) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
    </ReactMarkdown>
);
