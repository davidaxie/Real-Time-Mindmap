const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html)

// New endpoint: Extract theme/node from a single sentence
app.post('/api/extract-theme', async (req, res) => {
  try {
    const { sentence, model, existingNodes } = req.body;
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'No Groq API key provided' });
    }

    if (!sentence || sentence.trim().length < 10) {
      return res.status(400).json({ error: 'Sentence too short' });
    }

    const systemPrompt = `You extract ONLY the core theme from a sentence. Return NOTHING else.

CRITICAL RULES:
1. MAXIMUM 3 words (e.g., "Machine Learning", "Customer Retention", "Budget Planning")
2. Return ONLY the theme phrase, nothing else
3. NO explanations, NO greetings, NO conversational text
4. Focus on THE TOPIC/DOMAIN being discussed
5. Extract the main business/project topic

EXAMPLES:
"I love machine learning" → "Machine Learning"
"Q4 marketing needs approval" → "Marketing Budget"  
"Customer churn increased" → "Customer Retention"
"Schedule follow-up meeting" → "Meeting Planning"

DO NOT include:
- Greetings like "I'd be happy"
- Explanations
- Full sentences
- Anything beyond the 3-word theme

You must return ONLY the theme phrase. If you cannot extract a theme, return the first 3 words of the sentence.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model || 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sentence }
        ],
        temperature: 0.3,
        max_tokens: 50
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const content = response.data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      return res.status(500).json({ error: 'No content from Groq' });
    }
    
    // Clean up the theme - remove any quoted strings, extra whitespace, etc.
    let theme = content.replace(/^["']|["']$/g, '').trim(); // Remove quotes
    
    // If it's still too long or looks like a prompt, extract just the first phrase
    if (theme.length > 50 || theme.includes('\n')) {
      theme = theme.split('\n')[0].trim().substring(0, 50);
    }
    
    // Ensure it's not just the system prompt
    if (theme.toLowerCase().includes('extract') || theme.toLowerCase().includes('theme')) {
      // Fallback: return a simple version of the sentence
      theme = sentence.split(/\s+/).slice(0, 3).join(' ');
    }
    
    res.json({ 
      success: true,
      theme: theme.substring(0, 100) // Limit to 100 chars
    });

  } catch (error) {
    console.error('Theme extraction error:', error.message);
    res.status(500).json({ 
      error: 'Failed to extract theme',
      message: error.message 
    });
  }
});

// Endpoint: Find connections between a new node and existing nodes
app.post('/api/find-connections', async (req, res) => {
  try {
    const { newNode, existingNodes, model } = req.body;
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey || !newNode || !existingNodes || existingNodes.length === 0) {
      return res.json({ success: true, connections: [] });
    }

    const systemPrompt = `You find thematic connections between concepts for a mind map.

CONNECTION STRATEGY:
- Connect concepts that share the SAME THEME or DOMAIN
- In business meetings: relate by business context (strategy, execution, metrics, etc.)
- Look for shared themes, not just word similarity
- Prioritize substantive relationships over superficial ones

STRENGTH GUIDELINES:
- 1.0: Direct theme match (e.g., "Marketing Strategy" ↔ "Marketing Budget")
- 0.8: Strongly related themes (e.g., "Sales Process" ↔ "Customer Retention")
- 0.6: Indirectly related (e.g., "Product Development" ↔ "Market Research")
- 0.4-0.5: Weakly related concepts

Return JSON array:
- Limit to 2-3 STRONGEST connections
- Return [] ONLY if truly no thematic connection exists

Format:
[
  {"node": "Existing Node", "strength": 0.9, "reason": "subtopic"},
  {"node": "Another Node", "strength": 0.7, "reason": "related"}
]`;

    const userPrompt = `New node: "${newNode}"
    
Existing nodes:
${existingNodes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

Return JSON array of connections.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model || 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const content = response.data.choices[0]?.message?.content;
    
    // Extract JSON array, handling markdown code blocks
    let connections = [];
    
    // Try to find JSON array in the content
    let jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/```\s*(\[[\s\S]*?\])\s*```/);
    }
    if (!jsonMatch) {
      // Try to find the last JSON array in the content
      const jsonArrays = content.match(/\[[\s\S]*?\]/g);
      if (jsonArrays && jsonArrays.length > 0) {
        jsonMatch = [null, jsonArrays[jsonArrays.length - 1]];
      }
    }
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        connections = JSON.parse(jsonMatch[1]);
        if (!Array.isArray(connections)) {
          connections = [];
        }
      } catch (e) {
        console.error('JSON parse error:', e.message);
        console.error('Content snippet:', content.substring(0, 300));
      }
    }

    res.json({ 
      success: true,
      connections 
    });

  } catch (error) {
    console.error('Connection finding error:', error.message);
    res.status(500).json({ 
      error: 'Failed to find connections',
      message: error.message 
    });
  }
});

// Original endpoint: Bulk analysis (kept for backward compatibility)
app.post('/api/analyze', async (req, res) => {
  try {
    const { transcripts, model } = req.body;
    
    // Get API key from environment variable (more secure) or from request
    const apiKey = process.env.GROQ_API_KEY || req.body.apiKey;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'No Groq API key provided' });
    }

    if (!transcripts || transcripts.length < 50) {
      return res.status(400).json({ error: 'Transcript too short' });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model || 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You analyze conversations and extract main themes for a mind map.

FOCUS: Extract MAIN THEMES, not just frequent words.

RANKING STRATEGY:
- Prioritize themes that are CENTRAL to the conversation
- In business contexts: focus on business objectives, strategies, and key decisions
- Ignore filler words ("uh", "um", common verbs) even if frequent
- Extract high-level concepts (e.g., "Customer Acquisition" not "customer, customers, customer's")

MAX 3 WORDS PER CONCEPT.

Return JSON:
{
  "concepts": ["Main Theme 1", "Main Theme 2"],  // MAX 3 words each
  "relationships": [{"source": "Theme1", "target": "Theme2", "strength": 0.8}],
  "summary": "Conversation summary",
  "themes": ["Primary Theme", "Secondary Theme"]
}

Example:
Transcript: "We need to improve our sales. The marketing budget is tight. Let's focus on customer retention."
Output: {
  "concepts": ["Sales Strategy", "Marketing Budget", "Customer Retention"],
  "relationships": [...],
  "summary": "...",
  "themes": ["Business Strategy", "Customer Focus"]
}

ALWAYS return valid JSON.`
          },
          {
            role: 'user',
            content: transcripts
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const content = response.data.choices[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: 'No content from Groq' });
    }

    // Parse JSON response - handle markdown code blocks
    let analysis = null;
    try {
      // Try to extract JSON from markdown code blocks first
      let jsonStr = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonStr) {
        jsonStr = content.match(/```\s*([\s\S]*?)\s*```/);
      }
      if (!jsonStr) {
        // Try to find JSON object in content
        jsonStr = content.match(/\{[\s\S]*\}/);
      }
      
      if (jsonStr) {
        const cleaned = jsonStr[1] || jsonStr[0];
        analysis = JSON.parse(cleaned.trim());
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Content:', content.substring(0, 200));
      // Return a fallback analysis
      analysis = {
        concepts: [],
        relationships: [],
        summary: 'Unable to parse AI response',
        themes: []
      };
    }

    res.json({ 
      success: true,
      analysis 
    });

  } catch (error) {
    console.error('Analysis error:', error.message);
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limited',
        message: 'Too many requests to Groq API. Please wait a moment.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze content',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Open http://localhost:${PORT} in your browser`);
  console.log(`🔑 Make sure to set GROQ_API_KEY in .env file`);
});
