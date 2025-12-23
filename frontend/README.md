# Frontend - Quizethic AI

React frontend application for Quizethic AI.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the frontend directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities and services
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── package.json       # Dependencies
└── vite.config.ts     # Vite configuration
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth & Database)
