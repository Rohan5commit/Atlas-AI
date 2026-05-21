# Atlas AI
AI financial copilot for students and first-time investors.

## What it does
Atlas AI ingests real CSV transaction and beginner portfolio data, computes explainable financial metrics, forecasts 30/90-day cashflow, flags unusual spending, explains portfolio concentration risk, supports goal scenarios, and provides grounded action recommendations.

## Feature checklist
- ✅ Real CSV import (transactions required, portfolio optional)
- ✅ Row-level validation with error feedback (Zod)
- ✅ Spending intelligence (category breakdown, savings rate, recurring charges)
- ✅ Forecasts (30-day and 90-day base/best/worst)
- ✅ Anomaly alerts with severity/confidence
- ✅ Portfolio risk summary (value, concentration, volatility, shock)
- ✅ Scenario planner for goal feasibility
- ✅ Ask Atlas grounded assistant using NVIDIA API context injection
- ✅ Action plan summary

## Monorepo
- `apps/web` — Next.js 15 frontend + route handlers
- `services/ml-api` — FastAPI analytics service
- `docs/` — architecture, demo script, devpost copy, slides, credits, judging hook

## Local setup
```bash
npm install
npm run dev:web
```
In a second terminal (optional ML service):
```bash
python -m pip install -r services/ml-api/requirements.txt
npm run dev:ml
```

## Environment variables
Create `.env.local` in repo root or `apps/web`:
```bash
NVCF_API_KEY=<your_nvidia_api_key>
NEXT_PUBLIC_ML_API_URL=http://localhost:8001
```

## Key routes
- `/` Landing
- `/demo` Import and validation
- `/dashboard` KPI overview
- `/spending` Spend breakdown
- `/forecast` Cashflow forecast
- `/portfolio` Portfolio risk
- `/scenario` Goal planner
- `/ask-atlas` Grounded Q&A
- `/summary` Action plan
- `/architecture` Judge-facing architecture page

## Production Deployment
**Live URL:** [https://atlas-ai-sigma-six.vercel.app](https://atlas-ai-sigma-six.vercel.app)

## Run tests
```bash
npm run test
```

## Submission Readiness
The project is fully deployed and ready for judging. All core flows, including grounded AI chat and financial analytics, are verified in production.
Daily quota contribution.
