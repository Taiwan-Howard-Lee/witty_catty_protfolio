import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatWindow.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface Suggestion {
  id: string;
  text: string;
}

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m Witty, your AI cat assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const location = useLocation();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setConnectionError(null);

      // Send current page context
      ws.send(JSON.stringify({
        type: 'contextUpdate',
        payload: {
          currentPage: location.pathname,
          projectId: location.pathname.startsWith('/projects/')
            ? location.pathname.split('/').pop()
            : undefined
        }
      }));
    });

    // Connection closed
    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);

      // Try to reconnect after a delay
      setTimeout(() => {
        if (isOpen) {
          setupWebSocket();
        }
      }, 3000);
    });

    // Connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setConnectionError('Failed to connect to the server. Please try again later.');
    });

    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case 'aiResponse':
            // Add AI message
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              content: data.payload.message,
              sender: 'ai',
              timestamp: new Date()
            }]);
            break;

          case 'typing':
            // Update typing indicator
            setIsTyping(data.payload.isTyping);
            break;

          case 'error':
            console.error('Error from server:', data.payload.message);
            break;

          case 'suggestion':
            // Handle suggestions
            if (Array.isArray(data.payload.suggestions)) {
              const newSuggestions = data.payload.suggestions.map((text: string) => ({
                id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                text
              }));
              setSuggestions(newSuggestions);
            }
            break;

          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    return ws;
  }, [location.pathname, isOpen]);

  // Initialize WebSocket when component mounts
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      setupWebSocket();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, setupWebSocket]);

  // Send context update when location changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'contextUpdate',
        payload: {
          currentPage: location.pathname,
          projectId: location.pathname.startsWith('/projects/')
            ? location.pathname.split('/').pop()
            : undefined
        }
      }));
    }
  }, [location.pathname]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !isConnected) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Send message to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chatMessage',
        payload: {
          message: inputValue
        }
      }));
    }

    // Clear suggestions when user sends a message
    setSuggestions([]);

    setInputValue('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Set the suggestion as the input value
    setInputValue(suggestion);

    // Submit the form programmatically
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Send message to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chatMessage',
        payload: {
          message: suggestion
        }
      }));
    }

    // Clear suggestions
    setSuggestions([]);
  };

  return (
    <div className="chat-container">
      <button
        className={`chat-toggle ${isOpen ? 'open' : ''} ${!isConnected && isOpen ? 'disconnected' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        <div className="cat-icon">
          {/* Simple cat icon */}
          <div className="cat-ears">
            <div className="ear left"></div>
            <div className="ear right"></div>
          </div>
          <div className="cat-face">
            <div className="cat-eyes">
              <div className="eye left"></div>
              <div className="eye right"></div>
            </div>
            <div className="cat-nose"></div>
            <div className="cat-mouth"></div>
          </div>
        </div>
        {!isOpen && <span className="chat-label">Chat with Witty</span>}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>
              Witty AI Cat Assistant
              {!isConnected && <span className="connection-status"> (Connecting...)</span>}
            </h3>
            <button
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          {connectionError && (
            <div className="connection-error">
              {connectionError}
            </div>
          )}

          <div className="chat-messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user' : 'ai'}`}
              >
                {message.sender === 'ai' && (
                  <div className="avatar">
                    <div className="cat-icon small">
                      <div className="cat-ears">
                        <div className="ear left"></div>
                        <div className="ear right"></div>
                      </div>
                      <div className="cat-face">
                        <div className="cat-eyes">
                          <div className="eye left"></div>
                          <div className="eye right"></div>
                        </div>
                        <div className="cat-nose"></div>
                        <div className="cat-mouth"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message ai">
                <div className="avatar">
                  <div className="cat-icon small">
                    <div className="cat-ears">
                      <div className="ear left"></div>
                      <div className="ear right"></div>
                    </div>
                    <div className="cat-face">
                      <div className="cat-eyes">
                        <div className="eye left"></div>
                        <div className="eye right"></div>
                      </div>
                      <div className="cat-nose"></div>
                      <div className="cat-mouth"></div>
                    </div>
                  </div>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          )}

          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={isConnected ? "Type your message..." : "Connecting to server..."}
              disabled={isTyping || !isConnected}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping || !isConnected}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
