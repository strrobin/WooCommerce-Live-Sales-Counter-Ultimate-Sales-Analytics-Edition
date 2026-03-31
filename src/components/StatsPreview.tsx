import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PluginConfig, TemplateStyle } from '../types';
import { cn } from '../lib/utils';

interface StatsPreviewProps {
  config: PluginConfig;
  isSidebar?: boolean;
  forcedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const Counter = ({ value, duration = 2 }: { value: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = (totalMiliseconds / end);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}{suffix}</span>;
};

export const StatsPreview: React.FC<StatsPreviewProps> = ({ config, isSidebar = false, forcedDevice }) => {
  useEffect(() => {
    const fontsToLoad = new Set<string>();
    Object.values(config.responsive).forEach((settings: any) => {
      if (settings.fontFamily && settings.fontFamily !== 'system-ui' && settings.fontFamily !== 'Inter') {
        fontsToLoad.add(settings.fontFamily);
      }
    });

    if (fontsToLoad.size > 0) {
      const linkId = 'google-fonts-preview';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      const fontFamilies = Array.from(fontsToLoad).map(font => font.replace(/\s+/g, '+')).join('|');
      link.href = `https://fonts.googleapis.com/css?family=${fontFamilies}:300,400,500,600,700,900&display=swap`;
    }
  }, [config.responsive]);

  const allStats = [
    { id: 'pending', label: 'Pending', value: config.demoStats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'processing', label: 'Processing', value: config.demoStats.processing, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'completed', label: 'Completed', value: config.demoStats.completed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'onHold', label: 'On-hold', value: config.demoStats.onHold, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const stats = allStats.filter(s => (config.enabledStatuses as any)[s.id]);

  const getTemplateClasses = (style: string) => {
    const index = parseInt(style.split('-')[1]) || 1;
    
    // Base classes for all
    const base = "flex flex-col items-center text-center transition-all duration-300 w-full min-w-0";

    // 1-10: Clean/Minimal
    if (index <= 10) return cn(base, "border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md");
    
    // 11-20: Modern Cards
    if (index <= 20) return cn(base, "bg-white rounded-2xl shadow-xl border-b-4 hover:-translate-y-1");
    
    // 21-30: Gradients
    if (index <= 30) {
      const gradients = [
        'from-indigo-500 to-purple-600',
        'from-emerald-400 to-cyan-500',
        'from-rose-400 to-orange-500',
        'from-blue-600 to-indigo-700',
        'from-amber-400 to-pink-500'
      ];
      return cn(base, "bg-gradient-to-br text-white rounded-2xl shadow-lg", gradients[index % gradients.length]);
    }

    // 31-40: Glassmorphism
    if (index <= 40) return cn(base, "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white shadow-2xl");

    // 41-50: Neon/Dark
    if (index <= 50) return cn(base, "bg-zinc-950 border border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] text-cyan-400");

    // 51-60: Brutalist
    if (index <= 60) return cn(base, "bg-yellow-400 border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black");

    // 61-70: Luxury
    if (index <= 70) return cn(base, "bg-zinc-900 border border-amber-500/30 rounded-full text-amber-200 shadow-inner");

    // 71-80: Soft/Pastel
    if (index <= 80) return cn(base, "bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 text-indigo-900");

    // 81-90: Outlined/Dashed
    if (index <= 90) return cn(base, "border-2 border-dashed border-gray-300 rounded-2xl bg-transparent hover:border-indigo-400");

    // 91-100: Modern Cyber
    return cn(base, "bg-black border-r-4 border-b-4 border-fuchsia-500 rounded-none text-fuchsia-400 skew-x-1");
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateDynamicCss = () => {
    let css = '';
    
    (['desktop', 'tablet', 'mobile'] as const).forEach((key) => {
      const settings = config.responsive[key];
      let query = '';
      
      if (forcedDevice) {
        if (forcedDevice !== key) return;
        query = '.wros-container'; // Apply directly to container in forced mode
      } else {
        if (key === 'desktop') query = '@media (min-width: 1025px)';
        else if (key === 'tablet') query = '@media (min-width: 769px) and (max-width: 1024px)';
        else query = '@media (max-width: 768px)';
      }
      
      const block = `
        .wros-grid {
          grid-template-columns: repeat(${settings.columns}, minmax(0, 1fr)) !important;
          gap: ${settings.gap}px !important;
        }
        .wros-stat-value {
          font-size: ${settings.fontSize}px !important;
          font-family: ${settings.fontFamily} !important;
          font-weight: ${settings.fontWeight} !important;
          line-height: ${settings.lineHeight} !important;
          letter-spacing: ${settings.letterSpacing}px !important;
        }
        .wros-stat-card {
          padding: ${settings.padding}px !important;
          margin: ${settings.margin}px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .wros-icon-wrapper {
          width: ${settings.iconSize * 1.5}px !important;
          height: ${settings.iconSize * 1.5}px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: ${settings.iconColor} !important;
          background: ${settings.iconBgEnabled ? `${settings.iconColor}15` : 'transparent'} !important;
          border-radius: ${settings.iconBgShape === 'circle' ? '50%' : '12px'} !important;
          margin-bottom: 1rem !important;
        }
        .wros-icon-wrapper svg {
          width: ${settings.iconSize}px !important;
          height: ${settings.iconSize}px !important;
        }
      `;

      css += forcedDevice ? block : `${query} { ${block} }`;
    });

    return css;
  };

  return (
    <div className="w-full">
      <style>{`
        .wros-container {
          --wros-primary: ${config.colors.primary};
          --wros-secondary: ${config.colors.secondary};
          --wros-text: ${config.colors.text};
          --wros-bg: ${config.colors.background};
        }
        ${generateDynamicCss()}
        ${config.customCss}
      `}</style>
      <div 
        className="grid w-full wros-grid"
        style={{ 
          color: config.colors.text,
          backgroundColor: config.colors.background
        }}
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(getTemplateClasses(config.template), "wros-stat-card group")}
            style={{ 
              borderColor: config.template.includes('style-2') ? config.colors.primary : undefined
            }}
          >
            <div className="wros-icon-wrapper">
              <stat.icon />
            </div>
            <h3 className={cn("text-sm font-medium uppercase tracking-wider mb-1 opacity-70")}>
              {stat.label}
            </h3>
            <div className="font-bold tracking-tight wros-stat-value">
              <Counter value={stat.value} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
