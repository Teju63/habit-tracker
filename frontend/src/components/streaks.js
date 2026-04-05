// streaks.js — Streak & Badge logic

const StreaksComponent = {
  BADGES: [
    { id: 'first', icon: '🌱', name: 'First Step', desc: 'Complete your first habit', req: h => h.totalCompleted >= 1 },
    { id: 'week', icon: '🔥', name: 'Week Warrior', desc: '7-day streak', req: h => h.streak >= 7 },
    { id: 'month', icon: '⚡', name: 'Month Master', desc: '30-day streak', req: h => h.streak >= 30 },
    { id: 'centurion', icon: '💎', name: 'Centurion', desc: '100 completions', req: h => h.totalCompleted >= 100 },
    { id: 'consistent', icon: '🏆', name: 'Consistent', desc: 'Best streak of 14', req: h => h.bestStreak >= 14 },
    { id: 'legend', icon: '👑', name: 'Legend', desc: '100-day streak', req: h => h.streak >= 100 },
  ],

  render(habits) {
    this.renderStreaks(habits);
    this.renderBadges(habits);
  },

  renderStreaks(habits) {
    const container = document.getElementById('streaks-showcase');
    if (!habits.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">◊</div><p>Add habits to see your streaks!</p></div>';
      return;
    }
    container.innerHTML = habits.map(h => `
      <div class="streak-item">
        <div class="streak-fire">🔥</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">${h.name}</div>
        <div class="streak-count">${h.streak || 0}</div>
        <div class="streak-label">Current streak</div>
        <div class="streak-best">Best: ${h.bestStreak || 0} days</div>
      </div>`).join('');
  },

  renderBadges(habits) {
    const container = document.getElementById('badges-grid');
    container.innerHTML = this.BADGES.map(badge => {
      const earned = habits.some(h => badge.req(h));
      return `
        <div class="badge-card ${earned ? 'earned' : 'locked'}">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
          ${earned ? '<div style="font-size:0.65rem;color:var(--warning);margin-top:0.3rem">✓ Earned</div>' : ''}
        </div>`;
    }).join('');
  },

  getMaxStreak(habits) {
    return Math.max(0, ...habits.map(h => h.streak || 0));
  },
};
