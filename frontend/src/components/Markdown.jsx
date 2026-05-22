function Markdown({ source, tone = "light" }) {
  const lines = (source ?? "").split("\n");
  const out = [];
  const palette =
    tone === "dark"
      ? {
          headingStrong: "text-white",
          headingSoft: "text-slate-100",
          body: "text-slate-300",
          inlineCode:
            "bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-sm text-slate-100",
          blockquote: "border-l-2 border-cyan-400 pl-3 my-2 text-slate-300 italic",
          codeBlock:
            "bg-slate-900/80 border border-white/10 rounded-lg p-4 overflow-x-auto my-3 text-sm text-slate-100",
          strong: "text-white",
          list: "ml-5 list-disc text-slate-300",
        }
      : {
          headingStrong: "text-slate-900",
          headingSoft: "text-slate-800",
          body: "text-slate-700",
          inlineCode:
            "bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-sm text-slate-700",
          blockquote: "border-l-2 border-indigo-400 pl-3 my-2 text-slate-600 italic",
          codeBlock:
            "bg-slate-100 border border-slate-200 rounded-lg p-4 overflow-x-auto my-3 text-sm text-slate-800",
          strong: "text-slate-900",
          list: "ml-5 list-disc text-slate-700",
        };

  let inCode = false;
  let codeBuf = [];

  const flushCode = (key) => {
    out.push(
      <pre key={key} className={palette.codeBlock}>
        <code>{codeBuf.join("\n")}</code>
      </pre>
    );
    codeBuf = [];
  };

  const inline = (text) => {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let match;
    let index = 0;

    while ((match = regex.exec(text))) {
      if (match.index > last) parts.push(text.slice(last, match.index));

      const token = match[0];
      if (token.startsWith("**")) {
        parts.push(
          <strong key={index += 1} className={palette.strong}>
            {token.slice(2, -2)}
          </strong>
        );
      } else {
        parts.push(
          <code key={index += 1} className={palette.inlineCode}>
            {token.slice(1, -1)}
          </code>
        );
      }

      last = match.index + token.length;
    }

    if (last < text.length) parts.push(text.slice(last));

    return parts;
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode(`code-${idx}`);
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeBuf.push(line);
      return;
    }

    if (line.startsWith("### ")) {
      out.push(
        <h3 key={idx} className={`${palette.headingSoft} mt-5 mb-2`}>
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      out.push(
        <h2 key={idx} className={`${palette.headingStrong} tracking-tight mt-6 mb-2`}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      out.push(
        <h1 key={idx} className={`${palette.headingStrong} tracking-tight mt-4 mb-2`}>
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("> ")) {
      out.push(
        <blockquote key={idx} className={palette.blockquote}>
          {inline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      out.push(
        <li key={idx} className={palette.list}>
          {inline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      out.push(<div key={idx} className="h-2" />);
    } else {
      out.push(
        <p key={idx} className={`${palette.body} leading-relaxed`}>
          {inline(line)}
        </p>
      );
    }
  });

  if (inCode) flushCode("code-end");

  return <div className="space-y-1">{out}</div>;
}

export { Markdown };
