# Implementation Plan: Improved Functional Mindmap

## Summary

**Goal**: Transform simple word-frequency graph into meaningful concept extraction with AI-enhanced relationships.

**Status**: Feasible ✅ | **API Keys Needed**: None (Groq only) ✅

## Core Improvements Needed

### 1. Better Concept Extraction (Not just single words)

**Current**:

- Single words as nodes
- Simple co-occurrence edges

**Target**:

- Multi-word phrases (e.g., "machine learning", "vector database")
- Named entities (people, places, products)
- Topics and themes

**Solution**: Use the **already-created NLP modules** above with phrase extraction + AI concept clustering.

### 2. Scoring & Decay System

**Current**: Basic weight accumulation

**Target**:

- Time-based decay (older concepts fade)
- Multiplicative boosts from AI
- Threshold-based pruning

**Files to create**: `src/pipeline/scoring.js` (already outlined)

### 3. AI Integration Improvements

**Current**: AI provides concepts/relationships but doesn't change structure

**Target**:

- AI concepts get higher weights (+5 vs +1)
- AI relationships create high-quality edges
- Alias detection (e.g., "ML" = "machine learning")

**Modify**: `analyzeWithGroq()` function in `index.html`

### 4. Graph Stability

**Current**: Layout re-runs constantly (jittery)

**Target**:

- Incremental updates (add/remove nodes only)
- Soft layout (animate positions) vs hard layout (recompute)
- Pin high-weight nodes

**Files to create**: `src/graph/cyto.js`

## Quick Implementation Strategy

Since we're using inline `<script>` in `index.html` (not ES modules), we have two paths:

### Path A: Inline Refactoring (Faster, 1 file)

Modify existing `index.html` to:

1. Extract phrases (2-3 word combinations)
2. Add scoring/decay functions
3. Improve AI integration
4. Stabilize layout updates

**Time estimate**: 2-3 hours
**Files to modify**: `index.html` only

### Path B: Modular Build System (Better long-term)

- Create separate `.js` files
- Use a bundler (Vite/Rollup) or import maps
- Proper ES modules

**Time estimate**: 4-6 hours
**Files to create**: Many new files + build config

## Recommended: Path A with Strategic Improvements

Focus on the **highest impact changes** first:

### Phase 1: Better Concepts (2-3 hours)

Add to `index.html`:

```javascript
// Extract meaningful phrases, not just words
function extractPhrases(text) {
  const tokens = tokenize(text);
  const phrases = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return phrases;
}
```

### Phase 2: Scoring Improvements (1 hour)

Add decay and boost functions:

```javascript
function decayGraph() {
  for (const node of graph.nodes.values()) {
    node.weight *= 0.995;
    if (node.weight < 0.1) graph.nodes.delete(node.id);
  }
}

function applyAIBoost(concepts) {
  concepts.forEach((id) => {
    touchConcept(id, 5.0); // AI concepts worth 5x
  });
}
```

### Phase 3: Layout Stability (1 hour)

Modify cytoscape update to be incremental:

```javascript
function updateMindmap() {
  const { nodes, edges } = getSubgraph(60);

  cy.startBatch();
  // Only add NEW nodes (don't remove all)
  const existingIds = cy.nodes().map((n) => n.id());
  const newNodes = nodes.filter((n) => !existingIds.includes(n.id));

  cy.add(newNodes.map((n) => ({ data: n })));
  // ... similar for edges
  cy.layout({ name: "cose", animate: true }).run();
  cy.endBatch();
}
```

## Testing Plan

1. Speak about 3 distinct topics (e.g., "machine learning", "vector databases", "python programming")
2. Verify multi-word phrases appear as single nodes
3. Check decay removes stale concepts over time
4. Confirm AI analysis adds meaningful connections

## Timeline

- **Today**: Implement Phase 1 + 2 (better concepts + scoring)
- **Tomorrow**: Add Phase 3 (layout stability) + testing

## What You Already Have ✅

- Backend with Groq integration
- Basic graph rendering (Cytoscape)
- Real-time ASR transcription
- AI analysis endpoint

## What Needs Adding 🔨

1. Phrase extraction (multi-word concepts)
2. Decay/scoring system
3. Layout stability
4. Alias handling

## Next Steps

**Option 1**: I can implement Path A (inline improvements to `index.html`) - **Recommended**
**Option 2**: Build full modular system with build pipeline
**Option 3**: You implement using the plan above

Which would you prefer?
