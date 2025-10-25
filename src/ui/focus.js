// Focus panel UI for showing node details
import { getAllSegments } from '../state/registries.js';
import { formatClock } from '../utils/time.js';

export function bindFocus(cy, { getSegmentsForConcept }) {
  if (!cy) return;

  cy.on('tap', 'node', (evt) => {
    const nodeData = evt.target.data();
    const segments = getSegmentsForConcept(nodeData.id);
    renderFocusPanel(segments, nodeData);
  });
}

export function getSegmentsForConcept(conceptId, k = 6) {
  const allSegments = getAllSegments();
  const relatedSegments = allSegments
    .filter(seg => {
      // Check if any token in the segment matches the concept
      const tokens = seg.tokens || [];
      return tokens.some(token => 
        token.toLowerCase() === conceptId.toLowerCase() ||
        conceptId.toLowerCase().includes(token.toLowerCase()) ||
        token.toLowerCase().includes(conceptId.toLowerCase())
      );
    })
    .slice(-k)
    .reverse();

  return relatedSegments;
}

export function renderFocusPanel(segments, nodeData = null) {
  const container = document.getElementById('details');
  if (!container) return;

  container.innerHTML = '';

  if (!nodeData && segments.length === 0) {
    container.innerHTML = '<p>Select a node in the mindmap to see related quotes.</p>';
    return;
  }

  // Show node info if available
  if (nodeData) {
    const nodeInfo = document.createElement('div');
    nodeInfo.className = 'detail-item';
    nodeInfo.innerHTML = `
      <h3 style="margin: 0 0 0.5rem 0; color: #1f2937;">${nodeData.label || nodeData.id}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 0.85rem;">
        Weight: ${nodeData.weight.toFixed(2)} • Last seen: ${new Date(nodeData.last_seen_at).toLocaleTimeString()}
      </p>
    `;
    container.appendChild(nodeInfo);
  }

  if (segments.length === 0) {
    const noQuotes = document.createElement('div');
    noQuotes.className = 'detail-item';
    noQuotes.innerHTML = '<p style="color: #9ca3af; font-style: italic;">No quotes linked to this concept yet.</p>';
    container.appendChild(noQuotes);
    return;
  }

  // Render segments
  for (const seg of segments) {
    const item = document.createElement('div');
    item.className = 'detail-item';
    
    const time = document.createElement('time');
    time.textContent = new Date(seg.createdAt).toLocaleTimeString();
    time.style.cssText = 'font-size: 0.75rem; color: #6b7280; text-transform: uppercase;';
    
    const text = document.createElement('p');
    text.textContent = seg.text;
    text.style.cssText = 'margin: 0.5rem 0 0 0; line-height: 1.6; color: #1f2937;';
    
    item.appendChild(time);
    item.appendChild(text);
    container.appendChild(item);
  }
}

export function clearFocusPanel() {
  const container = document.getElementById('details');
  if (container) {
    container.innerHTML = '<p>Select a node in the mindmap to see related quotes.</p>';
  }
}
