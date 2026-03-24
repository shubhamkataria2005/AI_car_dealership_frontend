import React, { useState, useRef, useEffect } from 'react';
import './Tools.css';
import { API_BASE_URL } from '../../config';

const ChatAssistant = ({ user, sessionToken }) => {
  const [messages, setMessages] = useState([
    { text: `Hi ${user?.username}! 👋 I'm your AI car assistant. Ask me anything about our cars, financing, or the buying process!`, sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    'What cars do you have under $30k?',
    'How does financing work?',
    'Can I book a test drive?',
    'What does the inspection cover?',
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': sessionToken },
        body: JSON.stringify({ message: inputText })
      });
      const data = await response.json();
      setMessages(prev => [...prev, {
        text: data.error ? 'Authentication error. Please login again.' : data.response,
        sender: 'bot'
      }]);
    } catch {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting. Please try again.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>💬 AI Car Assistant</h2>
        <p>Ask anything about our inventory, pricing, or buying process</p>
      </div>

      <div className="quick-chips">
        {quickQuestions.map((q, i) => (
          <button key={i} className="quick-chip" onClick={() => setInputText(q)}>{q}</button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}`}>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-msg bot">
            <div className="chat-bubble loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about a car, price, or test drive..."
          rows={2}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !inputText.trim()} className="send-btn">
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;