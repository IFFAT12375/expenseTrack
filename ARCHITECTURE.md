# Architecture notes

This is a small split-expense app. The frontend is React with Vite. The backend is Express, MongoDB, and Mongoose. I used JWTs for sessions because they keep the API stateless and were enough for this project.

## 🎥 Demo Video

A 4–5 minute screen-recorded walkthrough demonstrating the main application flows.

▶️ [Watch the Demo](https://www.youtube.com/watch?v=sCNP7i-bL3E)

The demo covers:

- User authentication
- Group creation and member invitation
- Expense creation
- Equal and exact splits
- Group and overall balances
- Settlements
- Balance recalculation
- Validation/error handling

## How I approached it

I treated groups, expenses, and settlements as the core of the app first. Once those flows worked, I added the dashboard summaries, per-group balance view, group membership actions, and notifications. The later work exposed a few cases where two screens were calculating the same number differently, so I moved toward one shared balance utility instead of putting balance math in React components.

The project is organised by responsibility:

- `client/src/pages` contains page-level UI and loading state.
- `client/src/components` contains reusable forms, cards, rows, modals, and the notification menu.
- `server/models` contains MongoDB schemas.
- `server/controllers` owns request validation and business rules.
- `server/utils/calculateBalances.js` is the one place that turns expense and settlement records into outstanding balances.

## Data model

### User

`User` stores a full name, unique email, unique username, bcrypt password, and PIN. Password and PIN fields use `select: false`, so normal reads do not expose them. A few legacy-looking fields (`movements`, `interestRate`, and `type`) are not used by the expense flows and would be removed or moved if this became a longer-lived product.

### Group

`Group` has a name, `createdBy`, a list of member user IDs, and a creation date. Members are references rather than embedded copies of users so profile changes are not duplicated. A user can only read a group when their ID is in `members`.

### Expense and split

An `Expense` belongs to one group and records the amount, payer, description, date, category, split type, and an array of splits. Each split has `{ userId, amount }`. Keeping the exact split amounts is deliberate: it makes the original entry auditable and avoids recalculating an old equal split after membership changes.

### Settlement

`Settlement` is a payment from one member to another inside a group. It is separate from an expense because paying someone back should lower a debt without changing the historical expense record.

### Notification

`Notification` stores its recipient, related group, event type, text, read state, and timestamp. Notifications are written for the other members of a shared group; the person who performed an action does not need a notification for their own click.

## Balance math

Balances are calculated on demand from expenses and settlements. They are not stored as a mutable total in MongoDB.

For each expense split, the payer is the creditor and the split member is the debtor. For example, if A pays $30 and B's split is $10, the internal balance is `A -> B: 10`.

For a settlement from B to A, the same utility applies a negative balance in the opposite direction. Opposite directions between the same two people are netted. Zero rows are removed and values are rounded to cents after the calculation.

The utility returns a map keyed by `creditorId_debtorId`. Controllers turn that map into named rows after loading the group members. A user's **owed** total is the rows where they are the creditor. Their **owe** total is the rows where they are the debtor.

Group totals are calculated independently and then summed for the dashboard and the All balances tab. This is important: a debt in one group should not cancel a separate debt in another group just because the two people happen to be the same.

The API recalculates balances when requested. That is simpler and safer than incrementally updating cached totals, but it means large groups with a long history will need aggregation queries or a carefully invalidated snapshot later.

## Validation and edge cases

- Creating or editing an expense requires a description, positive amount, valid group members, and splits that add up to the expense within one cent.
- Self-debts are ignored by the balance utility.
- Settlements require two different current group members and a positive amount.
- A user cannot leave while any outstanding row involves them. The server repeats this check even though the UI also gives an earlier message.
- Every protected route checks the JWT and group membership before returning group data.
- A notification clear only deletes the current user's notification records.
- Amounts are converted to numbers and rounded to cents at the balance boundary. This is not a full fixed-point money implementation; using integer cents end-to-end would be safer for a financial product.

## What went wrong and what changed

The first dashboard summary calculated all group records together. That allowed an amount in one group to offset an amount in another, while the Balances page calculated groups separately. The two screens could therefore show different owed and owe totals. The fix was to calculate each group first and sum those group totals.

Leaving a group also looked successful in the UI but did not always remove the member. The group query had populated the member references, and the removal code compared the whole populated document to a user ID. It now compares `member._id` when present.

The earliest notification helper made the same assumption about member values. It is now defensive about either raw IDs or populated documents. Notifications were also missing for leaving, editing an expense, and deleting an expense; those events now write notification records for the remaining members.

## Trade-offs and next steps

I chose direct controllers and a single balance utility over a more layered domain service because it kept the code understandable at this size. Some controllers are still more compact than ideal and should be split into smaller functions as the app grows.

With another day, I would add automated tests for the balance utility and route permissions, use integer cents instead of JavaScript floating point values, add pagination for activity and notifications, and replace notification polling with WebSockets or server-sent events. I would also add an explicit audit trail for edited/deleted expenses and a proper production CORS allowlist.

## Deployment status

The repository is prepared for separate frontend and API deployment through `VITE_API_URL` and `CLIENT_ORIGIN`, but a live deployment has not been verified from this workspace. The deployment steps in the README are intentionally written as a runbook, not a claim that the app is already live. The likely deployment failures to check first are an incorrect frontend API URL, a CORS origin mismatch, missing MongoDB network access, or a missing JWT secret.
