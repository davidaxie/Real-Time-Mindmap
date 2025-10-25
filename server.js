const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html)

// Groq API endpoint
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
