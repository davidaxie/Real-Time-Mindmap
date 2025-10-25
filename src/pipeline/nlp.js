const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by',
  'is', 'are', 'be', 'we', 'you', 'i', 'it', 'that', 'this', 'as', 'our', 'your',
  'from', 'about', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can',
  'could', 'should', 'they', 'them', 'their', 'but', 'if', 'not', 'so', 'what',
  'which', 'who', 'where', 'when', 'why', 'how', 'all', 'each', 'few', 'more',
  'most', 'other', 'some', 'than', 'these', 'those', 'both', 'does', 'did', 'do'
]);

const recentHashes = new Map();
const DUP_WINDOW_MS = 1000;

export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text) {
  const normalized = normalize(text);
  const matches = normalized.match(/[a-z0-9'-]+/g) || [];
  return matches.filter(token => {
    return token.length >= 3 && !STOPWORDS.has(token);
  });
}

export function extractPhrases(tokens, windowSize = 2) {
  const phrases = [];
  
  for (let i = 0; i <= tokens.length - windowSize; i++) {
    const phrase = tokens.slice(i, i + windowSize).join(' ');
    if (phrase.length > 3) {
      phrases.push(phrase);
    }
  }
  
  // Score by frequency
  const freq = {};
  phrases.forEach(p => freq[p] = (freq[p] || 0) + 1);
  
  return Object.entries(freq)
    .map(([phrase, score]) => ({ phrase, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function canonicalize(tokensOrPhrases) {
  const canonicals = new Set();
  
  for (const item of tokensOrPhrases) {
    const normalized = item.toLowerCase().trim();
    if (normalized.length >= 3) {
      canonicals.add(normalized);
    }
  }
  
  return Array.from(canonicals).map(text => {
    return { canonical: text, alias: text };
  });
}

export function isDuplicate(text, withinMs = DUP_WINDOW_MS) {
  const hash = hashSimple(text);
  const now = Date.now();
  
  if (recentHashes.has(hash)) {
    const seenAt = recentHashes.get(hash);
    if (now - seenAt < withinMs) {
      return true;
    }
  }
  
  recentHashes.set(hash, now);
  
  // Cleanup old hashes
  for (const [h, time] of recentHashes.entries()) {
    if (now - time > withinMs * 10) {
      recentHashes.delete(h);
    }
  }
  
  return false;
}

function hashSimple(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
