import React, { useState } from 'react';
import { 
  Settings, 
  Layout, 
  Bell, 
  Smartphone, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone as Phone,
  Eye,
  BarChart3,
  Database,
  TrendingUp,
  ShieldCheck,
  Palette,
  Circle,
  Square,
  Search
} from 'lucide-react';
import { PluginConfig, TemplateStyle } from '../types';
import { TEMPLATES, SHORTCODE, GOOGLE_FONTS } from '../constants';
import { cn } from '../lib/utils';
import { StatsPreview } from './StatsPreview';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AdminDashboardProps {
  config: PluginConfig;
  setConfig: React.Dispatch<React.SetStateAction<PluginConfig>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, setConfig }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'general' | 'templates' | 'notifications' | 'responsive' | 'custom'>('analytics');
  const [deviceTab, setDeviceTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = async () => {
    setIsSaving(true);
    const wrosData = (window as any).wrosData;
    if (!wrosData) {
      alert('WordPress data not found. Are you in the WordPress admin?');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`${wrosData.apiUrl}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wrosData.nonce,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFonts = GOOGLE_FONTS.filter(font => 
    font.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const copyShortcode = () => {
    navigator.clipboard.writeText(SHORTCODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">WROS Dashboard</h1>
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                Premium
              </span>
            </div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest opacity-80">WooCommerce Real-time Order Stats</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <code className="text-indigo-700 font-mono text-sm">{SHORTCODE}</code>
            <button 
              onClick={copyShortcode}
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'analytics' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <TrendingUp className="w-5 h-5" /> Analytics Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'general' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Settings className="w-5 h-5" /> General Settings
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'templates' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Layout className="w-5 h-5" /> Visual Templates
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'notifications' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Bell className="w-5 h-5" /> Social Proof Popup
          </button>
          <button 
            onClick={() => setActiveTab('responsive')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'responsive' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Smartphone className="w-5 h-5" /> Responsive Controls
          </button>
          <button 
            onClick={() => setActiveTab('custom')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'custom' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Code className="w-5 h-5" /> Custom CSS
          </button>

          <div className="mt-auto space-y-4">
            <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
              <ShieldCheck className="w-4 h-4" /> Download Plugin .zip
            </button>
            
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-black mb-2">Lead Developed By</p>
              <a 
                href="https://strrobin.shop/portfolio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-black text-gray-900 hover:text-indigo-600 transition-colors group"
              >
                STR ROBIN <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            
            {activeTab === 'general' && (
              <div className="space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" /> Data Mode
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateConfig('mode', 'analytics')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        config.mode === 'analytics' ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <BarChart3 className={cn("w-8 h-8 mb-4", config.mode === 'analytics' ? "text-indigo-600" : "text-gray-400")} />
                      <h3 className="font-bold">Analytics Mode</h3>
                      <p className="text-sm text-gray-500">Fetch real data from the last 7 days using wc_orders_count().</p>
                    </button>
                    <button 
                      onClick={() => updateConfig('mode', 'demo')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        config.mode === 'demo' ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <Eye className={cn("w-8 h-8 mb-4", config.mode === 'demo' ? "text-indigo-600" : "text-gray-400")} />
                      <h3 className="font-bold">Demo Mode</h3>
                      <p className="text-sm text-gray-500">Input custom manual numbers to build trust in new stores.</p>
                    </button>
                  </div>

                    <div className="mt-8 space-y-6">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Enabled Statuses</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(config.enabledStatuses).map(([key, enabled]) => (
                            <label key={key} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-indigo-200 transition-all">
                              <span className="text-sm font-medium capitalize">{key}</span>
                              <input 
                                type="checkbox" 
                                checked={enabled}
                                onChange={(e) => updateConfig(`enabledStatuses.${key}`, e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Color Palette</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={config.colors.primary}
                                onChange={(e) => updateConfig('colors.primary', e.target.value)}
                                className="w-10 h-10 rounded-lg border-none cursor-pointer"
                              />
                              <input 
                                type="text" 
                                value={config.colors.primary}
                                onChange={(e) => updateConfig('colors.primary', e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Text Color</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={config.colors.text}
                                onChange={(e) => updateConfig('colors.text', e.target.value)}
                                className="w-10 h-10 rounded-lg border-none cursor-pointer"
                              />
                              <input 
                                type="text" 
                                value={config.colors.text}
                                onChange={(e) => updateConfig('colors.text', e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {config.mode === 'demo' && (
                        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <h3 className="col-span-2 text-sm font-bold text-gray-700">Manual Stat Overrides</h3>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pending</label>
                            <input 
                              type="text" 
                              value={config.demoStats.pending}
                              onChange={(e) => updateConfig('demoStats.pending', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Processing</label>
                            <input 
                              type="text" 
                              value={config.demoStats.processing}
                              onChange={(e) => updateConfig('demoStats.processing', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Completed</label>
                            <input 
                              type="text" 
                              value={config.demoStats.completed}
                              onChange={(e) => updateConfig('demoStats.completed', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">On-hold</label>
                            <input 
                              type="text" 
                              value={config.demoStats.onHold}
                              onChange={(e) => updateConfig('demoStats.onHold', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                </section>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Visual Template Selector (100 Styles)</h2>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                      {config.template.toUpperCase()} Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                    {TEMPLATES.map((tmpl) => (
                      <button 
                        key={tmpl.id}
                        onClick={() => updateConfig('template', tmpl.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2",
                          config.template === tmpl.id ? "border-indigo-500 bg-indigo-50" : "border-gray-50 hover:border-gray-200 bg-white"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg shrink-0 flex items-center justify-center",
                          config.template === tmpl.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          <span className="text-[10px] font-black">{tmpl.id.split('-')[1]}</span>
                        </div>
                        <h3 className="font-bold text-[10px] truncate w-full">{tmpl.name}</h3>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-lg font-bold">Live Notification Popup</h2>
                      <p className="text-sm text-gray-500">Trigger real-time or fake order toasts for social proof.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.notifications.enabled}
                        onChange={(e) => updateConfig('notifications.enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-4">Popup Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                          <button 
                            key={pos}
                            onClick={() => updateConfig('notifications.position', pos)}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-xs font-medium transition-all",
                              config.notifications.position === pos ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                            )}
                          >
                            {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-4">Interval (ms)</label>
                      <input 
                        type="number" 
                        step="1000"
                        min="2000"
                        value={config.notifications.interval}
                        onChange={(e) => updateConfig('notifications.interval', parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'responsive' && (
              <div className="space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Responsive Controls</h2>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                        <button
                          key={device}
                          onClick={() => setDeviceTab(device)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                            deviceTab === device ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          {device === 'desktop' && <Monitor className="w-3 h-3" />}
                          {device === 'tablet' && <Tablet className="w-3 h-3" />}
                          {device === 'mobile' && <Phone className="w-3 h-3" />}
                          {device.charAt(0).toUpperCase() + device.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2 capitalize">
                        {deviceTab} Typography
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font Family</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                              <Search className="w-3 h-3 text-gray-400" />
                            </div>
                            <input 
                              type="text"
                              placeholder="Search fonts..."
                              value={fontSearch}
                              onChange={(e) => setFontSearch(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 rounded-t-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <select 
                              value={(config.responsive as any)[deviceTab].fontFamily}
                              onChange={(e) => {
                                updateConfig(`responsive.${deviceTab}.fontFamily`, e.target.value);
                                setFontSearch('');
                              }}
                              className="w-full px-4 py-2 rounded-b-lg border-x border-b border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none max-h-40"
                              size={5}
                            >
                              {filteredFonts.map(font => (
                                <option key={font} value={font === 'System Default' ? 'system-ui' : font}>
                                  {font}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font Weight</label>
                          <select 
                            value={(config.responsive as any)[deviceTab].fontWeight}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.fontWeight`, e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm"
                          >
                            <option value="400">Normal (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semi-Bold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="900">Black (900)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font Size (px): {(config.responsive as any)[deviceTab].fontSize}</label>
                          <input 
                            type="range" 
                            min="12" 
                            max="80"
                            value={(config.responsive as any)[deviceTab].fontSize}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.fontSize`, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Line Height: {(config.responsive as any)[deviceTab].lineHeight}</label>
                          <input 
                            type="range" 
                            min="0.8" 
                            max="2" 
                            step="0.1"
                            value={(config.responsive as any)[deviceTab].lineHeight}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.lineHeight`, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Letter Spacing (px): {(config.responsive as any)[deviceTab].letterSpacing}</label>
                          <input 
                            type="range" 
                            min="-5" 
                            max="10" 
                            step="0.5"
                            value={(config.responsive as any)[deviceTab].letterSpacing}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.letterSpacing`, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2 capitalize">
                        <Palette className="w-4 h-4 text-indigo-500" /> {deviceTab} Icon Styling
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Icon Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={(config.responsive as any)[deviceTab].iconColor}
                              onChange={(e) => updateConfig(`responsive.${deviceTab}.iconColor`, e.target.value)}
                              className="w-10 h-10 rounded-lg border-none cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={(config.responsive as any)[deviceTab].iconColor}
                              onChange={(e) => updateConfig(`responsive.${deviceTab}.iconColor`, e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Icon Size (px): {(config.responsive as any)[deviceTab].iconSize}</label>
                          <input 
                            type="range" 
                            min="15" 
                            max="60"
                            value={(config.responsive as any)[deviceTab].iconSize}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.iconSize`, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                          <div>
                            <h4 className="text-sm font-bold text-gray-700">Icon Background</h4>
                            <p className="text-xs text-gray-400">Enable a background shape behind the icon</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={(config.responsive as any)[deviceTab].iconBgEnabled}
                              onChange={(e) => updateConfig(`responsive.${deviceTab}.iconBgEnabled`, e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                        {(config.responsive as any)[deviceTab].iconBgEnabled && (
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Background Shape</label>
                            <div className="flex gap-4">
                              <button 
                                onClick={() => updateConfig(`responsive.${deviceTab}.iconBgShape`, 'circle')}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                                  (config.responsive as any)[deviceTab].iconBgShape === 'circle' ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400"
                                )}
                              >
                                <Circle className="w-4 h-4" /> Circle
                              </button>
                              <button 
                                onClick={() => updateConfig(`responsive.${deviceTab}.iconBgShape`, 'square')}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                                  (config.responsive as any)[deviceTab].iconBgShape === 'square' ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400"
                                )}
                              >
                                <Square className="w-4 h-4" /> Square
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2 capitalize">
                        {deviceTab} Layout & Spacing
                      </h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Grid Columns</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="6"
                            value={(config.responsive as any)[deviceTab].columns}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.columns`, parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Padding (px)</label>
                          <input 
                            type="number" 
                            value={(config.responsive as any)[deviceTab].padding}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.padding`, parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gap (px)</label>
                          <input 
                            type="number" 
                            value={(config.responsive as any)[deviceTab].gap}
                            onChange={(e) => updateConfig(`responsive.${deviceTab}.gap`, parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual Preview for the selected device */}
                    <div className="bg-indigo-900 rounded-3xl shadow-2xl overflow-hidden border border-indigo-800/50">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-800/50 bg-indigo-950/50">
                        <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Eye className="w-3 h-3" /> {deviceTab} Live Preview
                        </h3>
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                        </div>
                      </div>
                      <div className="h-[500px] w-full bg-white overflow-y-auto scrollbar-hide flex items-start justify-center">
                        <div className={cn(
                          "transition-all duration-500 ease-in-out h-full",
                          deviceTab === 'desktop' ? "w-full" : deviceTab === 'tablet' ? "w-[768px] max-w-full border-x border-gray-100 shadow-2xl" : "w-[375px] max-w-full border-x border-gray-100 shadow-2xl"
                        )}>
                          <StatsPreview config={config} forcedDevice={deviceTab} />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-4">Custom CSS</h2>
                  <p className="text-sm text-gray-500 mb-6">Add advanced styling to your stats display. Use <code>.wros-container</code> as the root.</p>
                  <textarea 
                    value={config.customCss}
                    onChange={(e) => updateConfig('customCss', e.target.value)}
                    placeholder=".wros-container { ... }"
                    className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-emerald-400 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
