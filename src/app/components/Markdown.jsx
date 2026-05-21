function Markdown({ source }) {
  const lines = (source ?? "").split("\n");
  const out = [];
  let inCode = false;
  let codeBuf = [];

  const flushCode = (key) => {
    out.push(
      <pre
        key={key}
        className="bg-slate-100 border border-slate-200 rounded-lg p-4 overflow-x-auto my-3 text-sm text-slate-800"
      >
        <code>{codeBuf.join("\n")}</code>
      </pre>
    );
    codeBuf = [];
  };

  const inline = (text) => {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let m;
    let i = 0;
    while ((m = regex.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const t = m[0];
      if (t.startsWith("**"))
        parts.push(<strong key={i++} className="text-slate-900">{t.slice(2, -2)}</strong>);
      else
        parts.push(
          <code key={i++} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-sm text-slate-700">
            {t.slice(1, -1)}
          </code>
        );
      last = m.index + t.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCode) { flushCode(`code-${idx}`); inCode = false; }
      else inCode = true;
      return;
    }
    if (inCode) { codeBuf.push(line); return; }

    if (line.startsWith("### ")) {
      out.push(<h3 key={idx} className="text-slate-800 mt-5 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      out.push(<h2 key={idx} className="text-slate-900 tracking-tight mt-6 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      out.push(<h1 key={idx} className="text-slate-900 tracking-tight mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("> ")) {
      out.push(
        <blockquote key={idx} className="border-l-2 border-indigo-400 pl-3 my-2 text-slate-600 italic">
          {inline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      out.push(<li key={idx} className="ml-5 list-disc text-slate-700">{inline(line.slice(2))}</li>);
    } else if (line.trim() === "") {
      out.push(<div key={idx} className="h-2" />);
    } else {
      out.push(<p key={idx} className="text-slate-700 leading-relaxed">{inline(line)}</p>);
    }
  });

  if (inCode) flushCode("code-end");
  return <div className="space-y-1">{out}</div>;
}

export { Markdown };
