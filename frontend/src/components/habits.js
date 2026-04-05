// habits.js — Habit rendering logic

const HabitsComponent = {
  selectedColor: '#FF6B6B',
  selectedFreq: 'daily',

  renderTodayList(habits) {
    const container = document.getElementById('today-habits-list');
    const today = Helpers.todayStr();

    if (!habits.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◎</div>
          <p>No habits yet. Add your first habit to get started!</p>
          <button class="btn-primary" onclick="document.getElementById('modal-overlay').classList.add('open')">+ Add Habit</button>
        </div>`;
      return;
    }

    const todayHabits = habits.filter(h => this.isScheduledToday(h));
    const completed = todayHabits.filter(h => Storage.getLogForDate(h.id, today));
    const total = todayHabits.length;

    // Update progress
    const pct = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    document.getElementById('today-progress-bar').style.width = pct + '%';
    document.getElementById('today-progress-label').textContent = `${completed.length} of ${total} done`;
    document.getElementById('stat-today').textContent = `${completed.length}/${total}`;
    document.getElementById('stat-weekly').textContent = pct + '%';

    container.innerHTML = todayHabits.map(h => {
      const done = Storage.getLogForDate(h.id, today);
      return `
        <div class="habit-item ${done ? 'completed' : ''}" data-id="${h.id}" onclick="HabitsComponent.toggleHabit('${h.id}')">
          <div class="habit-check">${done ? '✓' : ''}</div>
          <div class="habit-color-dot" style="background:${h.color}"></div>
          <span class="habit-name">${h.name}</span>
          <span class="habit-category">${Helpers.categoryLabel(h.category)}</span>
          ${h.streak > 0 ? `<span class="habit-streak-badge">🔥 ${h.streak}d</span>` : ''}
        </div>`;
    }).join('');
  },

  renderAllHabits(habits) {
    const container = document.getElementById('all-habits-grid');
    if (!habits.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◊</div>
          <p>No habits added yet. Create one to begin your journey.</p>
        </div>`;
      return;
    }
    container.innerHTML = habits.map(h => `
      <div class="habit-card" style="--habit-color:${h.color}">
        <div class="habit-card-header">
          <div>
            <div class="habit-card-name">${h.name}</div>
            <div class="habit-card-category">${Helpers.categoryLabel(h.category)}</div>
          </div>
          <div class="habit-card-actions">
            <button class="btn-icon" onclick="HabitsComponent.deleteHabit('${h.id}')" title="Delete">✕</button>
          </div>
        </div>
        <div class="habit-card-stats">
          <div class="habit-stat">
            <div class="habit-stat-val" style="color:${h.color}">${h.streak || 0}</div>
            <div class="habit-stat-lbl">Streak</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-val">${h.bestStreak || 0}</div>
            <div class="habit-stat-lbl">Best</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-val">${h.totalCompleted || 0}</div>
            <div class="habit-stat-lbl">Done</div>
          </div>
        </div>
        <span class="habit-card-freq">${h.frequency || 'daily'}</span>
      </div>`).join('');
  },

  toggleHabit(id) {
    const today = Helpers.todayStr();
    const done = Storage.toggleLog(id, today);
    const habits = Storage.getHabits();
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    if (done) {
      // Recalculate streak
      const logs = Storage.getLogsForHabit(id);
      const streak = Helpers.calcStreak(logs);
      const bestStreak = Math.max(streak, habit.bestStreak || 0);
      const totalCompleted = (habit.totalCompleted || 0) + 1;
      Storage.updateHabit(id, { streak, bestStreak, totalCompleted });
      Storage.addXP(10);
      Helpers.showToast(`✓ ${habit.name} completed! +10 XP`, 'success');
    } else {
      const logs = Storage.getLogsForHabit(id);
      const streak = Helpers.calcStreak(logs);
      Storage.updateHabit(id, { streak });
      Helpers.showToast(`${habit.name} unmarked`, 'info');
    }

    App.refresh();
  },

  deleteHabit(id) {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    Storage.deleteHabit(id);
    Helpers.showToast('Habit deleted', 'error');
    App.refresh();
  },

  isScheduledToday(habit) {
    const day = new Date().getDay(); // 0=Sun
    const freq = habit.frequency || 'daily';
    if (freq === 'daily') return true;
    if (freq === 'weekdays') return day >= 1 && day <= 5;
    if (freq === 'weekends') return day === 0 || day === 6;
    return true;
  },

  initModal() {
    // Color dots
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        HabitsComponent.selectedColor = dot.dataset.color;
      });
    });

    // Freq buttons
    document.querySelectorAll('.freq-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        HabitsComponent.selectedFreq = btn.dataset.freq;
      });
    });

    // Open modal triggers
    ['open-add-modal', 'open-add-modal-2', 'open-add-modal-3'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('open');
      });
    });

    // Close modal
    document.getElementById('close-modal').addEventListener('click', this.closeModal);
    document.getElementById('cancel-modal').addEventListener('click', this.closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) this.closeModal();
    });

    // Save habit
    document.getElementById('save-habit').addEventListener('click', () => {
      const name = document.getElementById('habit-name').value.trim();
      if (!name) { Helpers.showToast('Please enter a habit name', 'error'); return; }

      Storage.addHabit({
        name,
        category: document.getElementById('habit-category').value,
        frequency: HabitsComponent.selectedFreq,
        target: parseInt(document.getElementById('habit-target').value) || 1,
        color: HabitsComponent.selectedColor,
      });

      Helpers.showToast(`🎉 "${name}" habit created!`, 'success');
      this.closeModal();
      App.refresh();
    });
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('habit-name').value = '';
  },
};
