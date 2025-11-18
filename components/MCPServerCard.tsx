import React from 'react';
import { MCPServer, ServerStatus } from '../types';
import { Server, Trash2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface MCPServerCardProps {
  server: MCPServer;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MCPServerCard: React.FC<MCPServerCardProps> = ({ server, onToggle, onDelete }) => {
  const isConnected = server.status === ServerStatus.CONNECTED;

  return (
    <div className={`
      relative group p-4 rounded-lg border transition-all duration-300
      ${isConnected 
        ? 'bg-slate-800/50 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
        : 'bg-slate-900 border-slate-700 opacity-80 hover:opacity-100'}
    `}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            <Server size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-200">{server.name}</h3>
            <p className="text-xs text-slate-500 font-mono truncate max-w-[120px]">{server.url}</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => onToggle(server.id)}
            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}
            title={isConnected ? "Disconnect" : "Connect"}
          >
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          </button>
          <button 
            onClick={() => onDelete(server.id)}
            className="p-1.5 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors"
            title="Remove Server"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {server.status}
          </span>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400">
          {server.toolsCount} TOOLS
        </div>
      </div>
    </div>
  );
};