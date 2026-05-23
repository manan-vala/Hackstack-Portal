import { getModuleBlueprint } from "./moduleBlueprints";

const MODULE_THEMES = {
  "html-foundations": {
    accent: "#ff6a00",
    accentSoft: "#fff0e6",
    accentBorder: "rgba(255, 106, 0, 0.2)",
    banner: "linear-gradient(135deg, #ff7a18 0%, #ff3d00 58%, #ff003d 100%)",
    bannerShadow: "rgba(255, 106, 0, 0.24)",
    button: "linear-gradient(135deg, #ff7a18 0%, #ff004d 100%)",
    dot: "rgba(255, 255, 255, 0.22)",
    icon: "#fff3ee",
  },
  "css-mastery": {
    accent: "#1d78ff",
    accentSoft: "#eaf2ff",
    accentBorder: "rgba(29, 120, 255, 0.2)",
    banner: "linear-gradient(135deg, #26a7ff 0%, #1d78ff 58%, #2443df 100%)",
    bannerShadow: "rgba(37, 114, 255, 0.22)",
    button: "linear-gradient(135deg, #179bff 0%, #2847df 100%)",
    dot: "rgba(255, 255, 255, 0.2)",
    icon: "#eef6ff",
  },
  "javascript-essentials": {
    accent: "#f2a100",
    accentSoft: "#fff7df",
    accentBorder: "rgba(242, 161, 0, 0.18)",
    banner: "linear-gradient(135deg, #ffcc00 0%, #ffb100 52%, #ff8a00 100%)",
    bannerShadow: "rgba(255, 177, 0, 0.2)",
    button: "linear-gradient(135deg, #ffbf00 0%, #ff8a00 100%)",
    dot: "rgba(255, 255, 255, 0.2)",
    icon: "#fff7e4",
  },
  "react-modern-dev": {
    accent: "#11b8c9",
    accentSoft: "#e8fbfb",
    accentBorder: "rgba(17, 184, 201, 0.18)",
    banner: "linear-gradient(135deg, #22d3ee 0%, #12b8c9 56%, #14919b 100%)",
    bannerShadow: "rgba(18, 184, 201, 0.2)",
    button: "linear-gradient(135deg, #1bc7d8 0%, #148e99 100%)",
    dot: "rgba(255, 255, 255, 0.2)",
    icon: "#ecfeff",
  },
};

const DEFAULT_THEME = {
  accent: "#5663ff",
  accentSoft: "#eef0ff",
  accentBorder: "rgba(86, 99, 255, 0.18)",
  banner: "linear-gradient(135deg, #6675ff 0%, #5b53ff 60%, #3448ff 100%)",
  bannerShadow: "rgba(86, 99, 255, 0.2)",
  button: "linear-gradient(135deg, #6675ff 0%, #3448ff 100%)",
  dot: "rgba(255, 255, 255, 0.2)",
  icon: "#eef2ff",
};

export function getModuleTheme(slug) {
  return MODULE_THEMES[slug] || DEFAULT_THEME;
}

export function flattenModuleDays(module) {
  const days = [];
  let dayNumber = 1;

  for (const chapter of module.chapters || []) {
    for (const day of chapter.days || []) {
      const videoUrls = Array.isArray(day.videoUrl)
        ? day.videoUrl.filter(Boolean)
        : day.videoUrl
          ? [day.videoUrl]
          : [];

      days.push({
        id: day._id?.toString(),
        day: dayNumber,
        title: day.title,
        contentMarkdown: day.contentMarkdown,
        videoUrl: videoUrls[0] || "",
        videoUrls,
        chapterTitle: chapter.title,
      });
      dayNumber += 1;
    }
  }

  return days;
}

export function normalizeModule(module, index = 0) {
  const id = module._id?.toString() || module.id;
  const days = flattenModuleDays(module);
  const blueprint = getModuleBlueprint(module.slug);

  return {
    ...module,
    assessment: module.assessment || blueprint?.assessment || null,
    learningOutcomes:
      module.learningOutcomes?.length
        ? module.learningOutcomes
        : blueprint?.learningOutcomes || [],
    skills: module.skills?.length ? module.skills : blueprint?.skills || [],
    tools: module.tools?.length ? module.tools : blueprint?.tools || [],
    finalTask: module.finalTask || blueprint?.finalTask || "",
    id,
    days,
    theme: getModuleTheme(module.slug),
    week: module.week || blueprint?.week || index + 1,
    dayCount: days.length,
  };
}

export function getRegisteredModuleIds(user) {
  if (!user?.registeredModules?.length) return [];

  return user.registeredModules.map((entry) =>
    typeof entry === 'string' ? entry : entry._id?.toString() || entry.id
  );
}
