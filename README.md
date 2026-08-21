# ExpenseTrack

ExpenseTrack is a MERN application for managing shared expenses across groups. Users can create groups, invite members, record expenses with equal or exact splits, track balances, record settlements, and receive activity notifications.

## Live URL

[Open and test ExpenseTrack](https://client-psi-beryl-29.vercel.app)

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

## Project layout

```text
client/   React and Vite frontend
server/   Express, MongoDB, and JWT API
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB connection string
- npm

## Local setup

1. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create `server/.env` from `server/.env.example` and set the values:

   ```env
   MONGO_URI=mongodb://localhost:27017/expenseTrack
   JWT_SECRET=use_a_long_random_secret
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. Start the API:

   ```bash
   npm run dev
   ```

4. In a second terminal, copy `client/.env.example` to `client/.env`, then install and start the frontend:

   ```bash
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`.

The Vite development server proxies `/api` requests to the API at `http://localhost:5000`. `VITE_API_URL` is optional locally; leaving it empty uses the proxy. Set it when the frontend and API run on different origins.

## Sample data

Seed four sample users after MongoDB is running:

```bash
cd server
npm run seed
```

The sample password is `password123`. Change or remove these accounts before using a shared or production database.

## Main features

- JWT authentication with bcrypt password hashing
- Group creation, invitations, member management, and safe leave-group validation
- Expense recording with equal and exact splits
- Overall and group-level balances calculated from expenses and settlements
- Person-to-person balances from the logged-in user's perspective
- Settlement records that reduce outstanding balances without changing expenses
- Dashboard totals, recent activity, and non-destructive history clearing
- In-app notifications for group membership, expenses, and settlements

## Useful API endpoints

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/dashboard
GET  /api/balances
GET  /api/groups/:id/balances
POST /api/groups/:id/leave
POST /api/groups/:id/invite

POST /api/expenses
GET  /api/expenses/:groupId
POST /api/settlements
GET  /api/settlements/:groupId

GET    /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications
```

Protected endpoints require:

```text
Authorization: Bearer <jwt-token>
```

## Deployment

The frontend is live at [https://client-psi-beryl-29.vercel.app](https://client-psi-beryl-29.vercel.app). The app can be deployed as two services:

1. Deploy the API to a Node host such as Render, Railway, or Fly.io. Set `MONGO_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN` to the final frontend URL. Use `npm start` from `server/` as the start command.
2. Deploy `client/` as a static Vite site. Set `VITE_API_URL` to the public API URL, without a trailing slash, then use `npm run build`. Publish the generated `dist/` directory.
3. Open the frontend URL, register a test account, and call `<api-url>/api/health` to confirm both services can reach each other.

The API CORS setting accepts one frontend origin through `CLIENT_ORIGIN`. For multiple production origins, replace it with a reviewed origin allowlist rather than opening CORS to every site.

Do not commit `server/.env`, `client/.env`, database credentials, or JWT secrets. The repository ignores real environment files and includes only safe `.env.example` templates.
