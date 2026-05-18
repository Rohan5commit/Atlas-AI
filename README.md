# Atlas AI
AI financial copilot for students and first-time investors.

## Features
- CSV import + demo mode
- Spending intelligence, forecast, anomalies
- Portfolio risk summary
- Scenario planner, Ask Atlas, action plan

## Monorepo
- `apps/web`: Next.js 15 app
- `services/ml-api`: FastAPI analytics service
- `data/`: sample CSV/JSON seed data
- `docs/`: hackathon deliverables

## Setup
```bash
npm install
npm run dev:web
```
In another terminal:
```bash
pip install -r services/ml-api/requirements.txt
npm run dev:ml
```

## Env
- `NEXT_PUBLIC_ML_API_URL=http://localhost:8001`

## Deploy
- Frontend: Vercel (`apps/web`)
- ML API: Render/Railway (`services/ml-api`)

## Demo mode
Open `/demo` and click **Use demo dataset**.
