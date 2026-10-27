const explicitRarityPattern = /\b(?:rare|rarity|rarest|least\s+common|uncommon|scarce)\b/i;
const prevalencePattern = /\b\d+(?:\.\d+)?\s*%|\b(?:one|two)\s+percent\b|\b(?:one|1)\s+in\s+(?:100|a\s+hundred)\b|\b(?:less|fewer|under)\s+than\s+(?:one|two|\d+(?:\.\d+)?)\s*(?:%|percent)\b|\b(?:one|1)\s*(?:–|-|to)\s*(?:two|2)\s*(?:%|percent)\b/i;

export const canonicalRarityQualification = "Some MBTI samples place INFJ around 1–2%; results vary by sample, region, and method; rare does not mean ranked.";

export function containsRarityClaim(copy: string) {
  return explicitRarityPattern.test(copy) || prevalencePattern.test(copy);
}

export function hasCompleteRarityQualification(copy: string) {
  const normalize = (value: string) => value.toLowerCase().replaceAll("—", "-").replaceAll("–", "-").replace(/\s+/g, " ").trim();
  return normalize(copy).includes(normalize(canonicalRarityQualification));
}
