// app.js — Main application controller

const App = {
  currentPage: 'dashboard',

  init() {
    this.initNav();
    HabitsComponent.initModal();
    this.initSettings();
    this.refresh();
    this.seedDemoData();
  },

  initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
  },

  navigateTo(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
    this.refresh();
  },

  refresh() {
    const habits = Storage.getHabits();
    const settings = Storage.getSettings();

    // Update user name
    const userName = document.querySelector('.user-name');
    if (userName) userName.textContent = settings.name;

    switch (this.currentPage) {
      case 'dashboard':
        Dashboard.render(habits);
        break;
      case 'habits':
        HabitsComponent.renderAllHabits(habits);
        break;
      case 'streaks':
        StreaksComponent.render(habits);
        break;
      case 'analytics':
        setTimeout(() => AnalyticsComponent.render(habits), 50);
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  },

  initSettings() {
    document.getElementById('save-settings')?.addEventListener('click', () => {
      const settings = {
        name: document.getElementById('settings-name').value,
        dailyGoal: parseInt(document.getElementById('settings-goal').value) || 5,
        reminderTime: document.getElementById('settings-time').value,
        theme: document.getElementById('settings-theme').value,
      };
      Storage.saveSettings(settings);
      Helpers.showToast('Settings saved!', 'success');
      this.refresh();
    });
  },

  loadSettings() {
    const s = Storage.getSettings();
    document.getElementById('settings-name').value = s.name;
    document.getElementById('settings-goal').value = s.dailyGoal;
    document.getElementById('settings-time').value = s.reminderTime;
    document.getElementById('settings-theme').value = s.theme;
  },

  seedDemoData() {
    if (Storage.getHabits().length > 0) return; // Don't seed if data exists

    const demos = [
      { name: 'Morning Run', category: 'health', frequency: 'daily', target: 30, color: '#FF6B6B' },
      { name: 'Read 20 Pages', category: 'mind', frequency: 'daily', target: 20, color: '#7B61FF' },
      { name: 'Drink 8 Glasses Water', category: 'health', frequency: 'daily', target: 8, color: '#4ECDC4' },
      { name: 'Code Practice', category: 'productivity', frequency: 'weekdays', target: 60, color: '#45B7D1' },
      { name: 'Meditate', category: 'mind', frequency: 'daily', target: 10, color: '#DDA0DD' },
    ];

    demos.forEach(d => Storage.addHabit(d));

    // Add some past logs for demo streaks
    const habits = Storage.getHabits();
    const today = new Date();
    habits.forEach((habit, idx) => {
      const days = [3, 7, 5, 10, 4][idx] || 3;
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        Storage.toggleLog(habit.id, key);
      }
      const logs = Storage.getLogsForHabit(habit.id);
      const streak = Helpers.calcStreak(logs);
      Storage.updateHabit(habit.id, { streak, bestStreak: streak, totalCompleted: streak });
    });

    Storage.set('vate_xp', 450);
    Helpers.showToast('👋 Welcome to Vate! Demo data loaded.', 'success');
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
