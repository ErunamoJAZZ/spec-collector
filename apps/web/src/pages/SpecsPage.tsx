import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Clock, LogOut, Save, Settings, KeyRound, ChevronDown } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Modal from '../components/Modal';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export default function SpecsPage() {
  const { user, token, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [projectName, setProjectName] = useState('');
  const [specContent, setSpecContent] = useState('');
  const [executionPlan, setExecutionPlan] = useState('');
  
  const [originalData, setOriginalData] = useState({
    projectName: '',
    specContent: '',
    executionPlan: ''
  });
  
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showOptions, setShowOptions] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'logout' | 'change-pin' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/specs/me');
      const data = {
        projectName: res.data.project_name || '',
        specContent: res.data.spec_content || '',
        executionPlan: res.data.execution_plan || ''
      };
      setProjectName(data.projectName);
      setSpecContent(data.specContent);
      setExecutionPlan(data.executionPlan);
      setOriginalData(data);
    } catch (err) {
      console.error('Failed to load specs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update time left
  useEffect(() => {
    if (!token) return;
    
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return;
    
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;
      
      if (remaining <= 0) {
        logout();
        return;
      }
      
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [token, logout]);

  const hasChanges = 
    projectName !== originalData.projectName ||
    specContent !== originalData.specContent ||
    executionPlan !== originalData.executionPlan;

  // Prevent closing tab if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = ''; // Standard way to trigger browser warning
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    
    try {
      setSaving(true);
      await api.put('/specs/me', {
        project_name: projectName,
        spec_content: specContent,
        execution_plan: executionPlan
      });
      
      setOriginalData({
        projectName,
        specContent,
        executionPlan
      });
      
      // If there was a pending action after save, execute it
      if (pendingAction === 'logout') {
        logout();
      } else if (pendingAction === 'change-pin') {
        navigate('/app/change-pin');
      }
      setPendingAction(null);
      setShowUnsavedModal(false);
      
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = (action: 'logout' | 'change-pin') => {
    setShowOptions(false);
    if (hasChanges) {
      setPendingAction(action);
      setShowUnsavedModal(true);
    } else {
      if (action === 'logout') logout();
      if (action === 'change-pin') navigate('/app/change-pin');
    }
  };

  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    handleSave();
  }, { enableOnFormTags: true }, [hasChanges, projectName, specContent, executionPlan]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Spec Collector</h1>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
        
        <div className="flex items-center space-x-6 mr-10 relative">
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            {timeLeft} left
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Settings size={16} className="mr-1" />
              Options
              <ChevronDown size={14} className="ml-1" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#18181b] border border-[var(--border)] z-10 py-1">
                <button
                  onClick={() => handleAction('change-pin')}
                  className="w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <KeyRound size={14} className="mr-2" />
                  Change PIN
                </button>
                <div className="h-px bg-[var(--border)] my-1"></div>
                <button
                  onClick={() => handleAction('logout')}
                  className="w-full text-left px-4 py-2 text-sm flex items-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={14} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              maxLength={50}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 outline-none"
              placeholder="e.g. Acme Web App"
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              hasChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800'
            }`}
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div data-color-mode={theme}>
          <label className="block text-sm font-medium mb-1">Specification</label>
          <MDEditor
            value={specContent}
            onChange={(val) => setSpecContent(val || '')}
            height={400}
            className="border border-[var(--border)]"
          />
        </div>
        
        <div data-color-mode={theme}>
          <label className="block text-sm font-medium mb-1">Execution Plan</label>
          <MDEditor
            value={executionPlan}
            onChange={(val) => setExecutionPlan(val || '')}
            height={300}
            className="border border-[var(--border)]"
            textareaProps={{
              placeholder: "Describe the execution plan here..."
            }}
          />
        </div>
      </main>

      <Modal 
        isOpen={showUnsavedModal} 
        onClose={() => setShowUnsavedModal(false)}
        title="Unsaved Changes"
      >
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          You have unsaved changes. Do you want to save them before leaving? If you discard them, your changes will be lost forever.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowUnsavedModal(false);
              setPendingAction(null);
            }}
            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowUnsavedModal(false);
              if (pendingAction === 'logout') logout();
              if (pendingAction === 'change-pin') navigate('/app/change-pin');
              setPendingAction(null);
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
