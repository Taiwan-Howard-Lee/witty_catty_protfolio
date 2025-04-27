// Project type
export interface Project {
  id: string;
  created_at: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_link?: string;
  repo_link?: string;
  content: string;
}

// WebSocket message types
export type MessageType = 'chatMessage' | 'aiResponse' | 'contextUpdate' | 'suggestion';

// Base message interface
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

// Chat message
export interface ChatMessage extends WebSocketMessage {
  type: 'chatMessage';
  payload: {
    message: string;
  };
}

// AI response
export interface AIResponse extends WebSocketMessage {
  type: 'aiResponse';
  payload: {
    message: string;
  };
}

// Context update
export interface ContextUpdate extends WebSocketMessage {
  type: 'contextUpdate';
  payload: {
    currentPage: string;
    projectId?: string;
  };
}

// Suggestion
export interface Suggestion extends WebSocketMessage {
  type: 'suggestion';
  payload: {
    suggestions: string[];
  };
}

// Conversation message
export interface Message {
  role: 'user' | 'model';
  content: string;
}
