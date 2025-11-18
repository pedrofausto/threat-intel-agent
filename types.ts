export enum SenderType {
  USER = 'USER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM'
}

export enum ServerStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING'
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: ServerStatus;
  description: string;
  toolsCount: number;
}

export interface Message {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: number;
  isThinking?: boolean; // Visual state for "Agent is thinking"
  toolCalls?: ToolCallLog[]; // For displaying agentic actions
}

export interface ToolCallLog {
  toolName: string;
  args: Record<string, any>;
  result?: string;
  status: 'pending' | 'success' | 'error';
}

export interface AgentState {
  isProcessing: boolean;
  currentTask: string | null;
}