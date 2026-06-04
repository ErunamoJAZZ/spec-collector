import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { supabase } from '../src/supabase.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Mock supabase
vi.mock('../src/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
    }))
  }
}));

describe('Specs API', () => {
  const user = { id: 'user123', email: 'test@example.com' };
  const token = jwt.sign(user, JWT_SECRET);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    const res = await request(app).get('/api/specs/me');
    expect(res.status).toBe(401);
  });

  it('should return 200 and spec data if authorized', async () => {
    const mockSpec = { 
      project_name: 'Test Project', 
      spec_content: 'Test Content', 
      execution_plan: 'Test Plan' 
    };

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockSpec, error: null }),
    }));

    const res = await request(app)
      .get('/api/specs/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSpec);
  });

  it('should return default spec structure if no spec found', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }));

    const res = await request(app)
      .get('/api/specs/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.project_name).toBe('');
  });

  it('should update spec data', async () => {
    const updateData = { 
      project_name: 'Updated Project', 
      spec_content: 'Updated Content', 
      execution_plan: 'Updated Plan' 
    };

    (supabase.from as any).mockImplementation(() => ({
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updateData, error: null }),
    }));

    const res = await request(app)
      .put('/api/specs/me')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updateData);
  });
});
