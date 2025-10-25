// Main application entry point
import { initState } from './state/registries.js';
import { tokenize, extractPhrases } from './pipeline/nlp.js';
import { throttle } from './utils/time.js';

// Export functions for use in the main app
export {
  initState,
  tokenize,
  extractPhrases,
  throttle
};

// This will be extended as we build out the modules
