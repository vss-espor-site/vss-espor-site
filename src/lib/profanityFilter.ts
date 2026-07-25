// Basit kufur/hakaret filtresi - Turkce yaygin kufurlerin bir kismi.
// Eslesirse mesaj tamamen reddedilir (gonderilmez).
const BANNED_WORDS = [
  "amk", "aq", "amcik", "yarrak", "yarak", "siktir", "sikeyim", "orospu",
  "piç", "pic", "ibne", "göt", "got", "gotveren", "am", "amına", "amina",
  "sikik", "sik", "kahpe", "puşt", "pust", "yavşak", "yavsak", "mal",
  "salak", "gerizekali", "geri zekali", "aptal", "dallama", "sürtük", "surtuk",
];

export function containsProfanity(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/[0-9]/g, (d) => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s" }[d] || d))
    .replace(/[^a-zçğıöşü\s]/gi, "");

  return BANNED_WORDS.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(normalized);
  });
}
