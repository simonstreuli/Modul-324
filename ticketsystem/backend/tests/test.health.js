const request = require('supertest');
const app = require('../index');

jest.mock('../swagger.json', () => ({}), { virtual: true });

describe('Health Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });
});
