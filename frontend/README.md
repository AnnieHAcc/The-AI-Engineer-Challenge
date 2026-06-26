# Star Coach Frontend ✦

A glossy, Y2K-pop-inspired chat UI for the FastAPI mental coach backend.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes `npm`)
- The FastAPI backend running on `http://localhost:8000` with `OPENAI_API_KEY` set

## Setup

From the **repository root** or the `frontend/` folder:

```bash
cd frontend
npm install
```

Copy the example env file (already defaults to localhost):

```bash
# Windows PowerShell
Copy-Item .env.local.example .env.local

# macOS / Linux
cp .env.local.example .env.local
```

## Run the Backend (separate terminal)

From the repository root:

```bash
# Set your API key first
$env:OPENAI_API_KEY="sk-your-key-here"   # PowerShell
# export OPENAI_API_KEY=sk-your-key-here  # macOS / Linux

uv run uvicorn api.index:app --reload
```

The API should be available at `http://localhost:8000`.

## Run the Frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

## Features

- **Chat** — send messages and see full conversation history
- **System prompt** — optionally override the default mental-coach persona
- **Typewriter display** — assistant replies animate in (the backend returns JSON; streaming can be added later)
- **Backend status** — live health indicator for `GET /api/health`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend base URL |

## Production Build

```bash
npm run build
npm start
```

## API Integration

The frontend talks to:

- `POST /api/chat` — `{ message, system_prompt?, history? }` → `{ reply }`
- `GET /api/health` — backend health check

See `api/README.md` for full backend documentation.
