import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';
import React from 'react';

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should provide default theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should change theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should throw error when used outside of ThemeProvider', () => {
    // Suppress console.error for this test as it's expected
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });
});
