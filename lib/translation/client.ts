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
const maxChunkLength = 420;

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

function containsJapanese(text: string) {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
}

function containsVietnameseMarks(text: string) {
  return /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(text);
}

function looksUsableTranslation(sourceText: string, translatedText: string, target: LanguageCode) {
  const source = sourceText.trim();
  const translated = translatedText.trim();
  if (!translated) return false;
  if (translated === source && source.length > 20) return false;
  if ((target === "en" || target === "vi") && containsJapanese(translated)) return false;
  if (target === "vi" && translated.length > 40 && !containsVietnameseMarks(translated)) return false;
  if (source.length > 120 && translated.length < source.length * 0.35) return false;
  return true;
}

function splitTextForTranslation(text: string) {
  const parts = text.match(/[^\n。！？.!?]+[\n。！？.!?]*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    if ((current + part).length <= maxChunkLength) {
      current += part;
      continue;
    }

    if (current.trim()) chunks.push(current);
    current = part;

    while (current.length > maxChunkLength) {
      chunks.push(current.slice(0, maxChunkLength));
      current = current.slice(maxChunkLength);
    }
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

async function translatePlainText(text: string, source: LanguageCode, target: LanguageCode, onProgress?: (progress: TranslationProgress) => void) {
  if (!text.trim() || source === target) return text;

  const cached = await readCached([text], source, target);
  const cachedTranslation = cached.translations[0] || "";
  if (!cached.missing.length && looksUsableTranslation(text, cachedTranslation, target)) return cachedTranslation;

  const chunks = splitTextForTranslation(text);
  if (chunks.length > 1) {
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      translatedChunks.push(await translatePlainText(chunk, source, target, onProgress));
    }
    const translatedText = translatedChunks.join("");
    if (looksUsableTranslation(text, translatedText, target)) {
      await writeCached([text], [translatedText], source, target);
      return translatedText;
    }
  }

  const translated = await translateWithWorker(text, source, target, onProgress);
  await writeCached([text], [translated], source, target);
  return looksUsableTranslation(text, translated, target) ? translated : text;
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
