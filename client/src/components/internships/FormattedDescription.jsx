const linkPattern = /(https?:\/\/[^\s<]+)/g;

const renderTextWithLinks = (text) =>
  String(text || "").split(linkPattern).map((part, index) => {
    if (!/^https?:\/\//i.test(part)) return part;

    try {
      const url = new URL(part);
      if (!['http:', 'https:'].includes(url.protocol)) return part;
      return (
        <a
          key={`${part}-${index}`}
          href={url.toString()}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-4 hover:opacity-80"
        >
          {part}
        </a>
      );
    } catch {
      return part;
    }
  });

const getHeading = (line, nextLine) => {
  const markdown = line.match(/^(#{1,3})\s+(.+)$/);
  if (markdown) return { level: markdown[1].length, text: markdown[2] };
  if (/^[^.!?]{2,80}:$/.test(line)) return { level: 3, text: line.slice(0, -1) };
  if (!/[.!?]$/.test(line) && line.length <= 80 && !nextLine?.trim()) {
    return { level: 3, text: line };
  }
  return null;
};

export function FormattedDescription({ description, className = "" }) {
  const lines = String(description || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const heading = getHeading(line, lines[index + 1]);
    if (heading) {
      flushParagraph();
      blocks.push({ type: "heading", ...heading });
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph();
      const type = numbered ? "ordered" : "unordered";
      const items = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(
          type === "ordered" ? /^\d+[.)]\s+(.+)$/ : /^[-*•]\s+(.+)$/
        );
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      index -= 1;
      blocks.push({ type, items });
      continue;
    }

    paragraph.push(line);
  }
  flushParagraph();

  if (!blocks.length) {
    return <p className={className}>No full description configured.</p>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5";
          return <Heading key={index} className="font-display text-lg font-semibold text-[color:var(--text)]">{renderTextWithLinks(block.text)}</Heading>;
        }
        if (block.type === "unordered") {
          return <ul key={index} className="list-disc space-y-2 pl-5">{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderTextWithLinks(item)}</li>)}</ul>;
        }
        if (block.type === "ordered") {
          return <ol key={index} className="list-decimal space-y-2 pl-5">{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderTextWithLinks(item)}</li>)}</ol>;
        }
        return <p key={index}>{renderTextWithLinks(block.text)}</p>;
      })}
    </div>
  );
}
