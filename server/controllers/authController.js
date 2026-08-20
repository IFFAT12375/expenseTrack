import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const publicUser = (user) => ({ id: user._id, fullName: user.fullName, email: user.email, username: user.username, movements: user.movements, interestRate: user.interestRate, type: user.type });
const makeUsername = (name) => name.trim().split(/\\s+/).map((part) => part[0]).join('').toUpperCase();

export async function register(req, res) {
  try {
    const { fullName, email, password, pin } = req.body;
    if (!fullName || !email || !password || pin === undefined || password.length < 6) return res.status(400).json({ message: 'Full name, email, pin, and a 6+ character password are required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered' });
    let username = makeUsername(fullName) || 'USER';
    let suffix = 1;
    while (await User.findOne({ username })) username = `${makeUsername(fullName)}${suffix++}`;
    const user = await User.create({ fullName, email, password: await bcrypt.hash(password, 12), pin: Number(pin), username });
    res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password +pin');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: generateToken(user._id), user: publicUser(user) });
}

export async function me(req, res) { res.json({ user: publicUser(req.user) }); }
