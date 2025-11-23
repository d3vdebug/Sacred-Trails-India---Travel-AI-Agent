export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // for LiveKit Cloud Sandbox
  sandboxId?: string;
  agentName?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Codecafe',
  pageTitle: 'AI Barista at Codecafe',
  pageDescription: 'Order coffee with our AI barista',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#8B4513',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#D2691E',
  startButtonText: 'Order Coffee',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};
