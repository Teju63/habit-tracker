// tests/api.test.js — Jest + Supertest API Tests

const request = require('supertest');
const app = require('../server');

describe('Smart Habit Tracker API', () => {

  // ===== HEALTH =====
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('smart-habit-tracker-api');
    });
  });

  // ===== HABITS =====
  let createdHabitId;

  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const res = await request(app).post('/api/habits').send({
        name: 'Morning Run',
        category: 'health',
        frequency: 'daily',
        target: 30,
        color: '#FF6B6B',
        userId: 'test-user',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Morning Run');
      expect(res.body.data.id).toBeDefined();
      createdHabitId = res.body.data.id;
    });

    it('should fail without name', async () => {
      const res = await request(app).post('/api/habits').send({ category: 'health' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/habits', () => {
    it('should return list of habits', async () => {
      const res = await request(app).get('/api/habits');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter habits by userId', async () => {
      const res = await request(app).get('/api/habits?userId=test-user');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(h => h.userId === 'test-user')).toBe(true);
    });
  });

  describe('GET /api/habits/:id', () => {
    it('should return single habit', async () => {
      const res = await request(app).get(`/api/habits/${createdHabitId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(createdHabitId);
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app).get('/api/habits/nonexistent-id');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/habits/:id', () => {
    it('should update a habit', async () => {
      const res = await request(app)
        .patch(`/api/habits/${createdHabitId}`)
        .send({ streak: 5, name: 'Evening Run' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.streak).toBe(5);
      expect(res.body.data.name).toBe('Evening Run');
    });
  });

  // ===== LOGS =====
  describe('POST /api/logs/:habitId/toggle', () => {
    it('should toggle log for a date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .post(`/api/logs/${createdHabitId}/toggle`)
        .send({ date: today });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('should fail without date', async () => {
      const res = await request(app)
        .post(`/api/logs/${createdHabitId}/toggle`)
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/logs/:habitId', () => {
    it('should return logs for a habit', async () => {
      const res = await request(app).get(`/api/logs/${createdHabitId}`);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body.data).toBe('object');
    });
  });

  // ===== STATS =====
  describe('GET /api/stats', () => {
    it('should return stats', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('totalHabits');
      expect(res.body.data).toHaveProperty('maxStreak');
      expect(res.body.data).toHaveProperty('totalXP');
    });
  });

  // ===== DELETE =====
  describe('DELETE /api/habits/:id', () => {
    it('should delete a habit', async () => {
      const res = await request(app).delete(`/api/habits/${createdHabitId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app).get(`/api/habits/${createdHabitId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // ===== 404 =====
  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.statusCode).toBe(404);
    });
  });
});
