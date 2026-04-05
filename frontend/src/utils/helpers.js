// helpers.js — Utility functions

const Helpers = {
  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  dayName(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  },

  dateStr(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  },

  getWeekDates() {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  },

  getLast30Days() {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 29 + i);
      return d.toISOString().split('T')[0];
    });
  },

  calcStreak(logs) {
    let streak = 0;
    let date = new Date();
    while (true) {
      const key = date.toISOString().split('T')[0];
      if (logs[key]) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  categoryLabel(cat) {
    const map = {
      health: '🏃 Health',
      mind: '🧠 Mind',
      productivity: '💼 Work',
      social: '👥 Social',
      creative: '🎨 Creative',
      finance: '💰 Finance',
    };
    return map[cat] || cat;
  },

  showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  },

  randomId() {
    return Math.random().toString(36).slice(2);
  },

  getLevel(xp) {
    const lvl = Math.floor(xp / 100) + 1;
    return { level: lvl, xpInLevel: xp % 100, xpNeeded: 100 };
  },
};
