import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import './api';

vi.mock('axios', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    default: {
      ...actual.default,
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        defaults: { headers: { common: {} } }
      }),
    },
  };
});

describe('API Library', () => {
  it('should create an axios instance', () => {
    expect(axios.create).toHaveBeenCalled();
  });

  it('should have a base URL', () => {
    // This depends on how it's mocked, but we can check if it was called with something
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: expect.any(String)
    }));
  });
});
