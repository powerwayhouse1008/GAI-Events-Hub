import type { LanguageCode } from "@/lib/i18n";
import { translateHtmlPreservingMarkup } from "@/lib/translation/html";
import type {
  CommentTranslationInput,
  CommentTranslations,
  EventTranslationInput,
  EventTranslations,
  TranslationProgress
} from "@/lib/translation/types";

const targetLanguages: LanguageCode[] = ["ja", "en", "zh", "vi"];
const maxChunkLength = 360;
const protectedSegmentPattern =
  /(https?:\/\/\S+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:[#@][\p{L}\p{N}_-]+)|[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0E\uFE0F]+|[\u{1F1E6}-\u{1F1FF}]{2}|[©®™✓✔✕✖★☆♥♦♣♠•…→←↑↓↔↩↪])+/gu;
const bracketPairPattern = /(\([^()\n]+\)|（[^（）\n]+）|\[[^[\]\n]+\]|【[^【】\n]+】|「[^「」\n]+」|『[^『』\n]+』)/g;

let worker: Worker | null = null;
let nextRequestId = 1;

function getWorker() {
  worker ??= new Worker(new URL("../../workers/translation.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

async function readCached(texts: string[], source: LanguageCode, target: LanguageCode) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, source, target })
  });

  if (!response.ok) return { translations: texts, missing: texts };
  return (await response.json()) as { translations: string[]; missing: string[] };
}

async function writeCached(texts: string[], translations: string[], source: LanguageCode, target: LanguageCode) {
  await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, translations, source, target })
  }).catch(() => null);
}

function containsCjk(text: string) {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
}

function containsJapaneseKana(text: string) {
  return /[\u3040-\u30ff]/.test(text);
}

function containsVietnameseMarks(text: string) {
  return /[\u0103\u00e2\u0111\u00ea\u00f4\u01a1\u01b0\u00e1\u00e0\u1ea3\u00e3\u1ea1\u1eaf\u1eb1\u1eb3\u1eb5\u1eb7\u1ea5\u1ea7\u1ea9\u1eab\u1ead\u00e9\u00e8\u1ebb\u1ebd\u1eb9\u1ebf\u1ec1\u1ec3\u1ec5\u1ec7\u00ed\u00ec\u1ec9\u0129\u1ecb\u00f3\u00f2\u1ecf\u00f5\u1ecd\u1ed1\u1ed3\u1ed5\u1ed7\u1ed9\u1edb\u1edd\u1edf\u1ee1\u1ee3\u00fa\u00f9\u1ee7\u0169\u1ee5\u1ee9\u1eeb\u1eed\u1eef\u1ef1\u00fd\u1ef3\u1ef7\u1ef9\u1ef5]/i.test(text);
}

function hasTranslatableLetters(text: string) {
  return /[\p{L}\p{N}]/u.test(text);
}

function canSkipTranslation(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (!hasTranslatableLetters(trimmed)) return true;
  return trimmed.replace(protectedSegmentPattern, "").trim() === "";
}

function looksUsableTranslation(sourceText: string, translatedText: string, target: LanguageCode) {
  const source = sourceText.trim();
  const translated = translatedText.trim();
  if (!translated) return false;
  if (translated === source && source.length > 20) return false;
  if ((target === "en" || target === "vi") && containsCjk(translated)) return false;
  if (target === "zh" && containsJapaneseKana(translated)) return false;
  if (target === "vi" && translated.length > 40 && !containsVietnameseMarks(translated)) return false;
  if (source.length > 120 && translated.length < source.length * 0.35) return false;
  return true;
}

function splitLongPiece(piece: string) {
  const chunks: string[] = [];
  for (let index = 0; index < piece.length; index += maxChunkLength) {
    chunks.push(piece.slice(index, index + maxChunkLength));
  }
  return chunks;
}

function splitTextForTranslation(text: string) {
  const parts = text.match(/[^\n\u3002\uff01\uff1f.!?]+[\n\u3002\uff01\uff1f.!?]*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    if ((current + part).length <= maxChunkLength) {
      current += part;
      continue;
    }

    if (current.trim()) chunks.push(current);
    if (part.length > maxChunkLength) chunks.push(...splitLongPiece(part));
    else current = part;
  }

  if (current.trim()) chunks.push(current);
  return chunks.length ? chunks : [text];
}

function translateWithWorker(text: string, source: LanguageCode, target: LanguageCode, onProgress?: (progress: TranslationProgress) => void) {
  return new Promise<string>((resolve, reject) => {
    const activeWorker = getWorker();
    const id = nextRequestId++;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; id?: number; translation?: string; error?: string; message?: string; progress?: number };

      if (data.type === "progress") {
        onProgress?.({ stage: "loading", message: data.message || "Loading translation model...", progress: data.progress });
        return;
      }

      if (data.id !== id) return;
      activeWorker.removeEventListener("message", onMessage);

      if (data.type === "complete") resolve(data.translation || text);
      else reject(new Error(data.error || "Translation failed"));
    };

    activeWorker.addEventListener("message", onMessage);
    activeWorker.postMessage({ id, text, source, target });
  });
}

