import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const accounts = [
  { fullName: "Admin", email: "admin@example.com", username: "AD", pin: 4567 },
  {
    fullName: "Alex Morgan",
    email: "alex@example.com",
    username: "AM",
    pin: 1234,
  },
  {
    fullName: "Taylor Reed",
    email: "taylor@example.com",
    username: "TR",
    pin: 2345,
  },
  {
    fullName: "Jordan Lee",
    email: "jordan@example.com",
    username: "JL",
    pin: 3456,
  },
  {
    fullName: "Casey Smith",
    email: "casey@example.com",
    username: "CS",
    pin: 4567,
  },
];
await mongoose.connect(process.env.MONGO_URI);
for (const account of accounts)
  await User.updateOne(
    { email: account.email },
    { ...account, password: await bcrypt.hash("password123", 12) },
    { upsert: true },
  );
console.log("Seeded 4 sample accounts. Password: password123");
await mongoose.disconnect();
