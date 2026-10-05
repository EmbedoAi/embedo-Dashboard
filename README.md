# Embedo Admin Dashboard

Internal admin dashboard for [embedo.ai](https://embedo.ai) — analytics, user account approval and detail, diagram/project inspection, credit usage, and AI provider (OpenAI/Anthropic) key usage & billing.

## Pages

- **Overview** — key metrics and charts across users, diagrams, and credits.
- **Users** — searchable/filterable list; click into a user for their credit usage history, member details, and the diagrams they've built.
- **Diagrams** — the embedded-hardware projects users create (architect/prototype mode, controller, component count, estimated BOM cost); click into one for its key components and full detail.
- **Settings** — AI usage & billing: spend over time, and per-key usage/limits for the OpenAI/Anthropic keys backing the product's AI copilot, with revoke/reactivate.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (new-york style) — matches embedo.ai's teal brand tokens
- react-router-dom, @tanstack/react-query, recharts, lucide-react

## Getting started

```bash
npm install
npm run dev
```

## Demo login

There is no public sign-up — admin accounts are seeded. Use:

- Email: `admin@embedo.ai`
- Password: `Admin123!`

## Data layer

There is no real backend yet. All data (users, diagrams, analytics, sessions) is generated once and persisted to `localStorage` under the `embedo-admin:mock:*` keys — see `src/services/`.

Pages only ever call `src/services/adminApi.ts`. To swap in a real backend later:

1. Add `src/services/httpAdapter.ts` implementing the same functions as `mockAdapter.ts`, calling real REST endpoints.
2. In `adminApi.ts`, change `const adapter = mockAdapter` to `const adapter = httpAdapter`.

No page or component code needs to change.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with oxlint
- `npm run preview` — preview the production build
