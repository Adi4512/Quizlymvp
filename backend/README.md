# Backend - Quizethic AI

Simple Node.js backend API for Quizethic AI.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file:

   ```bash
   cp .env.example .env
   ```

3. Add your OpenRouter API key to `.env`:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### GET `/`

Health check endpoint

```bash
curl http://localhost:3000/
```

### POST `/api/generate`

Call Gemini API via OpenRouter

**Request:**

```json
{
  "prompt": "Hello, how are you?"
}
```

**Response:**

```json
{
  "success": true,
  "response": "I'm doing well, thank you for asking!",
  "fullData": { ... }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `PORT` - Server port (default: 3000)
- `APP_URL` - Your app URL for OpenRouter headers
- `FRONTEND_URL` - Frontend URL for CORS and billing redirects (default: http://localhost:5173, production: https://quizethicai.com)

## Getting OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to Keys section
3. Create a new API key
4. Add credits to your account

## Model Used

Currently using `google/gemini-pro` via OpenRouter. You can change this in `server.js`.
