# Modular Build System - Migration Guide

## Overview

We're migrating from a monolithic `index.html` to a modular system with:

- Separate modules for different concerns
- Vite as the build system
- ES6 imports/exports
- Better code organization and maintainability

## Current Status

✅ **Completed**:

- Vite installed and configured
- Basic folder structure created
- Core utility modules started (time.js, registries.js, nlp.js)
- Package.json updated with build scripts

⏳ **In Progress**:

- Creating the modular application structure
- Migrating functionality from index.html
- Setting up proper exports/imports

## File Structure

```
project/
├── index.html           (old - for reference)
├── src/
│   ├── index.html       (new - Vite entry)
│   ├── app.js           (main application logic)
│   ├── main.js          (module exports)
│   ├── utils/
│   │   └── time.js      ✅ Done
│   ├── state/
│   │   └── registries.js ✅ Done
│   ├── pipeline/
│   │   ├── nlp.js       ✅ Done
│   │   ├── scoring.js   ⏳ TODO
│   │   ├── ai-batch.js  ⏳ TODO
│   │   └── asr.js       ⏳ TODO
│   ├── graph/
│   │   └── cyto.js      ⏳ TODO
│   └── ui/
│       ├── focus.js     ⏳ TODO
│       └── controls.js  ⏳ TODO
├── server.js            (backend - unchanged)
├── vite.config.js       ✅ Done
└── package.json         ✅ Done
```

## Migration Strategy

### Phase 1: Core Modules (Current)

- ✅ Time utilities
- ✅ State registries
- ✅ NLP processing

### Phase 2: Supporting Modules (Next)

- ⏳ Scoring & decay
- ⏳ AI batch processing
- ⏳ ASR event handling

### Phase 3: Visualization (Then)

- ⏳ Cytoscape wrapper
- ⏳ Focus panel
- ⏳ Control UI

### Phase 4: Integration (Finally)

- ⏳ Connect all modules
- ⏳ Migrate from old index.html
- ⏳ Test & refine

## Running the System

### Development Mode

**Terminal 1** (Backend):

```bash
npm start
# Server runs on http://localhost:3000
```

**Terminal 2** (Frontend):

```bash
npm run dev:frontend
# Vite runs on http://localhost:3001
# Opens app in browser
```

### Production Build

```bash
npm run build
# Outputs to dist/ folder
# Serve with: npm run preview
```

## Benefits of This Approach

1. **Modularity**: Each file has a single responsibility
2. **Testability**: Easy to test individual functions
3. **Reusability**: Modules can be shared across projects
4. **Maintainability**: Easier to find and fix bugs
5. **Scalability**: Easy to add new features

## Next Steps

1. Create remaining pipeline modules (scoring.js, ai-batch.js)
2. Create graph visualization wrapper (cyto.js)
3. Create UI components (focus.js, controls.js)
4. Build the main app.js that wires everything together
5. Test the complete system
6. Deploy

## Notes

- The old `index.html` remains as reference during migration
- Each module should be independently testable
- Use ES6 imports/exports throughout
- Vite will handle bundling in development and production
