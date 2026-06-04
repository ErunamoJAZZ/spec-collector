import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../lib/api';

export default function ChangePinPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }
    
    if (!/^\d{4}$/.test(oldPin) || !/^\d{4}$/.test(newPin)) {
      setError('PINs must be exactly 4 digits');
      return;
    }

    try {
      setLoading(true);
      await api.put('/auth/change-pin', { oldPin, newPin });
      alert('PIN successfully changed. Please log in again.');
      logout();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (val: string, setter: (v: string) => void) => {
    if (val.length <= 4 && /^\d*$/.test(val)) {
      setter(val);
      if (error) setError('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto py-10 px-4">
      <button 
        onClick={() => navigate('/app')}
        className="flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors w-fit"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to App
      </button>

      <h1 className="text-2xl font-bold mb-6">Change PIN</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-md p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Old 4-digit PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={oldPin}
            onChange={(e) => handlePinInput(e.target.value, setOldPin)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 outline-none"
            placeholder="Enter old PIN"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New 4-digit PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={newPin}
            onChange={(e) => handlePinInput(e.target.value, setNewPin)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 outline-none"
            placeholder="Enter new PIN"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm new PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={confirmPin}
            onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 outline-none"
            placeholder="Confirm new PIN"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || newPin.length !== 4 || confirmPin.length !== 4 || oldPin.length !== 4}
          className="w-full flex items-center justify-center px-4 py-2 mt-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={16} className="mr-2" />
          {loading ? 'Saving...' : 'Update PIN'}
        </button>
      </form>
    </div>
  );
}