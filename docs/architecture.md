# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the UI as a thin React client that renders route-based pages for activities, teams, leaderboard, and workout suggestions. It should fetch from relative `/api` endpoints, render accessible loading/empty/error states, and avoid business logic beyond component state and presentation.
- Logic tier decision: Keep the Express app as the contract boundary: route handlers translate HTTP requests to service functions, enforce status codes and validation errors, and centralize logic for team validation, leaderboard aggregation, and workout recommendation ranking.
- Data tier decision: Use MongoDB-backed Mongoose models with required fields and references for `User`, `Team`, `Activity`, and `Workout`; seed data should be idempotent and preserve unrelated records so demo fixtures can be re-run safely.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; validate that IDs are valid ObjectIds and that users/teams exist before creating an activity. Store the original refs, compute `points` from minutes, and set `occurredAt` automatically so the API contract remains consistent.
- Team management approach: Require `name` and `mascot` on creation, initialize `members` to an empty array by default, and preserve member IDs as references to `User` documents without allowing invalid payload shapes.
- Leaderboard approach: Aggregate `Activity` totals by team, sum `points`, sort descending, and assign 1-based ranks sequentially. The API should return `{ teamName, totalPoints, rank }` objects with no client-side sorting assumptions.
- Workout suggestions approach: Match the `:userEmail` route param to a seeded user, inspect that user's goal and recent activity patterns, then rank workouts by focus relevance. The first suggestion should align with the user's goal or recent activity; unknown users should respond with a deliberate 4xx.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Fails when Mongoose schemas do not enforce required fields or relationships, or when the seed script does not remain idempotent.
  - This is the fastest signal that the data contract is broken before any API or UI work begins.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Fails when route handlers still return `501`/empty arrays, when validation is missing, or when leaderboard/suggestion logic does not match the contract.
  - It confirms the service layer is actually implementing the HTTP-level behavior expected by the app.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Fails when the React pages do not fetch the correct endpoints, do not render content from the API, or do not provide loading/empty/error states.
  - It validates that the presentation layer matches the contract for accessible UI feedback and data rendering.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Fails on TypeScript or Express incompatibilities after model/service changes.
  - This catches compile-time issues before the app runtime is exercised.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Fails on TypeScript or Vite issues in the React app after route or component changes.
  - This verifies the presentation layer still builds cleanly after the fetch-driven implementation is added.
