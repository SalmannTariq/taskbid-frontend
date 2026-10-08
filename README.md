# TaskBid

TaskBid is a board for posting work, collecting hour bids, and moving a task from draft to done. There is no sign-in. The sidebar dropdown **Acting as** picks which person the app is using. That person creates tasks, places bids, and moves a task forward.

The page talks to the TaskBid API. Business rules live in Postgres. This README covers the app. The API README covers routes, locks, and migrations.

## Run it

Start the API first, then:

```bash
npm install
npm run dev
```

Create `.env` in this folder:

```
VITE_BACKEND_URL=http://localhost:3000
```

Vite reads that value when it starts. The app opens at `http://localhost:5173`.

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |

On Vercel, set `VITE_BACKEND_URL` to the public API address before the build. `vercel.json` sends every path to `index.html` so refresh works on `/tasks` and `/dashboard`.

## Screens

**Task queue** (`/tasks`) is a column for each status:

`draft → open → bidding closed → assigned → in progress → review → done`

A card shows complexity, title, bid count, lowest bid, deadline, and creator. Open a card for the description, the bid list, and the one next action that person is allowed to take.

**Dashboard** (`/dashboard`) loads `GET /dashboard/stats` and shows:

- tasks by status, as a Recharts bar chart and as a count list
- average bid hours for complexity 1 through 5
- the top 3 people by tasks marked done
- how many tasks passed their deadline with zero bids, grouped by complexity

## Acting as someone

`GET /users` returns id, name, and email. The dropdown lists those people. The chosen id is saved in the browser as `taskbid-user-id`, so a refresh keeps the same person. It is not a password or a session cookie.

What that person can do:

| Status | Who | Action |
|---|---|---|
| draft | creator | Open task |
| open | creator | Close bidding |
| open, before the deadline | anyone except the creator | Place one bid, in hours |
| assigned | assignee | Start work |
| in progress | assignee | Send to review |
| review | creator | Mark done |

There is no Assign button. When bidding closes, the API assigns the lowest bid that still fits that person's free hours. If nobody fits, the task stays **bidding closed** and the bid list stays visible. A timer retries that assignment when capacity frees up.

A bid form shows max capacity, current workload, and hours left. The hours field cannot go above the hours left.

## Live updates

The page opens a Socket.IO connection to `VITE_BACKEND_URL` with `withCredentials: true`. After a task or bid changes, the server emits `changed` with `{ taskId }`. The board, an open task, and the dashboard reload from the API. The event does not carry the full row.

## Why the rules live in the database

These rules are enforced in Postgres, not only in the page:

- A person cannot bid on their own task.
- A bid that would push them over `max_capacity_hours` is rejected.
- A bid cannot be placed after bidding is closed, or after the deadline.
- A task status can only move one step forward.
- One person can place only one bid on a task.

The database is the last place every write goes through, including the deadline timer. A check that lived only in the page could be skipped by a direct insert. The capacity check locks the user row, so two bids at the same moment cannot both pass when only one fits.

The page still checks that a form is filled in. Postgres raises the business-rule errors, and the API turns them into 400 or 409 responses, which the page shows.

The trade-off is that the rule is not visible in the React code. Changing it means a migration, and the message on screen has to match the database error text.

## How assignment stays atomic

Workload is not a stored number. It is the `user_workloads` view: the sum of bid hours on tasks already in `assigned`, `in_progress`, or `review`. Setting `tasks.assigned_to` is what changes that sum.

Closing bidding, the deadline timer, and `POST /tasks/:id/assign` pick the winner inside one database transaction:

1. Lock the task row. A second assign of the same task waits.
2. Lock that task's bids, lowest hours first, then earliest bid.
3. Lock every bidder's user row, in user id order, before reading capacity.
4. Walk the bids from lowest to highest. Skip anyone whose current workload plus this bid is over `max_capacity_hours`.
5. Write one update: status becomes `assigned` and `assigned_to` is the first bidder who still fits.
6. If there are no bids, or nobody still fits, no assignee is written and the task stays `bidding_closed`.

If a statement throws, the transaction rolls back, so the status and the assignee cannot be saved separately.

Two tasks can want the same person's last free hours at once. Both lock that user row before they read capacity, and they keep the lock until commit. The second waits, then sees the first assignment. If the person only had room for one task, the second skips them. Locking users in id order keeps the two transactions from locking the same people in opposite orders.

## Audit log

`audit_log` records a row after every task **status** change: who did it, the old status, and the new status. The API sets `app.user_id` for that transaction before the update. On a deadline close, the logged person is the task creator.

Creating a task, placing a bid, and the `assigned_to` value itself are not separate audit rows. The status change to `assigned` is.
