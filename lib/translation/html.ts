function canTranslateText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (/^[\d\s:./+\-,()]+$/.test(trimmed)) return false;
  return true;
}

export async function translateHtmlPreservingMarkup(html: string, translateText: (text: string) => Promise<string>) {
  if (!html.trim()) return html;

  const document = new DOMParser().parseFromString(html, "text/html");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script,style,code,pre")) return NodeFilter.FILTER_REJECT;
      return canTranslateText(node.textContent || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const original = node.textContent || "";
    node.textContent = await translateText(original);
  }

  return document.body.innerHTML;
}
