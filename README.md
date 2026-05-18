# Atlas AI
AI financial copilot for students and first-time investors.

## Features
- Real CSV import (transactions + portfolio)
- Spending intelligence, forecast, anomalies
- Portfolio risk summary
- Scenario planner, Ask Atlas, action plan
- NVIDIA-hosted LLM chat endpoint grounded to app context

## Monorepo
- `apps/web`: Next.js 15 app
- `services/ml-api`: FastAPI analytics service
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
- `NVCF_API_KEY=<your_nvidia_api_key>`
- `NEXT_PUBLIC_ML_API_URL=http://localhost:8001`

## Deploy
```bash
npm i -g vercel
vercel login
vercel --prod
```
Deploy `services/ml-api` separately on Render/Railway.

## Runtime
Open `/demo`, upload real CSV data, then continue through dashboard and planning flows.
