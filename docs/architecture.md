# Atlas AI Architecture

## System Overview
- **Next.js 15 app (`apps/web`)**: UI, upload flow, dashboard routes, and server route handlers.
- **Analytics layer (`apps/web/lib`)**: deterministic transaction normalization, spending metrics, forecast envelopes, anomaly scoring, portfolio risk summaries.
- **FastAPI service (`services/ml-api`)**: optional ML endpoints for anomaly/forecast parity and future scale-out.

## Data Flow
1. User uploads CSV on `/demo`.
2. CSV rows are parsed and validated with Zod (`ingest.ts`).
3. Cleaned records are normalized and stored in client state.
4. Dashboard and feature pages compute metrics from normalized data.
5. Ask Atlas route gets structured context and returns grounded response.

## Why this fits a hackathon MVP
- Fast local iteration.
- Explainable outputs over black-box recommendations.
- Minimal infrastructure while preserving extension path to persistent storage.
