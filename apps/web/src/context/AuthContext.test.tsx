import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('should initialize with null user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should login and store user data', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const user = { id: '1', email: 'test@example.com' };
    const token = 'fake-token';

    act(() => {
      result.current.login(token, user);
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe(token);
    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  it('should logout and clear user data', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should load user from localStorage on init', () => {
    const user = { id: '1', email: 'test@example.com' };
    const token = 'fake-token';
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe(token);
  });
});
