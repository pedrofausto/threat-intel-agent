import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, SenderType } from '../types';
import { Cpu, User, Terminal, CheckCircle2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAgent = message.sender === SenderType.AGENT;

  return (
    <div className={`flex w-full mb-6 ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1
          ${isAgent ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-700 text-slate-300'}
        `}>
          {isAgent ? <Cpu size={18} /> : <User size={18} />}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <div className={`
            p-4 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isAgent 
              ? 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'}
          `}>
            {message.isThinking ? (
              <div className="flex items-center gap-2 text-indigo-300/70">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-75">●</span>
                <span className="animate-pulse delay-150">●</span>
                <span className="text-xs font-mono uppercase tracking-widest opacity-70">Orchestrating</span>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Tool Calls Visualization */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              {message.toolCalls.map((tool, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-md overflow-hidden">
                  <div className="bg-slate-900 px-3 py-1.5 flex items-center gap-2 border-b border-slate-800">
                    <Terminal size={12} className="text-emerald-500" />
                    <span className="text-xs font-mono text-emerald-500">MCP TOOL EXECUTION</span>
                  </div>
                  <div className="p-3 font-mono text-xs text-slate-400">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Tool:</span>
                      <span className="text-indigo-400">{tool.toolName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Payload:</span>
                      <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                        {JSON.stringify(tool.args, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-emerald-500/80">
                      <CheckCircle2 size={10} />
                      <span>Executed successfully</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <span className="text-[10px] text-slate-600 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
};