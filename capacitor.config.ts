import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mybunnytime.app',
  appName: 'My Bunny Time',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#f0f9ff'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#f0f9ff'
  },
  plugins: {
    Unity: {
      unityProjectPath: "../My Bunny Time" 
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#f0f9ff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#8b5cf6'
    },
    Keyboard: {
      resize: 'body',
      style: 'light',
      resizeOnFullScreen: true
    }
  }
};

export default config;
