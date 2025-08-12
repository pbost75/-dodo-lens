'use client';

import React, { useState, useEffect } from 'react';

interface DebugLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

interface MobileDebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

class MobileDebugLogger {
  private static instance: MobileDebugLogger;
  private logs: DebugLog[] = [];
  private listeners: ((logs: DebugLog[]) => void)[] = [];
  
  static getInstance(): MobileDebugLogger {
    if (!MobileDebugLogger.instance) {
      MobileDebugLogger.instance = new MobileDebugLogger();
    }
    return MobileDebugLogger.instance;
  }
  
  addLog(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const log: DebugLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };
    
    this.logs.unshift(log); // Plus récent en premier
    if (this.logs.length > 50) this.logs.pop(); // Garder seulement 50 logs
    
    this.notifyListeners();
  }
  
  subscribe(listener: (logs: DebugLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }
  
  clear() {
    this.logs = [];
    this.notifyListeners();
  }
}

// Fonction globale pour logger depuis n'importe où
export const mobileLog = {
  info: (message: string, data?: any) => MobileDebugLogger.getInstance().addLog('info', message, data),
  warn: (message: string, data?: any) => MobileDebugLogger.getInstance().addLog('warn', message, data),
  error: (message: string, data?: any) => MobileDebugLogger.getInstance().addLog('error', message, data)
};

const MobileDebugPanel: React.FC<MobileDebugPanelProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  
  useEffect(() => {
    const unsubscribe = MobileDebugLogger.getInstance().subscribe(setLogs);
    return unsubscribe;
  }, []);
  
  const clearLogs = () => {
    MobileDebugLogger.getInstance().clear();
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        🐛 Debug
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      <div className="bg-white m-4 rounded-lg flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">🐛 Debug Mobile</h3>
          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
            >
              🗑️ Clear
            </button>
            <button
              onClick={onToggle}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              ✕ Fermer
            </button>
          </div>
        </div>
        
        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Aucun log pour le moment...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg text-sm ${
                  log.level === 'error' ? 'bg-red-100 border-l-4 border-red-500' :
                  log.level === 'warn' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                  'bg-blue-100 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-xs text-gray-600">
                    {log.timestamp}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    log.level === 'error' ? 'bg-red-200 text-red-800' :
                    log.level === 'warn' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                </div>
                <div className="font-medium">{log.message}</div>
                {log.data && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDebugPanel;
