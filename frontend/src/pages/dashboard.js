// dashboard.js — Dashboard page logic

const Dashboard = {
  render(habits) {
    this.setDate();
    this.renderWeek(habits);
    this.updateStats(habits);
    HabitsComponent.renderTodayList(habits);
  },

  setDate() {
    const el = document.getElementById('current-date');
    if (el) {
      el.textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
    }
  },

  updateStats(habits) {
    const streak = StreaksComponent.getMaxStreak(habits);
    document.getElementById('stat-streak').textContent = streak;
    document.getElementById('stat-xp').textContent = Storage.getXP();
  },

  renderWeek(habits) {
    const container = document.getElementById('week-grid');
    const weekDates = Helpers.getWeekDates();
    const today = Helpers.todayStr();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    container.innerHTML = weekDates.map((date, i) => {
      const isToday = date === today;
      const total = habits.filter(h => HabitsComponent.isScheduledToday(h)).length;
      const done = habits.filter(h => Storage.getLogForDate(h.id, date)).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      let cls = 'missed';
      if (pct === 100 && total > 0) cls = 'done';
      else if (pct > 0) cls = 'partial';
      else if (date > today) cls = '';

      return `
        <div class="week-day ${cls} ${isToday ? 'today' : ''}">
          <div class="week-day-label">${days[i]}</div>
          <div class="week-day-score">${total > 0 ? pct + '%' : '—'}</div>
        </div>`;
    }).join('');
  },
};
