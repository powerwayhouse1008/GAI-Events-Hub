import { LocalizedText } from "@/components/LocalizedText";

export function LoadingDots() {
  return (
    <span className="loading-dots" aria-label="Loading...">
      <span className="sr-only"><LocalizedText text="Loading..." /></span>
      <span />
      <span />
      <span />
    </span>
  );
}
