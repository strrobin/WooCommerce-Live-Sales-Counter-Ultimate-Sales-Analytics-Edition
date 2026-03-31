import { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { StatsPreview } from './components/StatsPreview';
import { NotificationToast } from './components/NotificationToast';
import { DEFAULT_CONFIG, SHORTCODE } from './constants';
import { PluginConfig } from './types';
import { Eye, Settings, ExternalLink } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  // Initialize from WordPress data if available
  const initialConfig = (() => {
    const savedSettings = (window as any).wrosData?.settings;
    if (!savedSettings || typeof savedSettings !== 'object' || Array.isArray(savedSettings)) {
      return DEFAULT_CONFIG;
    }

    // Deep merge or at least ensure top-level keys exist and are objects where expected
    const merged = { ...DEFAULT_CONFIG };
    
    (Object.keys(DEFAULT_CONFIG) as Array<keyof PluginConfig>).forEach(key => {
      if (savedSettings[key] !== undefined) {
        // If it's an object in DEFAULT_CONFIG, ensure it's an object in savedSettings
        if (typeof (DEFAULT_CONFIG as any)[key] === 'object' && (DEFAULT_CONFIG as any)[key] !== null) {
          if (typeof savedSettings[key] === 'object' && savedSettings[key] !== null && !Array.isArray(savedSettings[key])) {
            (merged as any)[key] = { ...(DEFAULT_CONFIG as any)[key], ...savedSettings[key] };
          }
        } else {
          (merged as any)[key] = savedSettings[key];
        }
      }
    });

    return merged as PluginConfig;
  })();

  const [config, setConfig] = useState<PluginConfig>(initialConfig);
  const [view, setView] = useState<'admin' | 'preview'>('admin');

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* View Toggle */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex bg-white/80 backdrop-blur-md p-1 rounded-full shadow-2xl border border-gray-200">
        <button 
          onClick={() => setView('admin')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all",
            view === 'admin' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Settings className="w-4 h-4" /> Admin Panel
        </button>
        <button 
          onClick={() => setView('preview')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all",
            view === 'preview' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Eye className="w-4 h-4" /> Live Preview
        </button>
      </div>

      {view === 'admin' ? (
        <AdminDashboard config={config} setConfig={setConfig} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center p-12 bg-gray-50 pattern-grid">
          <div className="max-w-6xl w-full">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 relative overflow-hidden group">
              {/* Shortcode Label Indicator */}
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                Shortcode Output Preview
              </div>
              
              <div className="wros-container">
                <StatsPreview config={config} />
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400 font-medium">
                This is exactly how <code className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">{SHORTCODE}</code> will appear on your site.
              </p>
            </div>
          </div>
          
          {/* Notification simulation */}
          <NotificationToast config={config} />
        </div>
      )}

      {/* Global Styles for the pattern background */}
      <style>{`
        .pattern-grid {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
