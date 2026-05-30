"use client";

import { useEffect } from "react";

function dotsHtml() {
  return '<span class="loading-dots" aria-label="読み込み中"><span></span><span></span><span></span></span>';
}

function setLoading(element: HTMLElement | null) {
  if (!element || element.dataset.globalLoading === "true") return;
  element.dataset.originalHtml = element.innerHTML;
  element.dataset.globalLoading = "true";
  element.innerHTML = dotsHtml();
  if (element instanceof HTMLButtonElement) {
    element.disabled = true;
  }
}

function resetLoadingButtons() {
  document.querySelectorAll<HTMLElement>("[data-global-loading='true']").forEach((element) => {
    if (element.dataset.originalHtml) element.innerHTML = element.dataset.originalHtml;
    delete element.dataset.globalLoading;
    delete element.dataset.originalHtml;
    if (element instanceof HTMLButtonElement) {
      element.disabled = false;
    }
  });
}

export function GlobalButtonLoading() {
  useEffect(() => {
    const onSubmit = (event: SubmitEvent) => {
      const submitter = event.submitter as HTMLElement | null;
      if (submitter?.closest("[data-skip-global-loading='true']")) return;
      setLoading(submitter);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.closest("[data-skip-global-loading='true']")) return;
      if (link.target || link.href.includes("#")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      setLoading(link);
    };

    const onPageShow = () => resetLoadingButtons();

    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
