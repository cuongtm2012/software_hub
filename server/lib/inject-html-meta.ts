/** Escape for HTML attribute values (meta content=). */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inject google-site-verification meta before </head> if not already present. */
export function injectGoogleSiteVerification(html: string, token: string | null | undefined): string {
  const trimmed = token?.trim();
  if (!trimmed) return html;
  if (html.includes('name="google-site-verification"')) return html;

  const meta = `<meta name="google-site-verification" content="${escapeAttr(trimmed)}" />`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `    ${meta}\n  </head>`);
  }
  return `${meta}\n${html}`;
}
