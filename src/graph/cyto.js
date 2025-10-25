// Cytoscape graph visualization wrapper
import { getSubgraph } from '../state/registries.js';

let cy = null;
let layoutTimer = null;
let pinnedNodes = new Set();

export function initCy(containerEl) {
  cy = cytoscape({
    container: containerEl,
    elements: [],
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'font-size': 'mapData(weight, 0, 40, 12, 28)',
          'color': '#1f2937',
          'background-color': 'mapData(weight, 0, 40, #c7d2fe, #fbbf24)',
          'width': 'mapData(weight, 0, 40, 30, 100)',
          'height': 'mapData(weight, 0, 40, 30, 100)',
          'text-outline-width': 1,
          'text-outline-color': '#ffffff',
          'background-opacity': 0.95,
          'border-color': '#a5b4fc',
          'border-width': 'mapData(weight, 0, 40, 2, 6)',
          'shape': 'round-rectangle'
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'line-color': 'rgba(148, 163, 184, 0.55)',
          'target-arrow-color': 'rgba(148, 163, 184, 0.55)',
          'width': 'mapData(weight, 0, 30, 1.5, 8)',
          'opacity': 0.7,
          'target-arrow-shape': 'triangle'
        }
      }
    ],
    layout: {
      name: 'cose',
      animate: true,
      animationDuration: 500,
      padding: 40
    }
  });

  return cy;
}

export function renderSubgraph({ nodes, edges }, options = {}) {
  if (!cy) return;

  const { hardLayout = false, animateLayout = true } = options;
  
  cy.startBatch();

  // Get existing node IDs
  const existingIds = new Set(cy.nodes().map(n => n.id()));
  
  // Add new nodes
  const newNodes = nodes.filter(n => !existingIds.has(n.id));
  if (newNodes.length > 0) {
    cy.add(newNodes.map(n => ({ data: n })));
  }

  // Get existing edge IDs
  const existingEdges = new Set(cy.edges().map(e => e.id()));
  
  // Add new edges
  const newEdges = edges.filter(e => !existingEdges.has(e.id));
  if (newEdges.length > 0) {
    cy.add(newEdges.map(e => ({ data: e })));
  }

  // Remove orphaned nodes (no edges connecting to top nodes)
  const currentEdgeIds = new Set(edges.map(e => e.source).concat(edges.map(e => e.target)));
  const orphanedNodes = cy.nodes().filter(n => {
    return !currentEdgeIds.has(n.id()) && nodes.length > 10; // Keep some orphans if graph is small
  });
  cy.remove(orphanedNodes);

  cy.endBatch();

  // Schedule layout
  if (layoutTimer) clearTimeout(layoutTimer);
  
  layoutTimer = setTimeout(() => {
    updateLayout(hardLayout, animateLayout);
  }, 100);
}

export function updateLayout(hard = false, animate = true) {
  if (!cy) return;

  const layoutOptions = {
    name: 'cose',
    animate,
    animationDuration: animate ? 500 : 0,
    randomize: hard,
    padding: 40
  };

  cy.layout(layoutOptions).run();
}

export function pinNode(id) {
  pinnedNodes.add(id);
  const node = cy.getElementById(id);
  if (node.length) {
    node.lock();
  }
}

export function unpinNode(id) {
  pinnedNodes.delete(id);
  const node = cy.getElementById(id);
  if (node.length) {
    node.unlock();
  }
}

export function setStyles({ communityMap, freshnessByAge }) {
  // Apply dynamic styles based on node properties
  cy.nodes().forEach(node => {
    const data = node.data();
    
    // Color by weight
    const weightColor = data.weight > 10 ? '#fbbf24' : data.weight > 5 ? '#60a5fa' : '#c7d2fe';
    
    node.style({
      'background-color': weightColor
    });
  });
}

export function getCy() {
  return cy;
}

export function onNodeClick(handler) {
  if (!cy) return;
  cy.on('tap', 'node', handler);
}

export function reset() {
  if (cy) {
    cy.elements().remove();
  }
  pinnedNodes.clear();
}
