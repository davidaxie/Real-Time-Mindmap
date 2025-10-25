// AI batch processing for concept extraction
import { upsertConcept, touchConcept, addAlias, upsertEdge } from '../state/registries.js';
import { nowMs } from '../utils/time.js';

let aiAnalysisPending = false;
let lastAnalysisTime = 0;
const GUARD_WINDOW_MS = 3000; // Wait 3s between analyses
const MIN_TEXT_LENGTH = 50;

export function shouldAnalyze(recentText) {
  const now = nowMs();
  const timeSinceLastAnalysis = now - lastAnalysisTime;
  
  if (aiAnalysisPending) return false;
  if (recentText.length < MIN_TEXT_LENGTH) return false;
  if (timeSinceLastAnalysis < GUARD_WINDOW_MS) return false;
  
  return true;
}

export function buildBatchPayload(transcripts, model = 'llama-3.1-8b-instant') {
  return {
    transcripts,
    model
  };
}

export async function postAnalyze(request) {
  aiAnalysisPending = true;
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    lastAnalysisTime = nowMs();
    return data;
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw error;
  } finally {
    aiAnalysisPending = false;
  }
}

export function applyAnalysis(response) {
  const { analysis } = response;
  const now = nowMs();
  
  if (!analysis) return;
  
  // Boost AI-extracted concepts (higher weight than regular tokens)
  if (analysis.concepts) {
    analysis.concepts.forEach(concept => {
      const normalized = concept.toLowerCase().trim();
      upsertConcept(normalized, { type: 'topic' });
      touchConcept(normalized, 5.0, now); // AI concepts worth 5x
    });
  }
  
  // Add AI relationships with strength-based weights
  if (analysis.relationships) {
    analysis.relationships.forEach(rel => {
      const source = rel.source?.toLowerCase().trim();
      const target = rel.target?.toLowerCase().trim();
      const strength = Math.min(rel.strength || 1, 10);
      
      if (source && target) {
        upsertEdge(source, target, strength, 'ai', now);
      }
    });
  }
  
  // Register aliases
  if (analysis.aliases) {
    analysis.aliases.forEach(({ canonical, alias }) => {
      addAlias(canonical, alias);
    });
  }
}

export function getAIBoostMultiplier() {
  return 5.0; // AI concepts are worth 5x regular concepts
}

export function isAnalysisPending() {
  return aiAnalysisPending;
}
