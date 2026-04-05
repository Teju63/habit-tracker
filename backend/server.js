// server.js — Smart Habit Tracker Backend API

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('combined'));

// In-memory DB (replace with MongoDB/PostgreSQL in production)
let habits = [];
let logs = {};
let users = {};

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'smart-habit-tracker-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send([
    `# HELP habits_total Total number of habits`,
    `# TYPE habits_total gauge`,
    `habits_total ${habits.length}`,
    `# HELP api_uptime_seconds API uptime in seconds`,
    `# TYPE api_uptime_seconds counter`,
    `api_uptime_seconds ${process.uptime().toFixed(2)}`,
    `# HELP logs_total Total log entries`,
    `# TYPE logs_total gauge`,
    `logs_total ${Object.values(logs).reduce((sum, v) => sum + Object.keys(v).length, 0)}`,
  ].join('\n'));
});

// ===== HABITS ROUTES =====

// GET /api/habits
app.get('/api/habits', (req, res) => {
  const { userId } = req.query;
  const userHabits = userId ? habits.filter(h => h.userId === userId) : habits;
  res.json({ success: true, data: userHabits, count: userHabits.length });
});

// GET /api/habits/:id
app.get('/api/habits/:id', (req, res) => {
  const habit = habits.find(h => h.id === req.params.id);
  if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
  res.json({ success: true, data: habit });
});

// POST /api/habits
app.post('/api/habits', (req, res) => {
  const { name, category, frequency, target, color, userId } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  const habit = {
    id: uuidv4(),
    name: name.trim(),
    category: category || 'general',
    frequency: frequency || 'daily',
    target: parseInt(target) || 1,
    color: color || '#7B61FF',
    userId: userId || 'default',
    streak: 0,
    bestStreak: 0,
    totalCompleted: 0,
    createdAt: new Date().toISOString(),
  };

  habits.push(habit);
  res.status(201).json({ success: true, data: habit, message: 'Habit created' });
});

// PATCH /api/habits/:id
app.patch('/api/habits/:id', (req, res) => {
  const idx = habits.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Habit not found' });

  const allowed = ['name', 'category', 'frequency', 'target', 'color', 'streak', 'bestStreak', 'totalCompleted'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) habits[idx][key] = req.body[key];
  });
  habits[idx].updatedAt = new Date().toISOString();
  res.json({ success: true, data: habits[idx] });
});

// DELETE /api/habits/:id
app.delete('/api/habits/:id', (req, res) => {
  const idx = habits.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Habit not found' });
  habits.splice(idx, 1);
  delete logs[req.params.id];
  res.json({ success: true, message: 'Habit deleted' });
});

// ===== LOGS ROUTES =====

// GET /api/logs/:habitId
app.get('/api/logs/:habitId', (req, res) => {
  res.json({ success: true, data: logs[req.params.habitId] || {} });
});

// POST /api/logs/:habitId/toggle
app.post('/api/logs/:habitId/toggle', (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

  const habitId = req.params.habitId;
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

  if (!logs[habitId]) logs[habitId] = {};
  const current = logs[habitId][date] || false;
  logs[habitId][date] = !current;

  // Update streak
  if (!current) {
    habit.totalCompleted = (habit.totalCompleted || 0) + 1;
    habit.streak = (habit.streak || 0) + 1;
    habit.bestStreak = Math.max(habit.streak, habit.bestStreak || 0);
  } else {
    habit.streak = Math.max(0, (habit.streak || 0) - 1);
  }

  res.json({ success: true, data: { completed: !current, date, habitId } });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const { userId } = req.query;
  const userHabits = userId ? habits.filter(h => h.userId === userId) : habits;
  const today = new Date().toISOString().split('T')[0];

  const todayCompleted = userHabits.filter(h => logs[h.id]?.[today]).length;
  const maxStreak = Math.max(0, ...userHabits.map(h => h.streak || 0));
  const totalXP = userHabits.reduce((sum, h) => sum + (h.totalCompleted || 0) * 10, 0);

  res.json({
    success: true,
    data: {
      totalHabits: userHabits.length,
      todayCompleted,
      todayTotal: userHabits.length,
      completionRate: userHabits.length > 0 ? Math.round((todayCompleted / userHabits.length) * 100) : 0,
      maxStreak,
      totalXP,
    },
  });
});

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ===== START =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Smart Habit Tracker API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;
