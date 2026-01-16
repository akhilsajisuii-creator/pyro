
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  EMERGENCY = 'EMERGENCY'
}

export enum DetectionStatus {
  SAFE = 'SAFE',
  DETECTED = 'DETECTED',
  PROCESSING = 'PROCESSING'
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  type: 'Fire' | 'Gas';
  status: DetectionStatus;
  location: string;
  details?: string;
  value?: string | number;
}

export interface Alert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  type: 'Fire' | 'Gas';
  emailSentTo?: string;
  phoneSentTo?: string;
  delivered: boolean;
}

export interface GasReading {
  time: string;
  value: number;
}

export interface NotificationSettings {
  email: string;
  phone: string;
  enabled: boolean;
}
