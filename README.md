# ExpenseTrack

ExpenseTrack is a MERN application for managing shared expenses across groups. Users can create groups, invite members, record expenses with equal or exact splits, track balances, record settlements, and receive activity notifications.

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
   ```

3. Start the API:

   ```bash
   npm run dev
   ```

4. In a second terminal, install and start the frontend:

   ```bash
   cd client
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`.

The Vite development server proxies `/api` requests to the API at `http://localhost:5000`.

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

## Production notes

Do not commit `server/.env`, database credentials, or JWT secrets. The repository ignores real environment files and keeps only `server/.env.example` for setup reference. Use a managed MongoDB instance, a strong JWT secret, HTTPS, and a restricted CORS origin before deploying.
