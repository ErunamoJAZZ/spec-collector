import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('should render login form', () => {
    renderLoginPage();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4-Digit PIN/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should show error for invalid email', async () => {
    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/4-Digit PIN/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });

  it('should show error for invalid PIN', async () => {
    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/4-Digit PIN/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText('PIN must be exactly 4 digits')).toBeInTheDocument();
  });

  it('should call api.post and login on success', async () => {
    (api.post as any).mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { id: '1', email: 'test@example.com' },
      },
    });

    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/4-Digit PIN/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        pin: '1234',
      });
    });
  });
});
