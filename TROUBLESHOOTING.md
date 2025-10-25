# Troubleshooting Speech Recognition

## "Network" Error

This error occurs when the browser's speech recognition service cannot be reached. Here are solutions:

### Solution 1: Use HTTPS

Some browsers require HTTPS for speech recognition. Try these:

**Option A: Use ngrok for HTTPS**

```bash
# Install ngrok if needed
brew install ngrok

# In a new terminal, run:
ngrok http 3000

# Use the HTTPS URL provided (e.g., https://abc123.ngrok.io)
```

**Option B: Enable local HTTPS**

```bash
# Install mkcert (one-time setup)
brew install mkcert
mkcert -install

# Create SSL certificates
mkcert localhost

# This creates localhost.pem and localhost-key.pem files
```

Then update `server.js` to use HTTPS (see below).

### Solution 2: Try Different Browser

The Web Speech API works better in some browsers:

- ✅ Chrome/Edge - Best support
- ✅ Safari 14.5+ - Good support
- ❌ Firefox - Limited support

### Solution 3: Check Microphone Permissions

1. Go to browser Settings → Privacy/Security
2. Check microphone permissions
3. Ensure localhost is allowed

### Solution 4: Try Safari

Safari on Mac often has better speech recognition support:

```bash
open -a Safari http://localhost:3000
```

## Alternative: HTTPS Server Setup

If you want to add HTTPS to the existing server:

```javascript
// server.js updates needed:
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

https.createServer(options, app).listen(3000, () => {
  console.log("HTTPS Server running on https://localhost:3000");
});
```

## Quick Test

To test if speech recognition works at all in your browser:

1. Open browser console (F12)
2. Run: `window.SpeechRecognition || window.webkitSpeechRecognition`
3. Should return a function (not undefined)

If it returns undefined, your browser doesn't support it.
