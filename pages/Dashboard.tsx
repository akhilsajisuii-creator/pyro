
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DetectionStatus, DetectionResult } from '../types';
import { ICONS } from '../constants';
import { useMonitoring } from '../contexts/MonitoringContext';
import { historyService } from '../services/historyService';

const Dashboard: React.FC = () => {
  const { latestResult, gasStatus, currentPpm, isMonitoring, frameCount } = useMonitoring();
  const [recentLogs, setRecentLogs] = useState<DetectionResult[]>([]);
  const [lastLogTime, setLastLogTime] = useState<string>("---");

  const updateLogs = () => {
    const logs = historyService.getLogs();
    setRecentLogs(logs.slice(0, 4));
    if (logs.length > 0) {
      setLastLogTime(logs[0].time);
    }
  };

  useEffect(() => {
    updateLogs();
    window.addEventListener('pyrowatch_history_updated', updateLogs);
    return () => window.removeEventListener('pyrowatch_history_updated', updateLogs);
  }, []);

  const StatusCard = ({ 
    title, 
    status, 
    icon: Icon, 
    colorClass, 
    linkTo,
    subValue
  }: { 
    title: string; 
    status: DetectionStatus; 
    icon: any; 
    colorClass: string;
    linkTo: string;
    subValue?: string;
  }) => (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl bg-opacity-10 ${colorClass}`}>
          <div className={`text-2xl ${status === DetectionStatus.SAFE ? 'text-gray-600' : 'text-red-600'}`}>
            <Icon />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
            status === DetectionStatus.SAFE 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-200'
          }`}>
            {status}
          </span>
          {subValue && <span className="text-[10px] font-bold text-gray-400 mt-2">{subValue}</span>}
        </div>
      </div>
      <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
      <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">
        {status === DetectionStatus.SAFE ? 'Monitoring Active' : 'Emergency Protocol'}
      </p>
      <Link 
        to={linkTo} 
        className="mt-6 inline-flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 group"
      >
        Open Module
        <svg className="ml-1.5 w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">System Overview</h1>
          <p className="text-gray-500 font-medium text-lg">Centralized monitoring of all active sensor nodes.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Master Link: Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatusCard 
          title="Visual Intelligence" 
          status={latestResult} 
          icon={ICONS.Fire} 
          colorClass="bg-red-500"
          linkTo="/fire"
          subValue={isMonitoring ? `Inference #${frameCount}` : "Worker Offline"}
        />
        <StatusCard 
          title="Gas Atmosphere" 
          status={gasStatus} 
          icon={ICONS.Gas} 
          colorClass="bg-blue-500"
          linkTo="/gas"
          subValue={`${currentPpm} PPM`}
        />
        
        <div className="bg-gray-900 p-8 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between transform hover:scale-[1.02] transition-all">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-gray-800 rounded-2xl border border-white/5">
                  <ICONS.History />
               </div>
               <div>
                 <h3 className="text-lg font-black tracking-tight">Quick Insights</h3>
                 <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Real-time data</p>
               </div>
            </div>
            <ul className="space-y-4 text-white/70 text-xs font-bold uppercase tracking-widest">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Last Scan</span>
                <span className="text-blue-400 font-mono">{lastLogTime}</span>
              </li>
              <li className="flex justify-between">
                <span>Active Nodes</span>
                <span className="text-white">0{isMonitoring ? 2 : 1} / 12</span>
              </li>
            </ul>
          </div>
          <Link 
            to="/history" 
            className="mt-8 block w-full text-center py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Review Logs
          </Link>
        </div>
      </div>

      <section className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Recent Activity</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Audit log snapshot</p>
          </div>
          <Link to="/history" className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 hover:border-blue-600 transition-all">Full History</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentLogs.length > 0 ? recentLogs.map((log) => (
            <div key={log.id} className="px-10 py-6 flex items-center gap-6 hover:bg-gray-50/50 transition-colors group">
              <div className={`w-3 h-3 rounded-full ${log.status === DetectionStatus.SAFE ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              <div className="flex-grow">
                <div className="flex items-center gap-3">
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                     log.type === 'Fire' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                   }`}>{log.type}</span>
                   <p className="text-sm font-black text-gray-800 tracking-tight">{log.details}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{log.time} &bull; {log.location}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center opacity-30 italic font-medium">
               Awaiting initial sensor data...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
