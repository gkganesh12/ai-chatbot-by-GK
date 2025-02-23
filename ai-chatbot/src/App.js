import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import './App.css';

// API endpoint configuration
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://ai-chatbot-by-gk.onrender.com'
  : 'http://localhost:8000';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkServer = async () => {
    try {
      setIsCheckingConnection(true);
      const response = await axios.get(`${API_URL}/`);
      console.log("Server response:", response.data);
      setIsServerConnected(true);
      setError("");
    } catch (err) {
      console.error("Server connection error:", err);
      setIsServerConnected(false);
      setError("Cannot connect to server. Please ensure the server is running.");
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessage = {
      text: input,
      sender: 'user',
      timestamp
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: input
      });

      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.error || "Failed to get response from the server");
      
      const errorMessage = {
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="App">
      <div className="connection-status">
        {isCheckingConnection ? (
          <span className="checking">Checking server connection...</span>
        ) : isServerConnected ? (
          <span className="connected">Server Connected ✓</span>
        ) : (
          <span className="disconnected">Server Disconnected ✗</span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-timestamp">{message.timestamp}</div>
              <div className="message-content">
                {message.sender === 'bot' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <button 
            className="clear-button"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            Clear Chat
          </button>
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={!isServerConnected || isLoading}
            />
            <button 
              type="submit" 
              disabled={!isServerConnected || isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
