// Scoring and weight management
import { 
  touchConcept, 
  upsertEdge, 
  getAllConcepts, 
  getAllEdges,
  getTopKNodes,
  getSubgraph
} from '../state/registries.js';
import { nowMs } from '../utils/time.js';

const DECAY_FACTOR = 0.995;
const NODE_THRESHOLD = 0.05;
const EDGE_THRESHOLD = 0.05;
const MAX_NODES = 80;

export function applyNodeSignal(id, weight, kind = 'final', now) {
  const adjustedWeight = kind === 'final' ? weight : weight * 0.4;
  touchConcept(id, adjustedWeight, now);
}

export function applyEdgeSignals(pairs, kind = 'cooccur', baseWeight, now) {
  pairs.forEach(([a, b]) => {
    upsertEdge(a, b, baseWeight, kind, now);
  });
}

export function decayAll(factor = DECAY_FACTOR) {
  const now = nowMs();
  
  // Decay nodes
  for (const node of getAllConcepts()) {
    node.weight *= factor;
    node.last_seen_at = now;
  }
  
  // Decay edges
  for (const edge of getAllEdges()) {
    edge.weight *= factor;
    edge.last_seen_at = now;
  }
}

export function prune(opts = {}) {
  const {
    nodeThresh = NODE_THRESHOLD,
    edgeThresh = EDGE_THRESHOLD,
    maxNodes = MAX_NODES
  } = opts;
  
  const topNodes = getTopKNodes(maxNodes);
  const nodeSet = new Set(topNodes.map(n => n.id));
  
  // Prune nodes below threshold
  for (const [id, node] of getAllConcepts()) {
    if (node.weight < nodeThresh && !nodeSet.has(id)) {
      // Remove from concepts (will need access to the map)
      // For now, we'll mark as pruned
      node.pruned = true;
    }
  }
  
  // Return pruned subgraph
  return getSubgraph(maxNodes);
}

export function mergeDuplicates(rules) {
  const mergeMap = new Map();
  
  // Build merge mapping
  rules.forEach(([canonical, alias]) => {
    const canonId = canonical.toLowerCase();
    const aliasId = alias.toLowerCase();
    mergeMap.set(aliasId, canonId);
  });
  
  // TODO: Rewire edges to use canonical IDs
  // TODO: Merge node weights
  // TODO: Union alias sets
  
  return mergeMap;
}
