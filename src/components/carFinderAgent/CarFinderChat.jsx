import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE_URL } from '../../config';
import './CarFinderChat.css';

const WELCOME = "Hi! I'm your AI car finder. Tell me what you're looking for — budget, body type, fuel type, or anything else — and I'll search our live inventory for you.";

export default function CarFinderChat({ onNavigate, sessionToken }) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    { role: 'agent', content: WELCOME, cars: [] }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // History in OpenAI format — sent to backend so the agent remembers context
  const historyRef = useRef([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message to UI immediately
    const userMsg = { role: 'user', content: text, cars: [] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Track in OpenAI history format
    historyRef.current.push({ role: 'user', content: text });

    try {
      const token = sessionToken || localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res  = await fetch(`${API_BASE_URL}/api/agent/car-finder`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ message: text, history: historyRef.current.slice(0, -1) }),
      });
      const data = await res.json();

      const agentReply = data.message || 'Sorry, I had trouble with that. Please try again.';
      const cars       = data.cars    || [];

      setMessages(prev => [...prev, { role: 'agent', content: agentReply, cars }]);

      // Add agent reply to history so next turn has full context
      historyRef.current.push({ role: 'assistant', content: agentReply });

      // Keep history bounded (last 10 turns = 20 messages) to avoid huge payloads
      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Connection error — please check your network and try again.',
        cars: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const resetChat = () => {
    setMessages([{ role: 'agent', content: WELCOME, cars: [] }]);
    historyRef.current = [];
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        className="cfa-trigger"
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open AI Car Finder"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
            >✕</motion.span>
          ) : (
            <motion.span key="open"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
            >
              {/* Car search icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <path d="M8 11h6M11 8v6"/>
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && <span className="cfa-trigger-label">AI Car Finder</span>}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="cfa-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="cfa-header">
              <div className="cfa-header-info">
                <div className="cfa-avatar">AI</div>
                <div>
                  <div className="cfa-header-title">Car Finder Agent</div>
                  <div className="cfa-header-sub">Searches live inventory</div>
                </div>
              </div>
              <button className="cfa-reset" onClick={resetChat} title="New conversation">↺</button>
            </div>

            {/* Messages */}
            <div className="cfa-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`cfa-msg-row cfa-msg-${msg.role}`}>
                  {msg.role === 'agent' && <div className="cfa-msg-avatar">AI</div>}

                  <div className="cfa-msg-content">
                    <div className="cfa-bubble">{msg.content}</div>

                    {/* Inline car cards — only appear with agent messages that found cars */}
                    {msg.cars && msg.cars.length > 0 && (
                      <div className="cfa-cars">
                        {msg.cars.map(car => (
                          <motion.div
                            key={car.id}
                            className="cfa-car-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ y: -3 }}
                            onClick={() => { onNavigate('car-detail', car); setIsOpen(false); }}
                          >
                            <div className="cfa-car-img">
                              <img
                                src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70'}
                                alt={`${car.year} ${car.make} ${car.model}`}
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70'; }}
                              />
                              {car.inspectionStatus === 'PASSED' && (
                                <span className="cfa-inspected">✓ Inspected</span>
                              )}
                            </div>
                            <div className="cfa-car-info">
                              <div className="cfa-car-name">{car.make} {car.model}</div>
                              <div className="cfa-car-price">${car.price?.toLocaleString()}</div>
                              <div className="cfa-car-specs">
                                <span>{car.year}</span>
                                <span>{car.mileage?.toLocaleString()} km</span>
                                <span>{car.fuel}</span>
                              </div>
                              <button className="cfa-view-btn">View Details →</button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="cfa-msg-row cfa-msg-agent">
                  <div className="cfa-msg-avatar">AI</div>
                  <div className="cfa-bubble cfa-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="cfa-input-row">
              <textarea
                className="cfa-input"
                placeholder="e.g. SUV under $45k, petrol, low mileage…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={loading}
              />
              <motion.button
                className="cfa-send"
                onClick={send}
                disabled={!input.trim() || loading}
                whileTap={{ scale: 0.92 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
