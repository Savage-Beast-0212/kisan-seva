const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');

const app = express();
const PORT = 3000;
const SECRET = 'replace-this-with-a-long-random-string';

app.use(express.json());

const otpStore = {}; // temporary: { phone: code }

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.post('/request-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = code;

  console.log(`OTP for ${phone}: ${code}`);
  res.json({ message: 'OTP generated', otp: code });
});

app.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (otpStore[phone] !== code) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  let { data: user } = await supabase.from('users').select('*').eq('phone', phone).single();

  if (!user) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ phone, role: 'farmer' })
      .select()
      .single();
    user = newUser;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

  delete otpStore[phone];

  res.json({ message: 'Login successful', token, user });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});