async function translateUncached(text: string, source: LanguageCode, target: LanguageCode, onProgress?: (progress: TranslationProgress) => void) {
  const chunks = splitTextForTranslation(text);
  if (chunks.length === 1) return translateWithWorker(text, source, target, onProgress);

  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    translatedChunks.push(await translateWithWorker(chunk, source, target, onProgress));
  }
  return translatedChunks.join("");
}

async function translateProtectedSegments(text: string, source: LanguageCode, target: LanguageCode, onProgress?: (progress: TranslationProgress) => void) {
  const translatedPieces: string[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(protectedSegmentPattern)) {
    const index = match.index ?? 0;
    const piece = text.slice(lastIndex, index);
    translatedPieces.push(canSkipTranslation(piece) ? piece : await translateUncached(piece, source, target, onProgress));
    translatedPieces.push(match[0]);
    lastIndex = index + match[0].length;
  }

  const tail = text.slice(lastIndex);
  translatedPieces.push(canSkipTranslation(tail) ? tail : await translateUncached(tail, source, target, onProgress));

  return translatedPieces.join("");
}

async function translateBracketAware(text: string, source: LanguageCode, target: LanguageCode, onProgress?: (progress: TranslationProgress) => void) {
  const parts = text.split(bracketPairPattern);
  const translatedParts: string[] = [];

  for (const part of parts) {
    const bracketMatch = part.match(/^([([（【「『])([\s\S]*)([)\]）】」』])$/);
    if (!bracketMatch) {
      translatedParts.push(canSkipTranslation(part) ? part : await translateProtectedSegments(part, source, target, onProgress));
      continue;
    }

    const [, open, inner, close] = bracketMatch;
    const translatedInner = canSkipTranslation(inner) ? inner : await translateProtectedSegments(inner, source, target, onProgress);
    translatedParts.push(`${open}${translatedInner}${close}`);
  }

  return translatedParts.join("");
}

async function translatePlainText(text: string, source: LanguageCode, target: LanguageCode, onProgress?: (progress: TranslationProgress) => void) {
  if (!text.trim() || source === target || canSkipTranslation(text)) return text;

  const cached = await readCached([text], source, target);
  const cachedTranslation = cached.translations[0] || "";
  if (!cached.missing.length && looksUsableTranslation(text, cachedTranslation, target)) return cachedTranslation;

  const translated = await translateBracketAware(text, source, target, onProgress);
  if (looksUsableTranslation(text, translated, target)) {
    await writeCached([text], [translated], source, target);
    return translated;
  }

  return text;
}

export async function prepareEventTranslations(
  input: EventTranslationInput,
  onProgress?: (progress: TranslationProgress) => void
): Promise<EventTranslations> {
  const title_i18n = Object.fromEntries(targetLanguages.map((language) => [language, input.sourceLanguage === language ? input.title : ""])) as Record<LanguageCode, string>;
  const description_i18n = Object.fromEntries(targetLanguages.map((language) => [language, input.sourceLanguage === language ? input.description : ""])) as Record<LanguageCode, string>;
  const location_i18n = Object.fromEntries(targetLanguages.map((language) => [language, input.sourceLanguage === language ? input.location : ""])) as Record<LanguageCode, string>;

  for (const target of targetLanguages) {
    if (target === input.sourceLanguage) continue;
    onProgress?.({ stage: "translating", message: "Translating..." });

    title_i18n[target] = await translatePlainText(input.title, input.sourceLanguage, target, onProgress);
    location_i18n[target] = await translatePlainText(input.location, input.sourceLanguage, target, onProgress);
    description_i18n[target] = await translateHtmlPreservingMarkup(input.description, (text) =>
      translatePlainText(text, input.sourceLanguage, target, onProgress)
    );
  }

  return { title_i18n, description_i18n, location_i18n };
}

export async function prepareCommentTranslations(
  input: CommentTranslationInput,
  onProgress?: (progress: TranslationProgress) => void
): Promise<CommentTranslations> {
  const content_i18n = Object.fromEntries(
    targetLanguages.map((language) => [language, input.sourceLanguage === language ? input.content : ""])
  ) as Record<LanguageCode, string>;

  for (const target of targetLanguages) {
    if (target === input.sourceLanguage) continue;
    onProgress?.({ stage: "translating", message: "Translating comment..." });
    content_i18n[target] = await translatePlainText(input.content, input.sourceLanguage, target, onProgress);
  }

  return { content_i18n };
}
