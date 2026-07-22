/**
 * Yasa gore otomatik oyuncu grubu belirler.
 * Turnuva ve topluluk yonetimi bu gruplara gore filtrelenebilir.
 */
export function computeAgeGroup(age: number): string {
  if (age < 13) return "13 Yas Alti";
  if (age >= 13 && age <= 15) return "13-15";
  if (age >= 16 && age <= 18) return "16-18";
  if (age >= 19 && age <= 24) return "19-24";
  return "25+";
}

export const AGE_GROUPS = ["13 Yas Alti", "13-15", "16-18", "19-24", "25+"] as const;
