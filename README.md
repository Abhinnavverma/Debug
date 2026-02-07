# Breakpoint

**Measure real debugging ability, not LeetCode scores.**

Breakpoint  is an AI-powered debugging skills assessment platform that replaces toy algorithmic interviews with realistic production incident scenarios. Candidates investigate multi-service log files, diagnose root causes, and propose next steps — then an AI evaluator scores their reasoning using behavioral telemetry (navigation patterns, time allocation, revision frequency).

## The Problem

Traditional coding interviews (LeetCode, HackerRank) test algorithmic thinking but tell you nothing about whether an engineer can actually debug a production outage. Breakpoint  fills that gap.

## How It Works

### For Learners
1. Pick a debugging scenario (e.g., auth service latency, OOM crashes, cascading failures)
2. Investigate logs across multiple services — just like a real incident
3. Write your root cause analysis and proposed next steps
4. Get an AI-generated scorecard across 5 dimensions + personalized coaching feedback

### For Companies
1. Create an assessment by selecting problems from the bank
2. Share a link with candidates
3. View structured scorecards comparing candidates on debugging ability, not memorized algorithms

## AI Scoring

Each attempt is scored across 5 dimensions (0–10):
- **Investigative Engagement** — Did they check the right logs?
- **Signal Detection** — Did they find the critical error amidst noise?
- **Hypothesis Formation** — How accurate was their diagnosis?
- **Debugging Discipline** — Was their investigation systematic or random?
- **Decision Readiness** — Do their next steps logically address the root cause?

Behavioral telemetry (which tabs they visited, how long they spent, how many times they revised their answer) feeds directly into the scoring — measuring *process*, not just the final answer.

## Tech Stack

- **Next.js 15** (App Router, Server Actions)
- **Firebase** (Firestore for persistence, App Hosting for deployment)
- **Google Gemini** via Genkit (AI scoring + coaching feedback)
- **Recharts** (analytics visualizations)
- **Tailwind CSS + shadcn/ui**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:9002](http://localhost:9002).

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json  # local dev only
```

For local development, download a service account key from Firebase Console → Project Settings → Service Accounts.

## License

Private — Y Combinator Application Prototype
