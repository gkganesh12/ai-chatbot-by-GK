import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        setIsCheckingConnection(true);
        const response = await axios.get(API_URL);
        console.log("Server response:", response.data);
        setIsServerConnected(true);
        setError("");
      } catch (err) {
        console.error("Server connection error:", err);
        setIsServerConnected(false);
        setError("Cannot connect to server. Please make sure the backend is running.");
      } finally {
        setIsCheckingConnection(false);
      }
    };

    // Check connection immediately and then every 5 seconds
    checkServer();
    const interval = setInterval(checkServer, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !isServerConnected) return;
    
    try {
      setError("");
      setIsLoading(true);
      const userMessage = { role: "user", text: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput("");

      const response = await axios.post(`${API_URL}/chat`, { 
        message: input 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const botMessage = { role: "bot", text: response.data.response };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || err.message || "Failed to send message. Please try again.");
      // Remove the user message if the request failed
      setMessages(prevMessages => prevMessages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading && isServerConnected) {
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>AI Chatbot</h2>
      <div style={{ 
        padding: "10px", 
        marginBottom: "20px", 
        backgroundColor: isServerConnected ? "#e8f5e9" : "#ffebee",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <span style={{ 
          height: "10px", 
          width: "10px", 
          borderRadius: "50%", 
          backgroundColor: isServerConnected ? "#4caf50" : "#f44336",
          display: "inline-block",
          marginRight: "8px"
        }}></span>
        {isCheckingConnection ? (
          "Checking server connection..."
        ) : (
          isServerConnected ? "Server is connected" : "Server is not connected. Please make sure the backend is running."
        )}
      </div>
      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        {messages.map((msg, i) => (
          <p key={i} style={{ 
            textAlign: msg.role === "user" ? "right" : "left",
            backgroundColor: msg.role === "user" ? "#e3f2fd" : "#f5f5f5",
            padding: "8px 12px",
            borderRadius: "8px",
            margin: "4px 0"
          }}>
            <strong>{msg.role === "user" ? "You: " : "Bot: "}</strong> {msg.text}
          </p>
        ))}
      </div>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <div style={{ display: "flex", gap: "10px" }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..." 
          style={{ 
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
          disabled={isLoading || !isServerConnected}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !isServerConnected}
          style={{
            padding: "8px 16px",
            backgroundColor: isLoading || !isServerConnected ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading || !isServerConnected ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
