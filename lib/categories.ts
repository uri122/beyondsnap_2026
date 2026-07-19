import type { CeremonyCategory } from "@/types/database";

export const CEREMONY_CATEGORIES: { slug: CeremonyCategory; label: string; labelEn: string; desc: string }[] = [
  { slug: "bright", label: "밝은홀", labelEn: "BRIGHT", desc: "화사하고 맑은 감성" },
  { slug: "dark", label: "어두운홀", labelEn: "DARK", desc: "웅장하고 고급스러운 무드" },
  { slug: "outdoor", label: "야외", labelEn: "OUTDOOR", desc: "자연과 동화되는 싱그러움" },
  { slug: "church", label: "교회", labelEn: "CHURCH", desc: "경건하고 성스러운 채플" },
];

export function getCeremonyCategoryLabel(slug: string): string {
  return CEREMONY_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function getCeremonyCategoryLabelEn(slug: string): string {
  return CEREMONY_CATEGORIES.find((c) => c.slug === slug)?.labelEn ?? slug.toUpperCase();
}

export function isCeremonyCategory(slug: string): slug is CeremonyCategory {
  return CEREMONY_CATEGORIES.some((c) => c.slug === slug);
}
