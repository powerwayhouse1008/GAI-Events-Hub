import { env, pipeline } from "@huggingface/transformers";
import type { LanguageCode } from "@/lib/i18n";

type TranslationRequest = {
  id: number;
  text: string;
  source: LanguageCode;
  target: LanguageCode;
};

type TranslationPipeline = (text: string, options?: Record<string, unknown>) => Promise<Array<{ translation_text?: string }>>;
type PipelineFactory = (
  task: "translation",
  model: string,
  options: { dtype: "q8"; device: "wasm"; progress_callback: (info: { status?: string; progress?: number }) => void }
) => Promise<TranslationPipeline>;

const nllbModel = "Xenova/nllb-200-distilled-600M";
const modelToEnglish = "Xenova/opus-mt-mul-en";
const modelFromEnglish = "Xenova/opus-mt-en-mul";

const nllbLanguageCodes: Record<LanguageCode, string> = {
  ja: "jpn_Jpan",
  en: "eng_Latn",
  zh: "zho_Hans",
  vi: "vie_Latn"
};

const opusTargetCodes: Record<LanguageCode, string> = {
  ja: "jpn",
  en: "eng",
  zh: "zho",
  vi: "vie"
};

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

const pipelines = new Map<string, Promise<TranslationPipeline>>();

function postProgress(message: string, progress?: number) {
  self.postMessage({ type: "progress", message, progress });
}

async function getPipeline(model: string) {
  let loading = pipelines.get(model);
  if (!loading) {
    postProgress("Preparing translation model...");
    const createPipeline = pipeline as unknown as PipelineFactory;
    loading = createPipeline("translation", model, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (info: { status?: string; progress?: number }) => {
        if (info.status === "progress_total" && typeof info.progress === "number") {
          postProgress("Preparing translation model...", info.progress);
        }
      }
    });
    pipelines.set(model, loading);
  }
  return loading;
}

function readOutput(output: Array<{ translation_text?: string }>, fallback: string) {
  return output[0]?.translation_text?.trim().replace(/^>>[a-z]{3}<</i, "").trim() || fallback;
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

async function translateWithNllb(text: string, source: LanguageCode, target: LanguageCode) {
  const translator = await getPipeline(nllbModel);
  const output = await translator(text, {
    src_lang: nllbLanguageCodes[source],
    tgt_lang: nllbLanguageCodes[target],
    max_length: Math.max(128, Math.ceil(text.length * 2.2)),
    num_beams: 4,
    no_repeat_ngram_size: 3
  });
  return readOutput(output, text);
}

async function translateToEnglish(text: string, source: LanguageCode) {
  if (source === "en") return text;
  const translator = await getPipeline(modelToEnglish);
  const output = await translator(text, {
    max_length: Math.max(128, Math.ceil(text.length * 2)),
    num_beams: 4,
    no_repeat_ngram_size: 3
  });
  return readOutput(output, text);
}

async function translateFromEnglish(text: string, target: LanguageCode) {
  if (target === "en") return text;
  const translator = await getPipeline(modelFromEnglish);
  const output = await translator(`>>${opusTargetCodes[target]}<< ${text}`, {
    max_length: Math.max(128, Math.ceil(text.length * 2)),
    num_beams: 4,
    no_repeat_ngram_size: 3
  });
  return readOutput(output, text);
}

async function translateWithOpusFallback(text: string, source: LanguageCode, target: LanguageCode) {
  const english = await translateToEnglish(text, source);
  return translateFromEnglish(english, target);
}

async function translate(text: string, source: LanguageCode, target: LanguageCode) {
  if (source === target) return text;
  postProgress("Translating...");

  try {
    const directTranslation = await translateWithNllb(text, source, target);
    if (looksUsableTranslation(text, directTranslation, target)) return directTranslation;
    return await translateWithOpusFallback(text, source, target);
  } catch (error) {
    console.warn("NLLB translation failed; falling back to OPUS", error);
    return translateWithOpusFallback(text, source, target);
  }
}

self.addEventListener("message", (event: MessageEvent<TranslationRequest>) => {
  const { id, text, source, target } = event.data;
  translate(text, source, target)
    .then((translation) => {
      self.postMessage({ type: "complete", id, translation });
    })
    .catch((error) => {
      self.postMessage({ type: "error", id, error: error instanceof Error ? error.message : "Translation failed" });
    });
});
