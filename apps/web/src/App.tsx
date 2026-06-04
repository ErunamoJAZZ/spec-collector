import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SpecsPage from './pages/SpecsPage';
import ChangePinPage from './pages/ChangePinPage';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen transition-colors duration-200 bg-[var(--background)] text-[var(--foreground)]">
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
