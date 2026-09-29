import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";

const CANCELLED = Symbol("demo-cancelled");

type Anchor = "center" | "left" | "right" | "top" | "bottom";

interface MoveOptions {
    anchor?: Anchor;
    offset?: { x: number; y: number };
    duration?: number;
}

export interface DemoContext {
    iteration: number;
    wait: (ms: number) => Promise<void>;
    place: (x: number, y: number) => void;
    placeAt: (target: string, options?: MoveOptions) => void;
    moveTo: (target: string, options?: MoveOptions) => Promise<void>;
    moveToPoint: (x: number, y: number, duration?: number) => Promise<void>;
    park: (corner?: "bottom-right" | "bottom-left" | "right") => Promise<void>;
    click: () => Promise<void>;
    press: () => void;
    release: () => void;
    show: () => Promise<void>;
    hide: () => Promise<void>;
    carry: (node: ReactNode | null) => void;
    chapter: (index: number) => void;
    type: (text: string, onChange: (value: string) => void, speed?: number) => Promise<void>;
}

export type DemoScript = (ctx: DemoContext) => Promise<void>;

export interface DemoState {
    stageRef: RefObject<HTMLDivElement | null>;
    cursor: {
        x: MotionValue<number>;
        y: MotionValue<number>;
        opacity: MotionValue<number>;
        pressed: boolean;
        clicks: number;
        carry: ReactNode | null;
        hidden: boolean;
    };
    hovered: string | null;
    fading: boolean;
    iteration: number;
    chapter: number;
    chapterCount: number;
}

interface UseDemoScriptOptions {
    chapters: number;
    onChapterChange?: (index: number) => void;
}

const MOVE_EASE_X: [number, number, number, number] = [0.45, 0, 0.2, 1];
const MOVE_EASE_Y: [number, number, number, number] = [0.3, 0.05, 0.3, 1];

const travelDuration = (dx: number, dy: number) => Math.min(1.1, Math.max(0.45, 0.35 + Math.hypot(dx, dy) / 520));

const typingDelay = (char: string, base: number) => {
    if (char === " ") return base * 1.6;
    if (/[?.!,]/.test(char)) return base * 2.2;
    return base * (0.7 + Math.random() * 0.7);
};

