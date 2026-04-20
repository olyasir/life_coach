# Personal Coach (MVP)

A 12-session coaching web app. Backend calls Claude with tool use; frontend renders chat + interactive exercises (wheel of life, scale, card sort).

## Run

**Backend:**
```bash
cd backend
cp .env.example .env    # fill in ANTHROPIC_API_KEY
npm install
npm run dev             # starts on :3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev             # starts on :5173, proxies /api to :3001
```

Open http://localhost:5173.

## Structure

- `backend/src/sessions.ts` — 12 session definitions (objective, approach, toolkit, completion criteria)
- `backend/src/coach.ts` — Claude integration with tools: `render_exercise`, `save_insight`, `complete_session`
- `backend/src/server.ts` — Express endpoints: `/api/message`, `/api/exercise`, `/api/journal`, `/api/profile`
- `backend/src/storage.ts` — per-user JSON journal in `backend/data/`
- `frontend/src/Chat.tsx` — chat UI with inline exercise rendering
- `frontend/src/exercises/` — WheelOfLife, Scale, CardSort components

## Notes

- Storage is flat JSON per user. Swap for a real DB before going multi-user.
- Voice (Whisper/Parakeet STT + TTS) can plug into the existing text `/api/message` endpoint.
- Model: `claude-opus-4-7` with adaptive thinking and prompt caching on the system prompt.
