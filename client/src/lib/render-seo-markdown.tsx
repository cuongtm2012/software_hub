import type { ReactNode } from "react";

/** Strip Markdown image references like ![Freeware][freeware icon] from text. */
export function stripImageRefs(text: string): string {
  return text.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g, "").trim();
}

/** Lightweight markdown renderer for SEO content blocks (headings, lists, links, image references). */
export function renderSeoMarkdown(content: string): ReactNode[] {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const imgRefRe = /!\[([^\]]*)\]\[([^\]]*)\]/g;

  function renderInlineLinks(text: string, keyPrefix: string): ReactNode {
    const parts: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(linkRe.source, "g");
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const href = m[2];
      const isExternal = href.startsWith("http");
      parts.push(
        <a
          key={`${keyPrefix}-a-${m.index}`}
          href={href}
          className="text-[#004080] underline underline-offset-2 hover:text-[#003366]"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[1]}
        </a>,
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  function renderInline(text: string, keyPrefix: string): ReactNode {
    // First pass: extract image references ![alt][ref]
    const imgParts: ReactNode[] = [];
    let imgLast = 0;
    let imgM: RegExpExecArray | null;
    const imgRe = new RegExp(imgRefRe.source, "g");
    while ((imgM = imgRe.exec(text)) !== null) {
      if (imgM.index > imgLast) {
        imgParts.push(renderInlineLinks(text.slice(imgLast, imgM.index), `${keyPrefix}-before-${imgLast}`));
      }
      const alt = imgM[1] || "";
      const refName = imgM[2] || "";
      const label = alt || refName;
      imgParts.push(
        <span key={`${keyPrefix}-img-${imgM.index}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
          {label}
        </span>
      );
      imgLast = imgM.index + imgM[0].length;
    }
    if (imgLast < text.length) imgParts.push(renderInlineLinks(text.slice(imgLast), `${keyPrefix}-after`));
    return imgParts.length === 1 ? imgParts[0] : <>{imgParts}</>;
  }

  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={i} className="text-base font-semibold text-foreground mt-5 mb-2">
          {line.replace("## ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="text-muted-foreground ml-4 list-disc text-sm leading-relaxed">
          {renderInline(line.replace("- ", ""), `li-${i}`)}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">
        {renderInline(line, `p-${i}`)}
      </p>
    );
  });
}
