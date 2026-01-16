import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ICONS } from '../constants';
import { useMonitoring } from '../contexts/MonitoringContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isMonitoring, latestResult } = useMonitoring();

  const navItems = [
    { name: 'Home', path: '/', icon: ICONS.Dashboard },
    { name: 'Fire Detection', path: '/fire', icon: ICONS.Fire },
    { name: 'Gas Detection', path: '/gas', icon: ICONS.Gas },
    { name: 'History', path: '/history', icon: ICONS.History },
    { name: 'Alerts', path: '/alerts', icon: ICONS.Alerts },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg shadow-sm">
                <ICONS.Fire />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Pyro<span className="text-red-600">Watch</span>
              </span>
              
              {isMonitoring && (
                <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${latestResult === 'SAFE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live</span>
                </div>
              )}
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-100 text-red-600'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2 opacity-70">
                    <item.icon />
                  </span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              title={isOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                isActive(item.path)
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">
                <item.icon />
              </span>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
