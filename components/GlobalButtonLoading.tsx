"use client";

import { useEffect } from "react";

function dotsHtml() {
  return '<span class="loading-dots" aria-label="読み込み中"><span></span><span></span><span></span></span>';
}

function setLoading(element: HTMLElement | null) {
  if (!element || element.dataset.globalLoading === "true") return;
  if (element instanceof HTMLButtonElement && element.disabled) return;
  element.dataset.originalHtml = element.innerHTML;
  element.dataset.globalLoading = "true";
  element.innerHTML = dotsHtml();
  if (element instanceof HTMLButtonElement) {
    element.disabled = true;
  }

  window.setTimeout(() => {
    if (element.dataset.globalLoading === "true") resetLoadingElement(element);
  }, 15000);
}

function resetLoadingElement(element: HTMLElement) {
  if (element.dataset.originalHtml) element.innerHTML = element.dataset.originalHtml;
  delete element.dataset.globalLoading;
  delete element.dataset.originalHtml;
  if (element instanceof HTMLButtonElement) {
    element.disabled = false;
  }
}

function resetLoadingButtons() {
  document.querySelectorAll<HTMLElement>("[data-global-loading='true']").forEach(resetLoadingElement);
}

export function GlobalButtonLoading() {
  useEffect(() => {
    const onSubmit = (event: SubmitEvent) => {
      const submitter = event.submitter as HTMLElement | null;
      if (submitter?.closest("[data-skip-global-loading='true']")) return;
      if ((event.target as HTMLElement | null)?.closest("[data-skip-global-loading='true']")) return;
      setLoading(submitter);
    };

    const onPageShow = () => resetLoadingButtons();

    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
