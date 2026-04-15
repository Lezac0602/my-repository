# Campus Academic Assistant

A React + Tailwind frontend for a live PolyU RPg Handbook QA demo.

The frontend stays on GitHub Pages, while the protected OpenAI call is handled by a separate Vercel backend in [`backend/`](c:/Users/Zach/Desktop/Code/PolyU%20Campus/backend).

## What This Version Does

- Runs a live handbook QA flow from the main chat UI
- Uses the OpenAI Responses API with `web_search`
- Restricts answers to the PolyU Graduate School RPg Handbook scope
- Shows structured answers with:
  - summary
  - key details
  - caution
  - clickable handbook citations
- Supports `New Chat`, `Concise / Detailed`, `Show / Hide citations`, `Regenerate Answer`, and `Copy Answer`

Important:
- The browser never talks directly to OpenAI
- The frontend needs a public backend URL in `VITE_HANDBOOK_API_BASE_URL`
- The backend needs `OPENAI_API_KEY`

## Project Layout

```text
.
|-- src/                 Frontend for GitHub Pages
|-- backend/             Vercel serverless API for handbook chat
|-- .github/workflows/   GitHub Pages deploy workflow
```

## Frontend Local Development

1. Install frontend dependencies:

```powershell
cd "c:\Users\Zach\Desktop\Code\PolyU Campus"
npm install
```

2. Create a frontend env file:

```powershell
Copy-Item .env.example .env.local
```

3. Set your deployed or local backend origin in `.env.local`:

```text
VITE_HANDBOOK_API_BASE_URL=https://your-vercel-project.vercel.app
```

4. Start the frontend:

```powershell
npm run dev
```

## Backend Setup For Vercel

1. Go into the backend folder:

```powershell
cd "c:\Users\Zach\Desktop\Code\PolyU Campus\backend"
```

2. Install backend dependencies:

```powershell
npm install
```

3. Create backend env values from [`backend/.env.example`](c:/Users/Zach/Desktop/Code/PolyU%20Campus/backend/.env.example):

```text
OPENAI_API_KEY=...
HANDBOOK_URL_PREFIX=https://www.polyu.edu.hk/gs/rpghandbook/
ALLOWED_ORIGINS=http://localhost:5173,https://lezac0602.github.io
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

4. Deploy `backend/` as a separate Vercel project.

The public API endpoint will be:

```text
https://your-vercel-project.vercel.app/api/handbook-chat
```

## GitHub Pages Frontend Deploy

The GitHub Pages workflow now reads this repository variable:

```text
VITE_HANDBOOK_API_BASE_URL
```

Set that variable in GitHub to your deployed Vercel origin, for example:

```text
https://your-vercel-project.vercel.app
```

Then every push to `main` rebuilds the frontend against that live backend.

Public site:

```text
https://lezac0602.github.io/my-repository/
```

## One-Command Publish For The Frontend

After frontend changes, you can still publish the GitHub Pages site with:

```powershell
npm run publish:github
```

Or with a custom commit message:

```powershell
npm run publish:github --message="Connect handbook chat to live backend"
```

This command:

- runs the frontend build
- stages changes
- commits them
- pushes to `main`
- triggers the GitHub Pages workflow

## Notes

- This implementation is scoped to the PolyU Graduate School RPg Handbook URL prefix.
- The backend also filters returned URLs so unsupported PolyU pages are not accepted as valid final sources.
- Upstash rate limiting is included for basic public-demo protection.
