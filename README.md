# AI-Powered Real-Time Mind Map

A beautiful, real-time mind mapping tool that captures speech, analyzes it with AI, and visualizes key concepts and relationships dynamically.

## Features

- 🎤 **Real-time Speech Recognition** - Captures and transcribes speech as you speak
- 🤖 **AI-Powered Analysis** - Uses Groq AI to extract key concepts, themes, and relationships
- 🗺️ **Dynamic Mind Map** - Visualizes concepts and connections in real-time
- 📝 **Manual Notes** - Add custom notes manually (⌘/Ctrl + Enter)
- 💾 **Export** - Save your mind maps as JSON
- 🌐 **Multi-language Support** - Works with multiple languages

## Getting Started

### Prerequisites

1. A modern web browser (Chrome, Edge, or Safari recommended)
2. A Groq API key ([Get one here](https://console.groq.com/))

### Setup

1. Open `index.html` in your web browser
2. Enter your Groq API key in the Configuration section
3. Select your preferred Groq model
4. Choose your source language
5. Click "Start Listening"

### How It Works

1. **Start Capturing**: Click "Start Listening" and grant microphone permissions
2. **Speak Naturally**: The app transcribes your speech in real-time
3. **AI Analysis**: Every few seconds, Groq analyzes your speech to extract:
   - Key concepts and ideas
   - Themes and topics
   - Relationships between concepts
   - Brief summaries
4. **Visualization**: The mind map updates dynamically with nodes and connections
5. **Explore**: Click any node to see related quotes and notes

### Adding Manual Notes

Type your note in the textarea and press `⌘ + Enter` (Mac) or `Ctrl + Enter` (Windows/Linux).

### Exporting

Click "Export JSON" to download your mind map data as a JSON file.

## API Key Security

Your API key is stored locally in your browser's localStorage. It never leaves your device.

## Models

The app supports various Groq models:

- **Llama 3.1 8B Instant** - Fastest, good for quick analysis
- **Llama 3.1 70B Versatile** - More powerful, better for complex content
- **Mixtral 8x7B** - Great balance of speed and quality
- **Gemma 2 9B** - Another fast option

## Tips

- Pause when there's a break in speech to help the AI analyze chunks
- The longer you speak, the richer the mind map becomes
- Click nodes to see what was said about specific concepts
- AI analysis happens every ~3 final transcripts

## Browser Compatibility

Works best with:

- Google Chrome
- Microsoft Edge
- Safari (iOS 14.5+)

## License

This project is open source and available for personal and commercial use.

## Credits

Built with:

- Groq AI for concept extraction
- Cytoscape.js for visualization
- Web Speech API for transcription
