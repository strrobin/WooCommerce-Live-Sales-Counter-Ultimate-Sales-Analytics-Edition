import { PluginConfig } from "./types";

export const DEFAULT_CONFIG: PluginConfig = {
  template: 'style-1',
  mode: 'analytics',
  enabledStatuses: {
    pending: true,
    processing: true,
    completed: true,
    onHold: true,
  },
  demoStats: {
    pending: '15',
    processing: '42',
    completed: '5,000+',
    onHold: '8',
  },
  notifications: {
    enabled: true,
    position: 'bottom-right',
    interval: 5000,
    fakeOrders: true,
  },
  responsive: {
    desktop: { 
      columns: 4, 
      fontSize: 24, 
      fontFamily: 'Inter', 
      fontWeight: '700', 
      lineHeight: 1.2, 
      letterSpacing: 0, 
      padding: 20, 
      margin: 10, 
      gap: 20,
      iconSize: 40,
      iconColor: '#6366f1',
      iconBgEnabled: true,
      iconBgShape: 'circle'
    },
    tablet: { 
      columns: 2, 
      fontSize: 20, 
      fontFamily: 'Inter', 
      fontWeight: '600', 
      lineHeight: 1.2, 
      letterSpacing: 0, 
      padding: 15, 
      margin: 8, 
      gap: 15,
      iconSize: 30,
      iconColor: '#6366f1',
      iconBgEnabled: true,
      iconBgShape: 'circle'
    },
    mobile: { 
      columns: 1, 
      fontSize: 18, 
      fontFamily: 'Inter', 
      fontWeight: '600', 
      lineHeight: 1.2, 
      letterSpacing: 0, 
      padding: 10, 
      margin: 5, 
      gap: 10,
      iconSize: 25,
      iconColor: '#6366f1',
      iconBgEnabled: true,
      iconBgShape: 'circle'
    },
  },
  colors: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    text: '#111827',
    background: '#ffffff',
  },
  customCss: '',
};

export const SHORTCODE = '[woo_rara_stats]';

export const GOOGLE_FONTS = [
  "System Default", "Roboto", "Montserrat", "Open Sans", "Lato", "Poppins", "Playfair Display", "Oswald", "Raleway", "Ubuntu",
  "Merriweather", "Noto Sans", "PT Sans", "Roboto Condensed", "Source Sans Pro", "Lora", "Quicksand", "Nunito", "Bebas Neue", "Arimo",
  "Titillium Web", "Muli", "Work Sans", "Inconsolata", "Fira Sans", "PT Serif", "Dosis", "Oxygen", "Kanit", "Libre Baskerville",
  "Mukta", "Varela Round", "Bitter", "Anton", "Josefin Sans", "Cabin", "Lobster", "Pacifico", "Abel", "Exo 2",
  "Crimson Text", "Hind", "Archivo Narrow", "Arvo", "Dancing Script", "Asap", "Fjalla One", "Prompt", "Comfortaa", "EB Garamond",
  "Signika", "Questrial", "Overpass", "Teko", "Barlow", "Maven Pro", "Catamaran", "Domine", "Bree Serif", "Zilla Slab",
  "Caveat", "Shadows Into Light", "Indie Flower", "Abril Fatface", "Patua One", "Righteous", "Fredoka One", "Amatic SC", "Courgette", "Kaushan Script",
  "Gloria Hallelujah", "Permanent Marker", "Satisfy", "Cookie", "Great Vibes", "Sacramento", "Yellowtail", "Tangerine", "Allura", "Pinyon Script",
  "Cinzel", "Cardo", "Old Standard TT", "Forum", "Prata", "Cormorant Garamond", "Libre Franklin", "Spectral", "Karla", "Space Grotesk",
  "Outfit", "Lexend", "Manrope", "Public Sans", "Sora", "Plus Jakarta Sans", "Urbanist", "Figtree", "Bricolage Grotesque", "Inter"
];

export const TEMPLATES = Array.from({ length: 100 }, (_, i) => ({
  id: `style-${i + 1}`,
  name: `Style ${i + 1}`,
  description: `Unique design variation ${i + 1}`
}));
