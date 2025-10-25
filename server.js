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

    const systemPrompt = `You are an expert at extracting the most important theme or concept from a sentence.
    Your task:
    1. Extract ONE main theme, concept, or idea from the sentence (maximum 6 words)
    2. Return it as a single clear phrase or sentence fragment
    
    Examples:
    Input: "I love programming in Python and making web applications"
    Output: "Web development with Python"
    
    Input: "The meeting discussed the new marketing strategy for Q4"
    Output: "Q4 marketing strategy"
    
    Return ONLY the theme/phrase, nothing else.`;

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

    const theme = response.data.choices[0]?.message?.content.trim();
    
    res.json({ 
      success: true,
      theme 
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

    const systemPrompt = `You are analyzing connections between concepts in a mind map.
    Given a NEW node (theme) and a list of EXISTING nodes, determine which existing nodes are related to the new node.
    
    Return a JSON array of objects with:
    - "node": the existing node name
    - "strength": a number 0.1 to 1.0 indicating connection strength
    - "reason": brief explanation (one word or short phrase)
    
    Only include connections with strength >= 0.3.`;

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
    let jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/```\s*(\[[\s\S]*?\])\s*```/);
    }
    if (!jsonMatch) {
      jsonMatch = content.match(/(\[[\s\S]*\])/);
    }
    
    let connections = [];
    if (jsonMatch && jsonMatch[1]) {
      try {
        connections = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('JSON parse error:', e.message, 'Content:', content);
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
            content: `You are an expert at analyzing spoken content and extracting key concepts, themes, and relationships. 
            Extract the most important concepts, ideas, and themes from the following transcript. 
            Return a JSON object with:
            1. "concepts": array of key concepts (single words or short phrases)
            2. "relationships": array of objects with "source", "target", and "strength" fields
            3. "summary": a brief 2-3 sentence summary of the main points
            4. "themes": array of main themes or topics discussed
            
            Focus on extracting the most important and meaningful information. Only return valid JSON.`
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

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    res.json({ 
      success: true,
      analysis 
    });

  } catch (error) {
    console.error('Analysis error:', error.message);
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
