import localSuggestions from "../assets/baselist.json";

function isSubsequence(query: string, target: string): boolean {
  let i = 0;
  const lowerQuery = query.toLowerCase();
  for (const char of target.toLowerCase()) {
    if (char === lowerQuery[i]) i++;
    if (i === lowerQuery.length) return true;
  }
  return false;
}

const suggestions = localSuggestions.map((item: string[]) => ({
  cmd: item[0],
  description: item[1],
}));

export default async function getLocalSuggestions(query: string) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return suggestions
    .filter(
      (item) =>
        isSubsequence(lowerQuery, item.cmd) ||
        (item.description && isSubsequence(lowerQuery, item.description))
    )
    .slice(0, 10);
}
