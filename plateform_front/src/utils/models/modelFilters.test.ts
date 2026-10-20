import { RagModel } from "types/models/models";
import { NO_FILTERS, applyModelFilters, getProviderOptions } from "./modelFilters";

const model = (id: string, name: string, extra: Partial<RagModel> = {}): RagModel => ({ id, name, ...extra });

const perMillion = (usd: number) => ({ prompt: String(usd / 1_000_000), completion: "0" });

const models = [
    model("openai/gpt-cheap", "OpenAI: GPT Cheap", { pricing: perMillion(0.1), context_length: 128_000, created: 10 }),
    model("~openai/gpt-alias", "OpenAI: GPT Alias", {
        pricing: perMillion(0.5),
        context_length: 1_000_000,
        created: 30,
    }),
    model("anthropic/claude", "Anthropic: Claude", {
        pricing: perMillion(3),
        context_length: 200_000,
        supported_parameters: ["reasoning"],
        created: 20,
    }),
];

const ids = (list: RagModel[]) => list.map((m) => m.id);

describe("model filters", () => {
    it("groups ~alias routes with their provider and labels it from model names", () => {
        expect(getProviderOptions(models)).toEqual([
            { slug: "openai", label: "OpenAI", count: 2 },
            { slug: "anthropic", label: "Anthropic", count: 1 },
        ]);
    });

    it("filters by provider, price tier, context and reasoning", () => {
        const run = (patch: Partial<typeof NO_FILTERS>) =>
            ids(applyModelFilters(models, "", { ...NO_FILTERS, ...patch }, "default"));

        expect(run({ provider: "openai" })).toEqual(["openai/gpt-cheap", "~openai/gpt-alias"]);
        expect(run({ price: "budget" })).toEqual(["openai/gpt-cheap"]);
        expect(run({ price: "standard" })).toEqual(["~openai/gpt-alias"]);
        expect(run({ price: "premium" })).toEqual(["anthropic/claude"]);
        expect(run({ context: "1m" })).toEqual(["~openai/gpt-alias"]);
        expect(run({ reasoning: true })).toEqual(["anthropic/claude"]);
        expect(run({ provider: "openai", reasoning: true })).toEqual([]);
    });

    it("sorts by release date, newest first", () => {
        expect(ids(applyModelFilters(models, "", NO_FILTERS, "recent"))).toEqual([
            "~openai/gpt-alias",
            "anthropic/claude",
            "openai/gpt-cheap",
        ]);
    });
});
