// [DOC-RU]
// Если ты расширяешь список, добавляй короткие и практичные фразы, которые подходят для рабочего ритма.
// В текущей логике цитата меняется автоматически 1 раз в день через getDailyQuote.
// Основной источник: public/quotes.json.

export interface DailyQuote {
    id: string;
    text: string;
    author: string;
}

type RawQuote = {
    id?: unknown;
    text?: unknown;
    author?: unknown;
};

const quotesJson: RawQuote[] = [
    { id: "q1", text: "Четкий следующий шаг важнее длинного обсуждения.", author: "Майк Тайсон" },
    { id: "q2", text: "Дисциплина важнее настроения.", author: "Мухаммад Али" },
    { id: "q3", text: "Скорость реакции дает преимущество в любой воронке.", author: "Флойд Мейвезер" },
    { id: "q4", text: "Стабильность в рутине побеждает хаотичные рывки.", author: "Мэнни Пакьяо" },
];

function normalizeQuoteText(value: string) {
    const text = value.trim();
    // В JSON часть цитат уже обрамлена «», убираем внешний слой, чтобы не было ««...». 
    if (text.startsWith("«") && text.endsWith("»") && text.length > 2) {
        return text.slice(1, -1).trim();
    }
    return text;
}

function normalizeQuotes(input: RawQuote[]) {
    const normalized: DailyQuote[] = [];

    input.forEach((quote) => {
        const id = typeof quote.id === "string" ? quote.id.trim() : "";
        const text = typeof quote.text === "string" ? normalizeQuoteText(quote.text) : "";
        const author = typeof quote.author === "string" ? quote.author.trim() : "";

        if (!id || !text || !author) return;

        normalized.push({ id, text, author });
    });

    if (normalized.length > 0) return normalized;

    return [
        {
            id: "fallback-1",
            text: "Четкий следующий шаг важнее длинного обсуждения.",
            author: "Продажи",
        },
    ];
}

const DAILY_QUOTES = normalizeQuotes(quotesJson as RawQuote[]);

function getDaySeed(date: Date) {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.floor((dayStart.getTime() - yearStart.getTime()) / 86400000);
}

function hashString(input: string) {
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function createSeededRng(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function getPermutedIndex(length: number, userKey: string, daySeed: number) {
    const cycle = Math.floor(daySeed / length);
    const positionInCycle = daySeed % length;
    const rngSeed = hashString(`${userKey}:${cycle}`);
    const rng = createSeededRng(rngSeed);
    const indices = Array.from({ length }, (_, index) => index);

    for (let index = indices.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(rng() * (index + 1));
        const current = indices[index];
        indices[index] = indices[swapIndex];
        indices[swapIndex] = current;
    }

    return indices[positionInCycle];
}

export function getDailyQuote(userKey = "default", date = new Date()): DailyQuote {
    if (DAILY_QUOTES.length === 0) {
        return {
            id: "fallback",
            text: "Держи фокус на том, что двигает сделку вперед.",
            author: "Система",
        };
    }

    const safeUserKey = userKey.trim() || "default";
    const daySeed = getDaySeed(date);
    const index = getPermutedIndex(DAILY_QUOTES.length, safeUserKey, daySeed);
    return DAILY_QUOTES[index];
}
