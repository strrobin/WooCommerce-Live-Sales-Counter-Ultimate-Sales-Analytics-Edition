export type TemplateStyle = 
  | 'clean' 
  | 'card' 
  | 'animated' 
  | 'glassmorphism' 
  | 'neon' 
  | 'brutalist' 
  | 'luxury' 
  | 'minimalist' 
  | 'corporate' 
  | 'playful';

export interface ResponsiveSettings {
  columns: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  padding: number;
  margin: number;
  gap: number;
  iconSize: number;
  iconColor: string;
  iconBgEnabled: boolean;
  iconBgShape: 'circle' | 'square';
}

export interface PluginConfig {
  template: string;
  mode: 'analytics' | 'demo';
  enabledStatuses: {
    pending: boolean;
    processing: boolean;
    completed: boolean;
    onHold: boolean;
  };
  demoStats: {
    pending: string;
    processing: string;
    completed: string;
    onHold: string;
  };
  notifications: {
    enabled: boolean;
    position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    interval: number;
    fakeOrders: boolean;
  };
  responsive: {
    desktop: ResponsiveSettings;
    tablet: ResponsiveSettings;
    mobile: ResponsiveSettings;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  customCss: string;
}

export interface OrderStat {
  label: string;
  value: number;
  status: string;
}
