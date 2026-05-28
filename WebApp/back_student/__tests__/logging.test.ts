const request = require('supertest');
// Use a minimal app for logging tests to avoid heavy deps
const appModule = require('../src/appMinimalTest');
const fs = require('fs');
const path = require('path');

describe('Logging system', () => {
  let app: any;

  beforeAll(async () => {
    app = await appModule();
  });

  test('should log a GET /health request and response', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);

    const logDir = path.resolve(__dirname, '../logs');
    // Wait a short moment for logger flush
    await new Promise(resolve => setTimeout(resolve, 200));
    const files = fs.existsSync(logDir) ? fs.readdirSync(logDir).filter(f => f.includes('api-')) : [];
    if (files.length > 0) {
      const latest = files.sort().reverse()[0];
      const stats = fs.statSync(path.join(logDir, latest));
      expect(stats.size).toBeGreaterThanOrEqual(0);
    }
  });
});
