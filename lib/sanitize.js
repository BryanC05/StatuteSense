import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Used to wrap AI-generated markdown output before rendering
 * via dangerouslySetInnerHTML.
 *
 * @param {string} dirty - Raw HTML string (e.g., from marked.parse())
 * @returns {string} Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty) {
  if (typeof window === "undefined") return dirty || "";
  return DOMPurify.sanitize(dirty || "", {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "b", "i", "u", "s",
      "a", "code", "pre", "blockquote",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div", "sub", "sup",
      "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "src", "alt"],
  });
}
