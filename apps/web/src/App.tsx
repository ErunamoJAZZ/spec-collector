import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SpecsPage from './pages/SpecsPage';
import ChangePinPage from './pages/ChangePinPage';
import { ThemeProvider } from './context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen transition-colors duration-200 bg-[var(--background)] text-[var(--foreground)]">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <SpecsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/change-pin"
            element={
              <ProtectedRoute>
                <ChangePinPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
