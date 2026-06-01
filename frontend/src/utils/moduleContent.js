function cleanLine(line = "") {
  return line
    .replace(/^>\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function extractMarkdownSummary(markdown = "") {
  const lines = markdown.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("- ") || trimmed.startsWith("> ")) {
      continue;
    }

    return cleanLine(trimmed);
  }

  return "";
}

export function extractMarkdownGoals(markdown = "") {
  const lines = markdown.split("\n");
  const goals = [];
  let collecting = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^###\s+(Today's Goals|Requirements)$/i.test(trimmed)) {
      collecting = true;
      continue;
    }

    if (collecting && trimmed.startsWith("- ")) {
      goals.push(cleanLine(trimmed.slice(2)));
      continue;
    }

    if (collecting && trimmed && !trimmed.startsWith("- ")) {
      break;
    }
  }

  return goals;
}

export function extractMarkdownTask(markdown = "") {
  const lines = markdown.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("> **Task:**")) {
      return cleanLine(trimmed.replace("> **Task:**", ""));
    }

    if (trimmed.startsWith("> Task:")) {
      return cleanLine(trimmed.replace("> Task:", ""));
    }
  }

  return "";
}
