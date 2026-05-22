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

## Resources
- [Pitch Deck (PDF)](./docs/pitch-deck.pdf)
- [Architecture Diagram](./docs/architecture.md)
- [Demo Script](./docs/demo-script.md)
- [Devpost Copy](./docs/devpost-copy.md)
- [Judging Hook](./docs/judging-hook.md)

## Local setup
```bash
npm install
npm run dev:web
```

## Environment variables
Create `.env.local` in repo root or `apps/web`:
```bash
NVCF_API_KEY=<your_nvidia_api_key>
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
