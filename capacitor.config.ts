import type { CapacitorConfig } from '@capacitor/cli';

const API_URL = process.env.VITE_API_URL || 'https://api.sonesaye.com';

const config: CapacitorConfig = {
  appId: 'com.amawpyay.waterdash',
  appName: 'အမောပြေ',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'api.sonesaye.com',
      'sonesaye.com',
      '*.sonesaye.com',
      'waterdash-95vzqj2j.manus.space',
      '*.manus.space',
      'localhost',
      '127.0.0.1',
      '*'
    ],
    cleartext: ['localhost', '127.0.0.1']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

// Log API URL for debugging
console.log('[Capacitor] API URL:', API_URL);
console.log('[Capacitor] Config:', config);

export default config;
