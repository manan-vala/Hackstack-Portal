const SLUG_COLORS = {
  'html-foundations': 'from-orange-500 to-red-600',
  'css-mastery': 'from-sky-500 to-blue-600',
  'javascript-essentials': 'from-amber-500 to-yellow-600',
  'react-modern-dev': 'from-violet-500 to-purple-600',
};

const DEFAULT_COLOR = 'from-indigo-500 to-blue-600';

export function getModuleColor(slug) {
  return SLUG_COLORS[slug] || DEFAULT_COLOR;
}

export function flattenModuleDays(module) {
  const days = [];
  let dayNumber = 1;

  for (const chapter of module.chapters || []) {
    for (const day of chapter.days || []) {
      days.push({
        id: day._id?.toString(),
        day: dayNumber,
        title: day.title,
        contentMarkdown: day.contentMarkdown,
        videoUrl: Array.isArray(day.videoUrl) ? day.videoUrl[0] : day.videoUrl,
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

  return {
    ...module,
    id,
    days,
    color: getModuleColor(module.slug),
    week: index + 1,
    dayCount: days.length,
  };
}

export function getRegisteredModuleIds(user) {
  if (!user?.registeredModules?.length) return [];

  return user.registeredModules.map((entry) =>
    typeof entry === 'string' ? entry : entry._id?.toString() || entry.id
  );
}
