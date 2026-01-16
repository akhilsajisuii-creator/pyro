import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { DetectionStatus, Alert, AlertSeverity, NotificationSettings } from '../types';
import { historyService } from '../services/historyService';

interface LiveLogEntry {
  id: number;
  time: string;
  status: DetectionStatus;
  labels: string[];
  latency: number;
  frameCount: number;
  details?: string;
}

interface MonitoringContextType {
  // Fire State
  isMonitoring: boolean;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  stream: MediaStream | null;
  latestResult: DetectionStatus;
  detectedLabels: string[];
  frameCount: number;
  avgLatency: number;
  liveLog: LiveLogEntry[];
  lastRawJson: string;
  customUrl: string;
  setCustomUrl: (url: string) => void;
  testSuccess: boolean | null;
  testConnection: () => Promise<void>;
  isScanning: boolean;
  
  // Gas State
  gasStatus: DetectionStatus;
  currentPpm: number;
  toggleGasLeak: () => void;

  // Notification & Alert State
  alerts: Alert[];
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: NotificationSettings) => void;
  clearAlerts: () => void;
  requestNotificationPermission: () => Promise<void>;
  notificationPermission: NotificationPermission;
  triggerManualTest: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

const SETTINGS_KEY = 'pyrowatch_settings';
const ALERTS_KEY = 'pyrowatch_alerts';

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const loadSettings = (): NotificationSettings => {
    const s = localStorage.getItem(SETTINGS_KEY);
    return s ? JSON.parse(s) : { email: '', phone: '', enabled: true };
  };

  const loadAlerts = (): Alert[] => {
    const a = localStorage.getItem(ALERTS_KEY);
    return a ? JSON.parse(a) : [];
  };

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [latestResult, setLatestResult] = useState<DetectionStatus>(DetectionStatus.SAFE);
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [liveLog, setLiveLog] = useState<LiveLogEntry[]>([]);
  const [lastRawJson, setLastRawJson] = useState("");
  const [customUrl, setCustomUrl] = useState('http://localhost:5000/detect');
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [gasStatus, setGasStatus] = useState<DetectionStatus>(DetectionStatus.SAFE);
  const [currentPpm, setCurrentPpm] = useState<number>(180);

  const [alerts, setAlerts] = useState<Alert[]>(loadAlerts());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(loadSettings());

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const alarmOscillator = useRef<OscillatorNode | null>(null);
  
  const fireAlertFired = useRef(false);
  const gasAlertFired = useRef(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    if (!videoRef.current) {
      const v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      videoRef.current = v;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  const startAlarm = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (alarmOscillator.current) return;

    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioContext.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioContext.current.currentTime + 0.5);
    // Fixed: OscillatorNode does not have a 'loop' property. It oscillates until stop() is called.

    gain.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioContext.current.destination);

    osc.start();
    alarmOscillator.current = osc;
  };

  const stopAlarm = () => {
    if (alarmOscillator.current) {
      alarmOscillator.current.stop();
      alarmOscillator.current = null;
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const triggerAlert = (type: 'Fire' | 'Gas', message: string) => {
    if (!notificationSettings.enabled) return;

    // 1. Create Internal Alert Object
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      title: `${type} EMERGENCY`,
      message,
      severity: AlertSeverity.EMERGENCY,
      type,
      emailSentTo: notificationSettings.email || undefined,
      phoneSentTo: notificationSettings.phone || undefined,
      delivered: true
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    
    // 2. Browser Native Notification
    if (notificationPermission === 'granted') {
      new Notification(`PyroWatch: ${type} Hazard!`, {
        body: message,
        icon: 'https://cdn-icons-png.flaticon.com/512/785/785116.png'
      });
    }

    // 3. Audio Alarm
    startAlarm();

    // 4. Mock Gateway (Log for debugging)
    console.log(`%c[PyroWatch GATEWAY] SMS -> ${notificationSettings.phone}: ${message}`, 'color: #ff4444; font-weight: bold');
    console.log(`%c[PyroWatch GATEWAY] Email -> ${notificationSettings.email}: ${message}`, 'color: #ff4444; font-weight: bold');
  };

  const triggerManualTest = () => {
    triggerAlert('Fire', 'SYSTEM TEST: Verify notification receipt and audio alarm functionality.');
    setTimeout(stopAlarm, 3000);
  };

  // Watch for Hazard Transitions
  useEffect(() => {
    if (latestResult === DetectionStatus.DETECTED && !fireAlertFired.current) {
      triggerAlert('Fire', `Visual detection confirmed. Labels: ${detectedLabels.join(', ')}`);
      fireAlertFired.current = true;
    } else if (latestResult === DetectionStatus.SAFE) {
      fireAlertFired.current = false;
    }
  }, [latestResult]);

  useEffect(() => {
    if (gasStatus === DetectionStatus.DETECTED && !gasAlertFired.current) {
      triggerAlert('Gas', `Atmospheric spike detected: ${currentPpm} PPM.`);
      gasAlertFired.current = true;
    } else if (gasStatus === DetectionStatus.SAFE) {
      gasAlertFired.current = false;
    }
  }, [gasStatus]);

  // Global Alarm silencer
  useEffect(() => {
    if (latestResult === DetectionStatus.SAFE && gasStatus === DetectionStatus.SAFE) {
      stopAlarm();
    }
  }, [latestResult, gasStatus]);

  const toggleGasLeak = () => {
    const newStatus = gasStatus === DetectionStatus.SAFE ? DetectionStatus.DETECTED : DetectionStatus.SAFE;
    setGasStatus(newStatus);
    historyService.addLog({
      type: 'Gas',
      status: newStatus,
      location: 'Pipeline Node A1',
      details: newStatus === DetectionStatus.DETECTED ? 'CRITICAL: Gas simulation leak active.' : 'Atmosphere restored.',
      value: currentPpm
    });
  };

  const captureFrame = async () => {
    if (!isMonitoring || !videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
    setIsScanning(true);
    const startTime = Date.now();
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 640; 
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
      try {
        const response = await fetch(customUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data }),
        });
        const latency = Date.now() - startTime;
        if (!response.ok) throw new Error();
        const data = await response.json();
        const status = data.hazardous_fire ? DetectionStatus.DETECTED : DetectionStatus.SAFE;
        const labels = data.detected_objects || [];
        setLastRawJson(JSON.stringify(data, null, 2));
        setFrameCount(prev => prev + 1);
        setAvgLatency(old => old === 0 ? latency : Math.round((old + latency) / 2));
        setLatestResult(status);
        setDetectedLabels(labels);
        if (status === DetectionStatus.DETECTED || (frameCount % 20 === 0)) {
           historyService.addLog({
             type: 'Fire',
             status,
             location: 'Global Sensor',
             details: labels.length > 0 ? `Confirmed: ${labels.join(', ')}` : 'Periodic sync successful.'
           });
        }
        setLiveLog(prev => [{
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status,
          labels,
          latency,
          frameCount: frameCount + 1,
          details: labels.length > 0 ? `Detected: ${labels.join(', ')}` : "Sync OK"
        }, ...prev].slice(0, 30));
        setTestSuccess(true);
      } catch (err) {
        setTestSuccess(false);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    let interval: number | null = null;
    if (isMonitoring) interval = window.setInterval(captureFrame, 2000);
    return () => { if (interval) clearInterval(interval); };
  }, [isMonitoring, customUrl, frameCount]);

  const startMonitoring = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setIsMonitoring(true);
    } catch (err) { console.error(err); }
  };

  const stopMonitoring = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsMonitoring(false);
    stopAlarm();
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${customUrl.replace('/detect', '/ping')}`);
      setTestSuccess(response.ok);
    } catch { setTestSuccess(false); }
  };

  return (
    <MonitoringContext.Provider value={{
      isMonitoring, startMonitoring, stopMonitoring, stream,
      latestResult, detectedLabels, frameCount, avgLatency,
      liveLog, lastRawJson, customUrl, setCustomUrl,
      testSuccess, testConnection, isScanning,
      gasStatus, currentPpm, toggleGasLeak,
      alerts, notificationSettings, 
      updateNotificationSettings: setNotificationSettings,
      clearAlerts: () => setAlerts([]),
      requestNotificationPermission,
      notificationPermission,
      triggerManualTest
    }}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) throw new Error("useMonitoring must be used within MonitoringProvider");
  return context;
};
