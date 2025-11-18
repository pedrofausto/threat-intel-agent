import React, { useState } from 'react';
import { MCPServer, ServerStatus } from '../types';
import { MCPServerCard } from './MCPServerCard';
import { Plus, X, Globe, Database, Terminal, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  servers: MCPServer[];
  setServers: React.Dispatch<React.SetStateAction<MCPServer[]>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, servers, setServers }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('ws://localhost:8000');
  const [newServerDesc, setNewServerDesc] = useState('');

  const toggleServer = (id: string) => {
    setServers(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === ServerStatus.CONNECTED ? ServerStatus.DISCONNECTED : ServerStatus.CONNECTED;
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const deleteServer = (id: string) => {
    setServers(prev => prev.filter(s => s.id !== id));
  };

  const addServer = () => {
    if (!newServerName || !newServerUrl) return;
    
    const newServer: MCPServer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newServerName,
      url: newServerUrl,
      description: newServerDesc || 'Custom MCP Server',
      status: ServerStatus.CONNECTED,
      toolsCount: Math.floor(Math.random() * 10) + 1, // Mock count
    };

    setServers(prev => [...prev, newServer]);
    setShowAddModal(false);
    setNewServerName('');
    setNewServerDesc('');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-950/80 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-80 bg-slate-950 border-r border-slate-800 z-50 
        transform transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Globe size={20} />
            <span className="font-bold tracking-tight text-white">NEXUS</span>
            <span className="text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">BETA</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Server List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected MCP Nodes</h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{servers.filter(s => s.status === 'CONNECTED').length} Active</span>
          </div>

          {servers.map(server => (
            <MCPServerCard 
              key={server.id} 
              server={server} 
              onToggle={toggleServer}
              onDelete={deleteServer}
            />
          ))}

          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            Add MCP Server
          </button>
        </div>

        {/* Footer / Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-300">System Secure</div>
              <div className="text-[10px] text-slate-500">End-to-end encryption enabled</div>
            </div>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-600 font-mono">
             <span>v1.4.2</span>
             <span>•</span>
             <span>LATENCY: 24ms</span>
          </div>
        </div>
      </div>

      {/* Add Server Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database size={18} className="text-indigo-400" />
                Connect New Node
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Server Name</label>
                  <input 
                    type="text" 
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    placeholder="e.g., Postgres Main DB"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Endpoint URL</label>
                  <input 
                    type="text" 
                    value={newServerUrl}
                    onChange={(e) => setNewServerUrl(e.target.value)}
                    placeholder="ws://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Capabilities (Description)</label>
                  <textarea 
                    value={newServerDesc}
                    onChange={(e) => setNewServerDesc(e.target.value)}
                    placeholder="Allows querying user tables..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors h-20 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addServer}
                  disabled={!newServerName || !newServerUrl}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};