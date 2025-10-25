# AI-Driven Mind Map Improvements

## 🎯 What Changed

### Before (Hard-coded tokenization)

- Used fixed word/phrase extraction
- Nodes based on individual words
- Simple sequential connections
- No AI understanding

### Now (AI-Powered)

- **Groq extracts themes** from each sentence
- AI finds **relationships** between nodes
- Node size = **strength of connections**
- Real-time AI understanding

## 🚀 How It Works

### For Each Sentence:

1. **Extract Theme** (`/api/extract-theme`)

   - AI extracts one main concept (max 6 words)
   - Example: "I love machine learning" → "Machine learning"

2. **Find Connections** (`/api/find-connections`)

   - AI analyzes relationships with existing nodes
   - Returns connections with strength (0.1-1.0)

3. **Create Node**

   - Weight = Base (5) + Connection Bonus (2 per connection)
   - More connections = Bigger node

4. **Add Edges**
   - Connect to related nodes with weighted strength

## 📡 New API Endpoints

### `/api/extract-theme`

```json
{
  "sentence": "I'm working on a machine learning project",
  "model": "llama-3.1-8b-instant"
}
```

Returns:

```json
{
  "success": true,
  "theme": "Machine learning project"
}
```

### `/api/find-connections`

```json
{
  "newNode": "Machine learning project",
  "existingNodes": ["Python programming", "Data analysis"],
  "model": "llama-3.1-8b-instant"
}
```

Returns:

```json
{
  "success": true,
  "connections": [
    {
      "node": "Python programming",
      "strength": 0.8,
      "reason": "tool"
    },
    {
      "node": "Data analysis",
      "strength": 0.6,
      "reason": "related"
    }
  ]
}
```

## 🎨 Visual Features

- **Node Size**: Based on connection count (more connections = bigger)
- **Edge Weight**: Based on AI-detected relationship strength
- **Real-time**: Mind map updates as you speak
- **AI Status**: Shows what AI is doing ("Extracting theme...", "Finding connections...")

## 🔧 Configuration

Server runs on port **3001**

Open: http://localhost:3001

## 🧪 Test It

1. Start server: `npm start`
2. Open http://localhost:3001
3. Click "Start"
4. Speak continuously
5. Watch AI extract themes and build connections in real-time!

## 📊 Example Flow

```
You: "I'm studying machine learning for data analysis projects"

AI extracts: "Machine learning for data"

Existing nodes: ["Python coding", "Statistics"]

AI finds connections:
- "Python coding" (strength: 0.9) - used in ML
- "Statistics" (strength: 0.7) - fundamental to ML

Result: Node size 9 (base 5 + 4 bonus), 2 edges with weighted strength
```

## 🎯 Benefits

✅ Smart theme extraction (not just word counting)
✅ AI understands relationships between concepts
✅ Node size reflects importance (connection density)
✅ Real-time mind map growth as you speak
✅ More meaningful connections than simple word adjacency
