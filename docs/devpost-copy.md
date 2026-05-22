# Devpost Copy
## Title
Atlas AI
## One-line pitch
Atlas AI helps students and first-time investors turn messy money data into clear forecasts, risk insights, and action plans.
## Problem
Beginners lack clear tools that connect spending behavior to portfolio risk and achievable goals.
## Solution
Atlas AI ingests transaction + holdings data, computes explainable analytics, and generates a prioritized action plan.
## How we built it
Built on Next.js 15 App Router with streaming, leveraging NVIDIA NIM API (meta/llama-3.1-8b-instruct) for intelligent financial reasoning. Analytics powered by a FastAPI microservice.

## Technologies Used
- NVIDIA NIM API (meta/llama-3.1-8b-instruct via integrate.api.nvidia.com)
- Vercel Edge Functions
- Next.js 15 App Router (Streaming)
- FastAPI
- Zod (Validation)
- PapaParse (CSV Parsing)
## Challenges
Noisy merchant strings, missing categories, balancing explainability with model depth.
## Accomplishments
Fast demo flow, grounded assistant responses, transparent health score and scenario comparison.
## What's next
Bank integrations, multi-user persistence, adaptive budgeting coach.
