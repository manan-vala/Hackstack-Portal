import "./markdown.css";

function Markdown({ source, tone = "light" }) {
  const lines = (source ?? "").split("\n");
  const out = [];
  const toneClass = tone === "dark" ? "md-dark" : "md-light";

  let inCode = false;
  let codeBuf = [];

  const flushCode = (key) => {
    out.push(
      <pre key={key} className="md-code-block">
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
          <strong key={index += 1} className="md-strong">
            {token.slice(2, -2)}
          </strong>
        );
      } else {
        parts.push(
          <code key={index += 1} className="md-inline-code">
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
        <h3 key={idx} className="md-h3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      out.push(
        <h2 key={idx} className="md-h2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      out.push(
        <h1 key={idx} className="md-h1">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("> ")) {
      out.push(
        <blockquote key={idx} className="md-blockquote">
          {inline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      out.push(
        <li key={idx} className="md-list-item">
          {inline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      out.push(<div key={idx} className="md-spacer" />);
    } else {
      out.push(
        <p key={idx} className="md-body">
          {inline(line)}
        </p>
      );
    }
  });

  if (inCode) flushCode("code-end");

  return <div className={`md-root ${toneClass}`}>{out}</div>;
}

export { Markdown };

