import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { supabase } from '../src/supabase.js';
import bcrypt from 'bcryptjs';

// Mock supabase
vi.mock('../src/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      insert: vi.fn().mockReturnThis(),
    }))
  }
}));

describe('Auth API', () => {
  it('should return 400 if email or pin is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
  });

  it('should return 400 if pin is not 4 digits', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', pin: '123' });
    expect(res.status).toBe(400);
  });
  
  // NOTE: More comprehensive tests would involve mocking supabase responses properly,
  // but this basic setup verifies the endpoint exists and validates input.
});
