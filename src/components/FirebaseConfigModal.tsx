import React, { useState } from 'react';
import { X, Database, Save, RotateCcw } from 'lucide-react';
import { getStoredFirebaseConfig, saveFirebaseConfig, resetFirebaseConfig } from '../lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const current = getStoredFirebaseConfig();

  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [authDomain, setAuthDomain] = useState(current.authDomain || '');
  const [databaseURL, setDatabaseURL] = useState(current.databaseURL || '');
  const [projectId, setProjectId] = useState(current.projectId || '');
  const [storageBucket, setStorageBucket] = useState(current.storageBucket || '');
  const [appId, setAppId] = useState(current.appId || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: '100000000000',
      appId: appId.trim(),
    });
  };

  const handleReset = () => {
    resetFirebaseConfig();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#6675E8]" />
            <h3 className="font-extrabold text-base text-[#14213D]">Firebase Configuration</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Paste your Firebase web project credentials below to connect your application directly to your live Firebase Authentication and Realtime Database.
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              API Key (apiKey)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[#14213D] focus:outline-none focus:border-[#6675E8]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Database URL (databaseURL)
            </label>
            <input
              type="text"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              placeholder="https://your-app-rtdb.firebaseio.com"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[#14213D] focus:outline-none focus:border-[#6675E8]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Auth Domain (authDomain)
            </label>
            <input
              type="text"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              placeholder="your-app.firebaseapp.com"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[#14213D] focus:outline-none focus:border-[#6675E8]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Project ID (projectId)
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="your-project-id"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[#14213D] focus:outline-none focus:border-[#6675E8]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-[#6675E8] text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Connect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
