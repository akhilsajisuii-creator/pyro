
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GasReading, DetectionStatus } from '../types';
import { useMonitoring } from '../contexts/MonitoringContext';

const GasDetection: React.FC = () => {
  const { gasStatus, currentPpm, toggleGasLeak } = useMonitoring();
  const [readings, setReadings] = useState<GasReading[]>([]);

  // Local visualization helper
  useEffect(() => {
    const initialData: GasReading[] = Array.from({ length: 20 }).map((_, i) => ({
      time: i + ':00',
      value: 150 + Math.random() * 50
    }));
    setReadings(initialData);

    const interval = setInterval(() => {
      setReadings(prev => {
        const next = [...prev.slice(1), { 
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          value: currentPpm 
        }];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPpm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gas Monitoring</h1>
          <p className="text-gray-500 font-medium">LPG and CO sensor matrix.</p>
        </div>
        <button 
          onClick={toggleGasLeak}
          className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
            gasStatus === DetectionStatus.SAFE 
              ? 'bg-gray-900 text-white hover:bg-black' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {gasStatus === DetectionStatus.SAFE ? 'Simulate Leak' : 'Clear Alert'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Concentration Trend (PPM)</h3>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gasStatus === DetectionStatus.SAFE ? "#3B82F6" : "#EF4444"} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={gasStatus === DetectionStatus.SAFE ? "#3B82F6" : "#EF4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 600]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#60A5FA' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={gasStatus === DetectionStatus.SAFE ? "#3B82F6" : "#EF4444"} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="text-center py-10">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Live Reading</span>
             <div className={`text-8xl font-black mb-2 tracking-tighter transition-colors ${
               gasStatus === DetectionStatus.SAFE ? 'text-gray-900' : 'text-red-600'
             }`}>
               {currentPpm}
             </div>
             <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Parts Per Million</div>
          </div>

          <div className={`p-6 rounded-[2rem] text-center transition-all ${
            gasStatus === DetectionStatus.SAFE ? 'bg-gray-50 border border-gray-100 text-gray-600' : 'bg-red-600 text-white shadow-xl shadow-red-200 animate-pulse'
          }`}>
             <p className="font-black uppercase tracking-tight text-xs">
               {gasStatus === DetectionStatus.SAFE ? 'Atmosphere: Stable' : 'DANGER: LEAK DETECTED'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasDetection;
