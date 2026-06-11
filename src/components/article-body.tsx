import React from "react";

// Lightweight, dependency-free renderer for the "markdown-lite" stored in
// ai_news.content. Supports: "## " headings, "- " bullet lists, "1. " numbered
// lists, blank-line paragraph breaks and **bold** inline.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{p}</React.Fragment>;
  });
}

export function ArticleBody({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let bullets: string[] = [];
  let numbered: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const text = para.join(" ");
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm leading-relaxed text-foreground/85">
          {renderInline(text, `p${blocks.length}`)}
        </p>,
      );
      para = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="ml-1 space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{renderInline(b, `ul${blocks.length}-${i}`)}</span>
            </li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  const flushNumbered = () => {
    if (numbered.length) {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="ml-1 space-y-1.5">
          {numbered.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/85">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">{i + 1}</span>
              <span>{renderInline(b, `ol${blocks.length}-${i}`)}</span>
            </li>
          ))}
        </ol>,
      );
      numbered = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushBullets();
    flushNumbered();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flushAll();
      continue;
    }
    if (line.startsWith("## ")) {
      flushAll();
      blocks.push(
        <h2 key={`h-${blocks.length}`} className="font-display text-base font-semibold text-foreground pt-1">
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    const numMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      flushPara();
      flushBullets();
      numbered.push(numMatch[1]);
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      flushNumbered();
      bullets.push(line.slice(2));
      continue;
    }
    flushBullets();
    flushNumbered();
    para.push(line);
  }
  flushAll();

  return <div className="space-y-3">{blocks}</div>;
}
