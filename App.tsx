import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { Message, SenderType, MCPServer, ServerStatus, ToolCallLog } from './types';
import { generateAgentResponse } from './services/geminiService';
import { Menu, Send, Zap } from 'lucide-react';

// Initial Mock Servers
const INITIAL_SERVERS: MCPServer[] = [
  {
    id: '1',
    name: 'GitHub Integration',
    url: 'ws://github-mcp.internal:8080',
    status: ServerStatus.CONNECTED,
    description: 'Access repository files, issues, and PRs.',
    toolsCount: 12
  },
  {
    id: '2',
    name: 'PostgreSQL Primary',
    url: 'postgres://db-prod.internal:5432',
    status: ServerStatus.DISCONNECTED,
    description: 'Read-only access to users and orders tables.',
    toolsCount: 5
  },
  {
    id: '3',
    name: 'Linear Issues',
    url: 'https://api.linear.app/graphql',
    status: ServerStatus.CONNECTED,
    description: 'Create and update Linear tickets.',
    toolsCount: 8
  }
];

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [servers, setServers] = useState<MCPServer[]>(INITIAL_SERVERS);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Nexus Orchestrator online. I have access to your connected MCP servers. How can I assist you today?",
      sender: SenderType.AGENT,
      timestamp: Date.now(),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: SenderType.USER,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // Add a temporary thinking message
    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingId,
      text: '',
      sender: SenderType.AGENT,
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      // Call Gemini
      // We format history briefly for the service (in a real app, we'd map full history)
      const history = messages.map(m => ({
        role: m.sender === SenderType.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await generateAgentResponse(userMsg.text, history, servers);

      // Replace thinking message with actual response
      setMessages(prev => prev.map(msg => {
        if (msg.id === thinkingId) {
          // Transform API tool calls to UI format
          let formattedToolCalls: ToolCallLog[] | undefined;
          
          if (response.toolCalls && response.toolCalls.length > 0) {
            formattedToolCalls = response.toolCalls.map((tc: any) => ({
              toolName: tc.name,
              args: tc.args,
              status: 'success'
            }));
          }

          return {
            ...msg,
            text: response.text,
            isThinking: false,
            toolCalls: formattedToolCalls
          };
        }
        return msg;
      }));

    } catch (error) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === thinkingId) {
          return {
            ...msg,
            text: "I lost connection to the orchestration layer. Please check your API key.",
            isThinking: false
          };
        }
        return msg;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        servers={servers}
        setServers={setServers}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full relative">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 border-b border-slate-800 flex items-center px-4 bg-slate-950/90 backdrop-blur z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-white tracking-tight">NEXUS</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative scroll-smooth">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 relative z-20">
          <div className="max-w-4xl mx-auto relative">
            <div className={`absolute -top-10 left-0 right-0 flex justify-center transition-opacity duration-300 ${isProcessing ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-2">
                <Zap size={12} className="animate-pulse" />
                AI Orchestrating...
              </div>
            </div>

            <div className="relative flex items-end bg-slate-900 rounded-xl border border-slate-700 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={servers.length > 0 ? "Ask Nexus to perform a task..." : "Connect an MCP server to get started..."}
                className="w-full bg-transparent text-slate-200 placeholder-slate-500 px-4 py-4 min-h-[60px] max-h-[160px] focus:outline-none resize-none rounded-xl text-sm"
                rows={1}
              />
              <div className="p-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isProcessing}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    input.trim() && !isProcessing
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-600">
                Nexus utilizes Gemini 2.5 Flash for reasoning and MCP tool routing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;