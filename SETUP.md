# Backend Setup Guide

## Step 1: Create .env File

Create a file named `.env` in the project root with:

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Step 4: Access the App

Open your browser and go to:

```
http://localhost:3000
```

## Security Note

The `.env` file should NEVER be committed to git. It contains your API key!
