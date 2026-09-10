import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getLanguage, type LanguageCode } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const requestSchema = z.object({
  texts: z.array(z.string().min(1)).max(100),
  target: z.string(),
  source: z.string().optional(),
  translations: z.array(z.string()).optional()
});

type TranslationCacheRow = {
  source_text: string;
  translated_text: string;
};

function textHash(source: string, target: LanguageCode, text: string) {
  return createHash("sha256").update(`${source}\0${target}\0${text}`).digest("hex");
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ translations: [], missing: [] }, { status: 400 });
  }

  const target = getLanguage(parsed.data.target);
  const source = parsed.data.source || "ja";
  const texts = parsed.data.texts.map((text) => text.trim()).filter(Boolean);

  if (target === "ja" || !texts.length) {
    return NextResponse.json({ translations: texts, missing: [] });
  }

  try {
    const supabase = createAdminClient();
    const hashes = texts.map((text) => textHash(source, target, text));

    if (parsed.data.translations?.length === texts.length) {
      await supabase.from("translation_cache").upsert(
        texts.map((sourceText, index) => ({
          source_lang: source,
          target_lang: target,
          source_hash: textHash(source, target, sourceText),
          source_text: sourceText,
          translated_text: parsed.data.translations?.[index] || sourceText,
          model: "chrome-translator-api"
        })),
        { onConflict: "source_lang,target_lang,source_hash" }
      );
    }

    const { data, error } = await supabase
      .from("translation_cache")
      .select("source_text, translated_text")
      .eq("source_lang", source)
      .eq("target_lang", target)
      .in("source_hash", hashes);

    if (error) throw error;

    const cache = new Map<string, string>();
    (data as TranslationCacheRow[] | null)?.forEach((row) => {
      cache.set(row.source_text, row.translated_text);
    });

    return NextResponse.json(
      {
        translations: texts.map((text) => cache.get(text) || text),
        missing: texts.filter((text) => !cache.has(text))
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
        }
      }
    );
  } catch (error) {
    console.error("Translation cache failed", error);
    return NextResponse.json(
      {
        translations: texts,
        missing: texts,
        error: error instanceof Error ? error.message : "Translation cache failed"
      },
      { status: 200 }
    );
  }
}
