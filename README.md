# ExpenseTrack

A MERN group expense manager.

## Local setup

1. Clone the repository.
2. In `server`, copy `.env.example` to `.env`, set `MONGO_URI` and `JWT_SECRET`, then run `npm install` and `npm run dev`.
3. In a second terminal, run `cd client && npm install && npm run dev`.

The API runs on port 5000 and Vite runs on port 5173. Run `cd server && npm run seed` for four sample accounts. They use the password `password123`.
