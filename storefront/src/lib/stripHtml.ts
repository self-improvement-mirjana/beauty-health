/**
 * Konvertuje HTML u običan tekst (bez `dangerouslySetInnerHTML`) radi bezbednog prikaza i meta opisa.
 */
export function stripHtmlToPlainText(html: string): string {
  const t = html.trim();
  if (!t) {
    return '';
  }
  if (typeof document === 'undefined') {
    return t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const d = document.createElement('div');
  d.innerHTML = t;
  return (d.textContent ?? '').replace(/\s+/g, ' ').trim();
}
