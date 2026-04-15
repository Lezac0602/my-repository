# Campus Academic Assistant

A polished frontend-only demo for a university-focused academic assistant UI built with React, TypeScript, Tailwind CSS, and mock data.

Important:
This project is a frontend demo only. It does not include a backend, database, or real backend retrieval service. All answers and assistant states are simulated with local mock data. The product experience demonstrated in the UI is for the "PolyU Campus Academic Assistant," while the repository itself uses the more generic "Campus" naming.

## What This Demo Includes

- A polished academic assistant dashboard
- Left sidebar with navigation, suggested questions, recent conversations, saved queries, and mock student profile
- Main chat interface with structured assistant answers
- Mock conversations and realistic academic-policy content
- Interactive demo behaviors such as:
  - suggested question click-to-run
  - concise/detailed answer toggle
  - show/hide citations toggle
  - regenerate answer
  - copy answer
  - source excerpt modal
  - no-results state

## Requirements

You need Node.js installed to run this project locally.

Recommended:
- Node.js 18 or newer
- npm 9 or newer

To check whether Node.js is installed, run:

```powershell
node -v
npm -v
```

If those commands fail, install Node.js first from the official website:

https://nodejs.org/

## How To Open It

1. Open a terminal in the project folder:

```powershell
cd "c:\Users\Zach\Desktop\Code\PolyU Campus"
```

2. Install dependencies:

```powershell
npm install
```

3. Start the development server:

```powershell
npm run dev
```

4. Open the local URL shown in the terminal.

Usually Vite will print something like:

```text
Local:   http://localhost:5173/
```

Open that address in your browser.

## How To Build A Production Version

```powershell
npm run build
```

This creates a production build in the `dist/` folder.

If you want to preview the built app locally:

```powershell
npm run preview
```

Then open the preview URL shown in the terminal.

## How To Publish The Latest Version To GitHub Pages

This repository is already configured so that every push to `main` automatically rebuilds and redeploys the website to GitHub Pages.

Public site:

```text
https://lezac0602.github.io/my-repository/
```

If you want to build, commit, push, and trigger the live site update in one command, run:

```powershell
npm run publish:github
```

You can also provide a custom commit message:

```powershell
npm run publish:github --message="Update campus assistant layout"
```

What this script does:

- runs `npm run build`
- stages your local changes
- creates a git commit if there are file changes
- pushes to `origin/main`
- lets GitHub Actions redeploy the Pages site automatically

After the push, GitHub usually updates the site within about 1 to 2 minutes.

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- src
|   |-- App.tsx
|   |-- index.css
|   |-- main.tsx
|   |-- types.ts
|   |-- components
|   |   |-- app
|   |   |-- ui
|   |-- data
|   |   |-- mockRag.ts
|   |-- lib
|       |-- utils.ts
```

## Main Files

- `src/App.tsx`
  - top-level app state and overall layout
- `src/data/mockRag.ts`
  - mock documents, chunks, scenarios, and preset conversations
- `src/components/app/`
  - dashboard panels
- `src/components/ui/`
  - reusable UI primitives
- `src/index.css`
  - theme tokens and global styling

## Demo Usage

After opening the app, you can try:

- clicking a suggested question in the left sidebar
- using the quick action cards on the welcome screen
- asking questions such as:
  - `What are the graduation requirements for my programme?`
  - `When is the add/drop deadline?`
  - `What is the assessment breakdown for this subject?`
  - `Summarize the academic integrity policy.`
- switching between `Concise Answer` and `Detailed Answer`
- toggling citations on and off
- opening retrieved evidence cards to inspect the source text

## Notes

- The content is realistic mock content inspired by academic-support scenarios, but it is not official PolyU policy.
- If you want, this frontend can be connected later to a real backend or RAG API.
