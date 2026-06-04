import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpecsPage from './SpecsPage';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('@uiw/react-md-editor', () => ({
  default: vi.fn(({ value, onChange }) => (
    <textarea 
      data-testid="md-editor" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  )),
}));

describe('SpecsPage', () => {
  const mockUser = { id: '1', email: 'test@example.com' };
  const mockToken = 'header.payload.signature'; // dummy token

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
  });

  const renderSpecsPage = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SpecsPage />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('should load and display spec data', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        project_name: 'Test Project',
        spec_content: 'Test Spec',
        execution_plan: 'Test Plan',
      },
    });

    renderSpecsPage();

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    });
  });

  it('should call api.put when saving changes', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        project_name: 'Test Project',
        spec_content: 'Test Spec',
        execution_plan: 'Test Plan',
      },
    });

    renderSpecsPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('Test Project');
    fireEvent.change(input, { target: { value: 'Updated Project' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/specs/me', expect.objectContaining({
        project_name: 'Updated Project',
      }));
    });
  });
});
