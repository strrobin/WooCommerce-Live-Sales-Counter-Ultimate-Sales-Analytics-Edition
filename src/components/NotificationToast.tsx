import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X } from 'lucide-react';
import { PluginConfig } from '../types';
import { cn } from '../lib/utils';

interface NotificationToastProps {
  config: PluginConfig;
}

const LOCATIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'London', 'New York', 'Dubai'];
const NAMES = ['Sifat', 'Robin', 'Karim', 'Rahim', 'John', 'Sarah', 'Emma', 'Ali'];

export const NotificationToast: React.FC<NotificationToastProps> = ({ config }) => {
  const [show, setShow] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({ name: '', location: '' });

  useEffect(() => {
    if (!config.notifications.enabled) {
      setShow(false);
      return;
    }

    const trigger = () => {
      // Simulate fetching most recent customer from "database"
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      
      setCurrentOrder({ name, location });
      setShow(true);
      setTimeout(() => setShow(false), 4000);
    };

    const timer = setInterval(trigger, config.notifications.interval);
    return () => clearInterval(timer);
  }, [config.notifications.enabled, config.notifications.interval]);

  const getPositionClasses = () => {
    switch (config.notifications.position) {
      case 'bottom-left': return 'bottom-8 left-8';
      case 'bottom-right': return 'bottom-8 right-8';
      case 'top-left': return 'top-8 left-8';
      case 'top-right': return 'top-8 right-8';
      default: return 'bottom-8 left-8';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={cn(
            "fixed z-50 flex items-center gap-4 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 max-w-sm",
            getPositionClasses()
          )}
        >
          <div className="bg-indigo-500 p-3 rounded-full text-white">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {currentOrder.name} from <span className="text-indigo-600">{currentOrder.location}</span>
            </p>
            <p className="text-xs text-gray-500">just ordered a product!</p>
          </div>
          <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
