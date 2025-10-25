import { nowMs } from '../utils/time.js';

// Core state registries
const conceptsMap = new Map(); // id → Concept
const edgesMap = new Map(); // id → Edge
const segmentsArr = [];
const reverseIndex = new Map(); // token → Set<segmentId>

let segmentCounter = 0;

export function initState() {
  conceptsMap.clear();
  edgesMap.clear();
  segmentsArr.length = 0;
  reverseIndex.clear();
  segmentCounter = 0;
  return { conceptsMap, edgesMap, segmentsArr, reverseIndex };
}

export function upsertConcept(label, opts = {}) {
  const id = normalizeKey(label);
  const now = nowMs();
  
  if (!conceptsMap.has(id)) {
    conceptsMap.set(id, {
      id,
      canonical_label: label,
      aliases: new Set([label.toLowerCase()]),
      type: opts.type || 'topic',
      weight: 0,
      last_seen_at: now,
      aliases_extra: opts.aliases || []
    });
  }
  
  return conceptsMap.get(id);
}

export function addAlias(canonical, alias) {
  const concept = conceptsMap.get(normalizeKey(canonical));
  if (concept) {
    concept.aliases.add(alias.toLowerCase());
  }
}

export function touchConcept(id, delta, now) {
  const concept = conceptsMap.get(id);
  if (concept) {
    concept.weight += delta;
    concept.last_seen_at = now;
  }
}

export function upsertEdge(a, b, delta, source = 'cooccur', now) {
  const id = edgeId(a, b);
  
  if (!edgesMap.has(id)) {
    edgesMap.set(id, {
      id,
      source: a,
      target: b,
      weight: 0,
      last_seen_at: now,
      provenance: { cooccur: 0, ai: 0, sim: 0 }
    });
  }
  
  const edge = edgesMap.get(id);
  edge.weight += delta;
  edge.provenance[source] += delta;
  edge.last_seen_at = now;
}

export function indexSegment(seg) {
  for (const token of seg.tokens || []) {
    const key = token.toLowerCase();
    if (!reverseIndex.has(key)) {
      reverseIndex.set(key, new Set());
    }
    reverseIndex.get(key).add(seg.id);
  }
}

export function getTopKNodes(k = 60) {
  return Array.from(conceptsMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, k);
}

export function getSubgraph(maxNodes = 60) {
  const nodes = getTopKNodes(maxNodes);
  const nodeSet = new Set(nodes.map(n => n.id));
  
  const edges = Array.from(edgesMap.values())
    .filter(e => nodeSet.has(e.source) && nodeSet.has(e.target));
  
  return { nodes, edges };
}

export function getAllConcepts() {
  return Array.from(conceptsMap.values());
}

export function getAllEdges() {
  return Array.from(edgesMap.values());
}

export function getAllSegments() {
  return segmentsArr.slice();
}

export function addSegment(segment) {
  segment.id = `seg-${segmentCounter++}`;
  segmentsArr.push(segment);
  indexSegment(segment);
  return segment.id;
}

function normalizeKey(text) {
  return text.toLowerCase().trim();
}

function edgeId(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
