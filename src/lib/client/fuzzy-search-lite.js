export class RegexFuzzySearch {
  constructor(items, key = (x) => x) {
    this.items = items;
    this.key = key;
  }

  search(query, limit = 10) {
    if (!query) return [];

    // Build a regex like /a.*b.*c/i for query "abc"
    const pattern = query
      .split('')
      .map((c) => escapeRegex(c))
      .join('.*');
    const regex = new RegExp(pattern, 'i');

    const results = this.items
      .map((item) => {
        const value = this.key(item);
        return regex.test(value) ? { item, score: value.length } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);

    return results;
  }

  updateItems(newItems) {
    this.items = newItems;
  }
}

// Escape regex special characters in query
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