export const useDemoScript = (script: DemoScript, { chapters, onChapterChange }: UseDemoScriptOptions): DemoState => {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion() ?? false;

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const opacity = useMotionValue(0);

    const [pressed, setPressed] = useState(false);
    const [clicks, setClicks] = useState(0);
    const [carry, setCarry] = useState<ReactNode | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [chapter, setChapter] = useState(0);
    const [fading, setFading] = useState(false);
    const [iteration, setIteration] = useState(0);

    const scriptRef = useRef(script);
    scriptRef.current = script;
    const onChapterChangeRef = useRef(onChapterChange);
    onChapterChangeRef.current = onChapterChange;

    const changeChapter = useCallback((index: number) => {
        setChapter(index);
        onChapterChangeRef.current?.(index);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const guard = () => {
            if (signal.aborted) throw CANCELLED;
        };

        const wait = (ms: number) =>
            new Promise<void>((resolve, reject) => {
                if (signal.aborted) return reject(CANCELLED);
                const id = setTimeout(resolve, ms);
                signal.addEventListener(
                    "abort",
                    () => {
                        clearTimeout(id);
                        reject(CANCELLED);
                    },
                    { once: true },
                );
            });

        const run = async (value: MotionValue<number>, to: number, duration: number, ease: typeof MOVE_EASE_X) => {
            guard();
            if (reducedMotion || duration === 0) {
                value.set(to);
                return;
            }
            await new Promise<void>((resolve, reject) => {
                const controls = animate(value, to, { duration, ease });
                const onAbort = () => {
                    controls.stop();
                    reject(CANCELLED);
                };
                signal.addEventListener("abort", onAbort, { once: true });
                void controls.then(() => {
                    signal.removeEventListener("abort", onAbort);
                    resolve();
                });
            });
        };

        const stageSize = () => {
            const rect = stageRef.current?.getBoundingClientRect();
            return { w: rect?.width ?? 0, h: rect?.height ?? 0 };
        };

        const resolveTarget = (target: string, { anchor = "center", offset }: MoveOptions = {}) => {
            const stage = stageRef.current;
            const el = stage?.querySelector<HTMLElement>(`[data-demo="${target}"]`);
            if (!stage || !el) return null;
            const s = stage.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            const px = {
                center: 0.5,
                left: 0.15,
                right: 0.85,
                top: 0.5,
                bottom: 0.5,
            }[anchor];
            const py = { center: 0.5, left: 0.5, right: 0.5, top: 0.25, bottom: 0.8 }[anchor];
            return {
                x: r.left - s.left + r.width * px + (offset?.x ?? 0),
                y: r.top - s.top + r.height * py + (offset?.y ?? 0),
            };
        };

        const moveToPoint = async (tx: number, ty: number, duration?: number) => {
            const d = duration ?? travelDuration(tx - x.get(), ty - y.get());
            await Promise.all([run(x, tx, d, MOVE_EASE_X), run(y, ty, d, MOVE_EASE_Y)]);
        };

        const ctx: DemoContext = {
            iteration: 0,
            wait,
            place: (px, py) => {
                x.set(px);
                y.set(py);
            },
            placeAt: (target, options) => {
                const point = resolveTarget(target, options);
                if (point) ctx.place(point.x, point.y);
            },
            moveTo: async (target, options) => {
                guard();
                const point = resolveTarget(target, options);
                if (!point) return;
                setHovered(null);
                await moveToPoint(point.x, point.y, options?.duration);
                setHovered(target);
            },
            moveToPoint: async (px, py, duration) => {
                setHovered(null);
                await moveToPoint(px, py, duration);
            },
            park: async (corner = "bottom-right") => {
                const { w, h } = stageSize();
                setHovered(null);
                const point = {
                    "bottom-right": { x: w * 0.86, y: h * 0.78 },
                    "bottom-left": { x: w * 0.12, y: h * 0.8 },
                    right: { x: w * 0.92, y: h * 0.45 },
                }[corner];
                await moveToPoint(point.x, point.y);
            },
            click: async () => {
                guard();
                setPressed(true);
                setClicks((c) => c + 1);
                await wait(130);
                setPressed(false);
                await wait(120);
            },
            press: () => setPressed(true),
            release: () => setPressed(false),
            show: () => run(opacity, 1, 0.3, MOVE_EASE_X),
            hide: () => run(opacity, 0, 0.3, MOVE_EASE_X),
            carry: setCarry,
            chapter: changeChapter,
            type: async (text, onChange, speed = 55) => {
                for (let i = 1; i <= text.length; i++) {
                    guard();
                    onChange(text.slice(0, i));
                    await wait(reducedMotion ? 0 : typingDelay(text[i - 1], speed));
                }
            },
        };

        const loop = async () => {
            try {
                for (let iteration = 0; !signal.aborted; iteration++) {
                    ctx.iteration = iteration;
                    setIteration(iteration);
                    const { w, h } = stageSize();
                    opacity.set(0);
                    ctx.place(w + 24, h * 0.75);
                    setHovered(null);
                    setPressed(false);
                    setCarry(null);
                    setFading(false);
                    await scriptRef.current(ctx);
                    setFading(true);
                    setHovered(null);
                    await Promise.all([ctx.hide(), wait(550)]);
                }
            } catch (error) {
                if (error !== CANCELLED) throw error;
            }
        };

        void loop();
        return () => controller.abort();
    }, [changeChapter, opacity, reducedMotion, x, y]);

    return {
        stageRef,
        cursor: { x, y, opacity, pressed, clicks, carry, hidden: reducedMotion },
        hovered,
        fading,
        iteration,
        chapter,
        chapterCount: chapters,
    };
};
