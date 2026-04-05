// analytics.js — Charts and heatmap

const AnalyticsComponent = {
  render(habits) {
    this.renderHeatmap(habits);
    this.drawCompletionChart(habits);
    this.drawDistributionChart(habits);
  },

  renderHeatmap(habits) {
    const container = document.getElementById('month-heatmap');
    const days = Helpers.getLast30Days();
    container.innerHTML = days.map(date => {
      const total = habits.filter(h => HabitsComponent.isScheduledToday(h)).length || 1;
      const done = habits.filter(h => Storage.getLogForDate(h.id, date)).length;
      const ratio = done / total;
      const level = ratio === 0 ? 0 : ratio < 0.3 ? 1 : ratio < 0.6 ? 2 : ratio < 0.9 ? 3 : 4;
      return `<div class="heatmap-cell level-${level}" title="${date}: ${done}/${total} habits"></div>`;
    }).join('');
  },

  drawCompletionChart(habits) {
    const canvas = document.getElementById('chart-completion');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const days = Helpers.getLast30Days();
    const data = days.map(date => {
      const total = habits.length || 1;
      const done = habits.filter(h => Storage.getLogForDate(h.id, date)).length;
      return Math.round((done / total) * 100);
    });

    const w = canvas.offsetWidth || 400;
    canvas.width = w;
    canvas.height = 180;
    const cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const pad = 20;
    const graphW = cw - pad * 2;
    const graphH = ch - pad * 2;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach(v => {
      const y = pad + graphH - (v / 100) * graphH;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(cw - pad, y); ctx.stroke();
    });

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad, 0, ch - pad);
    grad.addColorStop(0, 'rgba(123,97,255,0.4)');
    grad.addColorStop(1, 'rgba(123,97,255,0.02)');

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad + (i / (data.length - 1)) * graphW;
      const y = pad + graphH - (v / 100) * graphH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const lastX = pad + graphW;
    const firstX = pad;
    ctx.lineTo(lastX, ch - pad);
    ctx.lineTo(firstX, ch - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad + (i / (data.length - 1)) * graphW;
      const y = pad + graphH - (v / 100) * graphH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#7B61FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  drawDistributionChart(habits) {
    const canvas = document.getElementById('chart-distribution');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.offsetWidth || 280;
    canvas.width = w;
    canvas.height = 180;

    const categories = {};
    habits.forEach(h => {
      categories[h.category] = (categories[h.category] || 0) + 1;
    });

    const entries = Object.entries(categories);
    if (!entries.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '14px DM Sans';
      ctx.textAlign = 'center';
      ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
      return;
    }

    const total = habits.length;
    const colors = ['#7B61FF', '#FF6B6B', '#4ECDC4', '#F7DC6F', '#DDA0DD', '#96CEB4'];
    const cx = canvas.width / 2 - 30;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;

    let startAngle = -Math.PI / 2;
    entries.forEach(([cat, count], i) => {
      const slice = (count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#111118';
    ctx.fill();

    // Legend
    const legendX = cx * 2 - 10;
    entries.forEach(([cat, count], i) => {
      const y = 20 + i * 22;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, y, 10, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px DM Sans';
      ctx.textAlign = 'left';
      ctx.fillText(cat, legendX + 14, y + 9);
    });
  },
};
