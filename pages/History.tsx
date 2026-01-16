
import React, { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';
import { DetectionResult, DetectionStatus } from '../types';

const History: React.FC = () => {
  const [logs, setLogs] = useState<DetectionResult[]>([]);

  const loadLogs = () => {
    setLogs(historyService.getLogs());
  };

  useEffect(() => {
    loadLogs();
    
    // Listen for custom history update events
    window.addEventListener('pyrowatch_history_updated', loadLogs);
    return () => window.removeEventListener('pyrowatch_history_updated', loadLogs);
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all audit logs?")) {
      historyService.clearHistory();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Audit History</h1>
          <p className="text-gray-500 font-medium">Global activity log for visual and atmospheric sensors.</p>
        </div>
        {logs.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
          >
            Clear All Logs
          </button>
        )}
      </header>

      {logs.length > 0 ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time & Data</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Origin</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-xs font-black text-gray-900">{log.time}</div>
                      <div className="text-[10px] font-bold text-gray-400">{log.date}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                        log.type === 'Fire' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-600">{log.location}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === DetectionStatus.SAFE ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                        }`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          log.status === DetectionStatus.SAFE ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {log.status === DetectionStatus.SAFE ? 'Secure' : 'HAZARD'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-gray-500 font-medium line-clamp-1">{log.details}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center flex flex-col items-center justify-center">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <h3 className="text-xl font-black text-gray-900 mb-2">Logs Empty</h3>
           <p className="text-gray-500 text-sm max-w-xs mx-auto">Sensors have not recorded any events yet. Activity will appear here automatically.</p>
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="flex items-center justify-between px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <p>Displaying {logs.length} total entries</p>
          <p>Rolling buffer: Max 100 entries</p>
        </div>
      )}
    </div>
  );
};

export default History;
