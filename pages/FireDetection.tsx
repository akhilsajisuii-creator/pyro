import React, { useRef, useEffect } from 'react';
import { useMonitoring } from '../contexts/MonitoringContext';
import { DetectionStatus } from '../types';

const FireDetection: React.FC = () => {
  const {
    isMonitoring, startMonitoring, stopMonitoring, stream,
    latestResult, detectedLabels, frameCount, avgLatency,
    liveLog, lastRawJson, customUrl, setCustomUrl,
    testSuccess, testConnection, isScanning
  } = useMonitoring();

  const videoRef = useRef<HTMLVideoElement>(null);

  // Connect local video element to global stream when mounted
  useEffect(() => {
    if (isMonitoring && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isMonitoring, stream]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Detection Center</h1>
          <p className="text-gray-500 font-medium font-mono text-sm uppercase tracking-widest">fire_best.pt</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-right min-w-[120px]">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Latency</p>
             <p className="text-xl font-black text-orange-600 leading-none">{avgLatency}ms</p>
           </div>
           <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-right min-w-[120px]">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Syncs</p>
             <p className="text-xl font-black text-blue-600 leading-none">{frameCount}</p>
           </div>
        </div>
      </header>

      <div className="bg-white border border-gray-100 p-3 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="flex-grow flex items-center gap-3 w-full px-4">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${testSuccess ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-300'}`}></div>
          <input 
            type="text" 
            value={customUrl} 
            onChange={(e) => setCustomUrl(e.target.value)} 
            className="flex-grow bg-transparent text-xs font-mono font-bold text-gray-600 focus:outline-none"
            placeholder="Enter custom URL"
            title="Custom URL input"
          />
        </div>
        <button onClick={testConnection} className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
          Refresh Connection
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div className={`relative aspect-video bg-gray-950 rounded-[3rem] overflow-hidden border-[10px] transition-all duration-500 shadow-2xl ${
            isMonitoring && latestResult === DetectionStatus.DETECTED ? 'border-red-600 shadow-red-100' : 'border-gray-900'
          }`}>
            {isMonitoring ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-8 left-8 flex items-center gap-3">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Background worker running</span>
                  </div>
                  {isScanning && (
                    <div className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg animate-bounce">SYNCING</div>
                  )}
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className={`backdrop-blur-2xl p-6 rounded-[2rem] border transition-all duration-500 ${
                    latestResult === DetectionStatus.DETECTED ? 'bg-red-950/90 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-black/70 border-white/10'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-white/40">Status</span>
                        <h2 className={`text-2xl font-black tracking-tighter ${latestResult === DetectionStatus.DETECTED ? 'text-red-400' : 'text-green-400'}`}>
                          {latestResult === DetectionStatus.DETECTED ? 'HAZARD CONFIRMED' : 'SYSTEM SECURE'}
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        {detectedLabels.map((l, i) => (
                          <span key={i} className="bg-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase shadow-lg">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <button onClick={startMonitoring} className="px-12 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all bg-blue-600 hover:bg-blue-700 text-white active:scale-95">
                  Establish Connection
                </button>
              </div>
            )}
          </div>
          <div className="bg-gray-900 rounded-[2.5rem] border border-gray-800 p-6 h-32 overflow-y-auto font-mono text-[11px] text-blue-400 custom-scrollbar">
            {lastRawJson ? <pre>{lastRawJson}</pre> : <span className="text-gray-800 italic uppercase">Awaiting model input...</span>}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 flex flex-col h-[740px]">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Sync Stream</h3>
          <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {liveLog.length > 0 ? liveLog.map((log) => (
              <div key={log.id} className={`p-4 rounded-2xl border transition-all duration-300 ${log.status === DetectionStatus.DETECTED ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-mono text-gray-400 font-bold">{log.time}</span>
                   <span className={`w-2 h-2 rounded-full ${log.status === DetectionStatus.DETECTED ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-blue-400'}`}></span>
                </div>
                <p className={`text-[10px] font-black uppercase ${log.status === DetectionStatus.DETECTED ? 'text-red-700' : 'text-gray-700'}`}>{log.details}</p>
                <div className="mt-2 flex items-center justify-between opacity-30">
                   <span className="text-[8px] font-black uppercase tracking-tighter">Sync #{log.frameCount}</span>
                   <span className="text-[8px] font-black uppercase tracking-tighter">{log.latency}ms</span>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 italic text-sm">
                Log is currently empty
              </div>
            )}
          </div>
          {isMonitoring && (
            <button onClick={stopMonitoring} className="mt-6 w-full py-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest font-bold">
              Terminate All Workers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FireDetection;
