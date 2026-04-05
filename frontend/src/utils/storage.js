// storage.js — LocalStorage wrapper for Habit Tracker

const STORAGE_KEYS = {
  HABITS: 'vate_habits',
  LOGS: 'vate_logs',
  SETTINGS: 'vate_settings',
  XP: 'vate_xp',
};

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  // ---- HABITS ----
  getHabits() {
    return this.get(STORAGE_KEYS.HABITS) || [];
  },

  saveHabits(habits) {
    return this.set(STORAGE_KEYS.HABITS, habits);
  },

  addHabit(habit) {
    const habits = this.getHabits();
    habit.id = Date.now().toString();
    habit.createdAt = new Date().toISOString();
    habit.streak = 0;
    habit.bestStreak = 0;
    habit.totalCompleted = 0;
    habits.push(habit);
    this.saveHabits(habits);
    return habit;
  },

  deleteHabit(id) {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);
    // Also clean up logs
    const logs = this.getLogs();
    delete logs[id];
    this.set(STORAGE_KEYS.LOGS, logs);
  },

  updateHabit(id, updates) {
    const habits = this.getHabits().map(h => h.id === id ? { ...h, ...updates } : h);
    this.saveHabits(habits);
  },

  // ---- LOGS ----
  getLogs() {
    return this.get(STORAGE_KEYS.LOGS) || {};
  },

  getLogForDate(habitId, date) {
    const logs = this.getLogs();
    return logs[habitId]?.[date] || false;
  },

  toggleLog(habitId, date) {
    const logs = this.getLogs();
    if (!logs[habitId]) logs[habitId] = {};
    const current = logs[habitId][date] || false;
    logs[habitId][date] = !current;
    this.set(STORAGE_KEYS.LOGS, logs);
    return !current;
  },

  getLogsForHabit(habitId) {
    const logs = this.getLogs();
    return logs[habitId] || {};
  },

  // ---- SETTINGS ----
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS) || {
      name: 'User',
      dailyGoal: 5,
      reminderTime: '08:00',
      theme: 'dark',
    };
  },

  saveSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // ---- XP ----
  getXP() {
    return this.get(STORAGE_KEYS.XP) || 0;
  },

  addXP(amount) {
    const current = this.getXP();
    const newXP = current + amount;
    this.set(STORAGE_KEYS.XP, newXP);
    return newXP;
  },
};
