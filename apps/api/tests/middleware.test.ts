import { describe, it, expect, vi } from 'vitest';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../src/middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

describe('Auth Middleware', () => {
  it('should return 401 if no authorization header is present', () => {
    const req = { headers: {} } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is not Bearer', () => {
    const req = { headers: { authorization: 'Basic token' } } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set req.user if token is valid', () => {
    const user = { id: 'user123', email: 'test@example.com' };
    const token = jwt.sign(user, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(user);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});
