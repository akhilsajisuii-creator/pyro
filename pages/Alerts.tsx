
import React, { useState } from 'react';
import { AlertSeverity } from '../types';
import { useMonitoring } from '../contexts/MonitoringContext';

const Alerts: React.FC = () => {
  const { 
    alerts, 
    notificationSettings, 
    updateNotificationSettings, 
    clearAlerts,
    requestNotificationPermission,
    notificationPermission,
    triggerManualTest
  } = useMonitoring();
  
  const [email, setEmail] = useState(notificationSettings.email);
  const [phone, setPhone] = useState(notificationSettings.phone);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationSettings({
      ...notificationSettings,
      email,
      phone
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.EMERGENCY: return 'border-red-500 bg-red-50 text-red-900 shadow-red-100';
      case AlertSeverity.WARNING: return 'border-yellow-500 bg-yellow-50 text-yellow-900 shadow-yellow-100';
      default: return 'border-blue-500 bg-blue-50 text-blue-900 shadow-blue-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Alert Center</h1>
          <p className="text-gray-500 font-medium">Automatic Emergency Notification Dispatch System.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={triggerManualTest}
            className="text-[10px] font-black text-blue-600 border border-blue-200 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-blue-50 transition-colors"
          >
            Test Dispatch
          </button>
          <button 
            onClick={clearAlerts}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Clear History
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Notification Settings</h2>
            
            {notificationPermission !== 'granted' && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                 <p className="text-[10px] font-black text-orange-700 uppercase mb-2">System Permission Required</p>
                 <button 
                  onClick={requestNotificationPermission}
                  className="w-full py-3 bg-orange-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-orange-200"
                 >
                   Enable Browser Notifications
                 </button>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Emergency Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="safety@company.com"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <button 
                type="submit"
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                  isSaved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {isSaved ? 'Settings Updated' : 'Save Config'}
              </button>
            </form>
          </section>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Live Dispatch Feed</h2>
          
          {alerts.length > 0 ? alerts.map((alert) => (
            <div key={alert.id} className={`p-8 rounded-[2.5rem] border-l-[12px] shadow-sm flex gap-6 transition-all hover:scale-[1.01] ${getSeverityStyles(alert.severity)}`}>
              <div className="flex-shrink-0 pt-1">
                <div className={`p-3 rounded-2xl ${alert.severity === AlertSeverity.EMERGENCY ? 'bg-red-500' : 'bg-yellow-500'} text-white shadow-lg`}>
                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                   </svg>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black tracking-tight">{alert.title}</h3>
                  <span className="text-[10px] font-mono font-black opacity-50 uppercase tracking-widest">{alert.timestamp}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-80 mb-6">{alert.message}</p>
                
                <div className="flex flex-wrap gap-3">
                   {alert.emailSentTo && (
                     <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-black/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Email Sent: {alert.emailSentTo}</span>
                     </div>
                   )}
                   {alert.phoneSentTo && (
                     <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-black/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">SMS Sent: {alert.phoneSentTo}</span>
                     </div>
                   )}
                   <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-black/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">System Notification Pushed</span>
                   </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center flex flex-col items-center justify-center opacity-60">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-900">Queue Empty</h3>
              <p className="text-sm text-gray-400 font-medium max-w-xs">No signals have been dispatched yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
