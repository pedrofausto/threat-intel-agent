import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { MCPServer } from "../types";

// Initialize the client
// Note: In a real deployment, ensure process.env.API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

// Mock MCP Router Tool Definition
// This tells the model it can "call" tools on the connected MCP servers
const mcpRouterTool: FunctionDeclaration = {
  name: 'execute_mcp_tool',
  description: 'Executes a specific tool on a connected MCP server.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      serverName: {
        type: Type.STRING,
        description: 'The name of the MCP server to route the request to.',
      },
      toolName: {
        type: Type.STRING,
        description: 'The specific tool function to call on the server.',
      },
      arguments: {
        type: Type.STRING,
        description: 'JSON stringified arguments for the tool.',
      }
    },
    required: ['serverName', 'toolName', 'arguments'],
  },
};

export const generateAgentResponse = async (
  prompt: string, 
  history: { role: string, parts: { text: string }[] }[],
  availableServers: MCPServer[]
): Promise<{ text: string; toolCalls?: any[] }> => {
  
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key missing");
    }

    // Construct a system instruction that makes the AI aware of the MCP context
    const serverDescriptions = availableServers
      .filter(s => s.status === 'CONNECTED')
      .map(s => `- ${s.name} (${s.url}): ${s.description}`)
      .join('\n');

    const systemInstruction = `
      You are the Nexus Agentic Orchestrator. 
      You verify and coordinate tasks across multiple Model Context Protocol (MCP) servers.
      
      Available Connected Servers:
      ${serverDescriptions || "No servers currently connected."}

      If a user request requires external data or actions, use the 'execute_mcp_tool' function.
      If the request is general knowledge, answer directly.
      Always match the tool usage to the most appropriate server description.
    `;

    const tools: Tool[] = [{
      functionDeclarations: [mcpRouterTool]
    }];

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        tools: tools, // Enable function calling
        thinkingConfig: { thinkingBudget: 2048 } // Enable thinking for reasoning about tools
      }
    });

    // In a real app, we would rebuild history properly. 
    // For this stateless function wrapper, we'll just send the message with context.
    // To keep it simple for this demo, we assume single-turn or managed history outside.
    
    const result = await chat.sendMessage({ message: prompt });
    
    const responseText = result.text || "";
    
    // Check for function calls in the response
    // The SDK simplifies this, but we look at the candidates
    const functionCalls = result.candidates?.[0]?.content?.parts
      ?.filter(part => part.functionCall)
      .map(part => part.functionCall);

    return {
      text: responseText,
      toolCalls: functionCalls
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I encountered a critical error connecting to the neural core. Please check your API key and network connection."
    };
  }
};