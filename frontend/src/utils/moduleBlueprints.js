import { modules as blueprintModules } from "../data";

const blueprintEntries = blueprintModules.map((module) => [module.slug, module]);

export const moduleBlueprintsBySlug = Object.fromEntries(blueprintEntries);

export function getModuleBlueprint(slug) {
  return moduleBlueprintsBySlug[slug] || null;
}
