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

const modelToEnglish = "Xenova/opus-mt-mul-en";
const modelFromEnglish = "Xenova/opus-mt-en-mul";
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
    postProgress("鄙ｻ險ｳ繝｢繝・Ν繧呈ｺ門ｙ縺励※縺・∪縺・..");
    const createPipeline = pipeline as unknown as PipelineFactory;
    loading = createPipeline("translation", model, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (info: { status?: string; progress?: number }) => {
        if (info.status === "progress_total" && typeof info.progress === "number") {
          postProgress("鄙ｻ險ｳ繝｢繝・Ν繧呈ｺ門ｙ縺励※縺・∪縺・..", info.progress);
        }
      }
    });
    pipelines.set(model, loading);
  }
  return loading;
}

function readOutput(output: Array<{ translation_text?: string }>, fallback: string) {
  return output[0]?.translation_text?.trim() || fallback;
}

async function translateToEnglish(text: string, source: LanguageCode) {
  if (source === "en") return text;
  const translator = await getPipeline(modelToEnglish);
  const output = await translator(text);
  return readOutput(output, text);
}

async function translateFromEnglish(text: string, target: LanguageCode) {
  if (target === "en") return text;
  const translator = await getPipeline(modelFromEnglish);
  const output = await translator(`>>${opusTargetCodes[target]}<< ${text}`);
  return readOutput(output, text);
}

async function translate(text: string, source: LanguageCode, target: LanguageCode) {
  if (source === target) return text;
  postProgress("鄙ｻ險ｳ荳ｭ...");
  const english = await translateToEnglish(text, source);
  return translateFromEnglish(english, target);
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
