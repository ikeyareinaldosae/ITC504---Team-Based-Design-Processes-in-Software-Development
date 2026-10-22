# Team Charter

**Project:** Movie Performance Management System
**Course:** ITC504 Team-Based Design Processes in Software Development
**Team:** Team XX
**Team Leader:** Reinaldo

> Items in [square brackets] are placeholders. Replace them with what the team has agreed, then remove this note.

## 1. Purpose

This charter sets out how our team works together: who owns what, how we communicate, how we use Git, and how we make decisions. It supports our shared contract (`openapi.yaml`) and our architecture report (`/docs/architecture-blueprint.md`).

## 2. Team Members and Ownership

| Member | Role | Module owned | Folder owned |
| --- | --- | --- | --- |
| Prakash | Stream-aligned (Report Experience) | Input page and report page | `/web/input-page/`, `/web/report-page/` |
| Roshni | Platform (Data and API) | Database | `/database/` |
| Chandani | Platform (Data and API) | API | `/api/` |
| Reinaldo | Team Leader, Git administrator (enabling) | UI/UX and repository administration | `/design/`, `/docs/`, `/.github/` |
| Avishek | Stream-aligned (Report Experience) | Data handling and visuals | `/web/charts/` |

Shared files in the root: `openapi.yaml` (owned by the whole team, changed only by pull request), `README.md` and `teamcharter.md`.

Each folder contains an `OWNERS` file naming its owner. The owner is the default reviewer for changes to that folder.

## 3. Shared Contract

- The API is defined in `openapi.yaml` in the root of the repository (OpenAPI 3.0, version-tagged).
- The file must open in Swagger Editor with zero errors.
- Every team member's endpoints appear in this file.
- The contract is agreed **before** building. Changes after that follow the contract change process in Section 6.

## 4. Communication

| What | How |
| --- | --- |
| Quick chat and urgent messages | WhatsApp group |
| Project discussion and files | Slack |
| Event storming and design board | [ITC504 Miro board](https://miro.com/app/board/uXjVHlCiilw=/) |
| Team meetings | As needed, called by any team member who requests one (agree a time on WhatsApp or Slack) |
| Task tracking | [e.g. GitHub Projects / Slack channel / Trello] |
| Urgent issues | Message the team leader and the affected owner on WhatsApp |

**Response time:** we reply to team messages within [24 hours]. If someone will be unavailable, they tell the team in advance.

## 5. Git Rules

### 5.1 Branches

- `main` is always in a working state and is protected. No direct commits.
- Work happens on short-lived branches named by type and topic:
  - `feature/api-movies`
  - `fix/report-date-validation`
  - `docs/architecture-update`

### 5.2 Commit Messages

Use a type prefix and a short description of what changed:

- `feat:` a new feature
- `fix:` a bug fix
- `docs:` documentation only
- `refactor:` code change with no behaviour change
- `test:` adding or updating tests

Example: `feat: add POST /performance endpoint`

### 5.3 Pull Requests

- Every change reaches `main` through a pull request.
- Keep pull requests small, **under 200 lines** where possible.
- Describe what changed, why, and how it was tested.
- At least one teammate reviews before merging. Changes touching someone else's folder need that owner's review.
- Only the Git administrator (Reinaldo) merges into `main`. If he is unavailable, [named teammate] covers.
- Run tests and validate `openapi.yaml` before opening a pull request.

### 5.4 Review Promise

We review pull requests within **[24 hours]**. If a review will be late, the reviewer says so on the pull request.

## 6. Changing the API Contract

1. Open a pull request that changes `openapi.yaml` first, before the code.
2. Explain what changed and which modules it affects.
3. Affected owners review and comment.
4. The Git administrator merges once the affected owners agree.
5. Version number: a breaking change raises the major version; a compatible addition raises the minor version.

## 7. Shared Technical Rules

- **Base path:** `/api/v1`
- **Dates:** ISO 8601 (`YYYY-MM-DD`). A week is identified by its Monday (`weekStart`).
- **Money:** non-negative number in AUD, up to two decimal places.
- **Field names:** camelCase.
- **Errors:** a single standard format with a code and message. Standard statuses: 400, 404, 409 and 500, plus 401 if login is built. Internal details are logged, never returned.
- **Event storming:** results are kept on our Miro board, and an image of the board goes in `/docs/architecture-blueprint.md`.
- **Authentication:** [decide: login built or out of scope]. If built, all endpoints except login require a bearer token.

## 8. Decision Making

- We aim for agreement by discussion.
- If we cannot agree, we vote and a simple majority decides. The team leader breaks ties.
- Decisions that change the contract or the Git rules are recorded in a pull request or in `/docs/`.

## 9. Fairness and Contribution

- Work is shared so each member owns a separate module.
- We keep a running record of who did what for the Team Contribution Statement.
- If someone is falling behind, we raise it early and help first. If it continues, we tell the teacher.
- All members attend and speak in the Week 8 presentation.

## 10. Team Risks

| Risk | Plan |
| --- | --- |
| Contract drifts from the code | Contract changes go through pull requests first; validate `openapi.yaml` on every change. |
| Late database delivery blocks the API | Agree the data access interface early; use a stub until the database is ready. |
| Open decisions (review thresholds, login) | Decide by [date]; record the result in the contract. |
| Merge bottleneck on one person | Name a backup merger. |
| Last-minute rush before submission | Work in priority order and keep a working version on `main`. |

## 11. Agreement

By adding our names to this file through a pull request, we agree to follow this charter.

| Name | Date agreed |
| --- | --- |
| Prakash | |
| Roshni | |
| Chandani | |
| Reinaldo (Team Leader) | |
| Avishek | |
