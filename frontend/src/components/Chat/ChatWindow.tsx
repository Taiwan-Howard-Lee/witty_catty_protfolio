import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WS_BASE_URL } from '../../utils/api';
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

interface ChatWindowProps {
  expanded?: boolean;
}

const ChatWindow = ({ expanded = false }: ChatWindowProps) => {
  const [isOpen, setIsOpen] = useState(expanded);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: expanded
        ? 'Hello! I\'m Witty, your AI cat assistant. I\'ll be guiding you through this portfolio. Feel free to ask me anything!'
        : 'Hello! I\'m Witty, your AI cat assistant. How can I help you today?',
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

  // Setup WebSocket connection with exponential backoff
  const setupWebSocket = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Track reconnection attempts for exponential backoff
    const reconnectAttempt = wsRef.current ? (wsRef.current as any).reconnectAttempt || 0 : 0;
    const backoffTime = Math.min(30000, 1000 * Math.pow(1.5, reconnectAttempt)); // Max 30 seconds

    // Create new WebSocket connection
    console.log(`Attempting to connect to WebSocket at ${WS_BASE_URL}`);
    const ws = new WebSocket(WS_BASE_URL);
    wsRef.current = ws;
    (ws as any).reconnectAttempt = reconnectAttempt + 1;

    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setConnectionError(null);
      (ws as any).reconnectAttempt = 0; // Reset reconnect attempts on successful connection

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
    ws.addEventListener('close', (event) => {
      console.log(`WebSocket connection closed with code ${event.code}, reason: ${event.reason}`);
      setIsConnected(false);

      // Try to reconnect after a delay with exponential backoff
      if (isOpen) {
        console.log(`Will attempt to reconnect in ${backoffTime}ms (attempt ${(ws as any).reconnectAttempt})`);
        setTimeout(() => {
          if (isOpen) {
            setupWebSocket();
          }
        }, backoffTime);
      }
    });

    // Connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setConnectionError('Failed to connect to the server. Please try again later. You can try refreshing the page or check your internet connection.');
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
    <div className={`chat-container ${expanded ? 'expanded' : ''}`}>
      {!expanded && (
        <motion.button
          className={`chat-toggle ${isOpen ? 'open' : ''} ${!isConnected && isOpen ? 'disconnected' : ''}`}
          onClick={toggleChat}
          aria-label="Toggle chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="cat-icon"
            animate={{
              rotate: isOpen ? [0, 0] : [0, 10, -10, 0],
            }}
            transition={{
              repeat: isOpen ? 0 : Infinity,
              repeatDelay: 5,
              duration: 0.5,
            }}
          >
            {/* Simple cat icon */}
            <div className="cat-ears">
              <motion.div
                className="ear left"
                animate={{
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="ear right"
                animate={{
                  rotate: [5, -5, 5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div className="cat-face">
              <div className="cat-eyes">
                <motion.div
                  className="eye left"
                  animate={{
                    scaleY: [1, 0.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 5,
                    duration: 0.2,
                  }}
                />
                <motion.div
                  className="eye right"
                  animate={{
                    scaleY: [1, 0.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 5,
                    duration: 0.2,
                  }}
                />
              </div>
              <div className="cat-nose" />
              <motion.div
                className="cat-mouth"
                animate={{
                  scaleX: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
          {!isOpen && <span className="chat-label">Chat with Witty</span>}
        </motion.button>
      )}

      <AnimatePresence>
        {(isOpen || expanded) && (
          <motion.div
            className={`chat-window ${expanded ? 'expanded' : ''}`}
            initial={expanded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="chat-header">
              <h3>
                Witty AI Cat Assistant
                {!isConnected && <span className="connection-status"> (Connecting...)</span>}
              </h3>
              {!expanded && (
                <button
                  className="close-button"
                  onClick={toggleChat}
                  aria-label="Close chat"
                >
                  &times;
                </button>
              )}
            </div>

            {connectionError && (
              <div className="connection-error">
                <p>{connectionError}</p>
                <button
                  className="retry-button"
                  onClick={() => {
                    setConnectionError(null);
                    setupWebSocket();
                  }}
                >
                  Retry Connection
                </button>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWindow;
