// src/components/messaging/MessagesInbox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../../config';
import './MessagesInbox.css';

const MessagesInbox = ({ user, sessionToken }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const activeConvoRef = useRef(null);

  const token = sessionToken || localStorage.getItem('token');

  useEffect(() => {
    if (!user) return;
    fetchInbox();
    connectWebSocket();
    return () => { if (stompClient.current) stompClient.current.deactivate(); };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep ref in sync so WebSocket handler can access latest value
  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/user/${user.id}/queue/messages`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          const currentConvo = activeConvoRef.current;
          if (currentConvo &&
            (newMsg.senderId === currentConvo || newMsg.receiverId === currentConvo)) {
            setMessages(prev => [...prev, newMsg]);
          }
          fetchInbox();
        });
      },
      onDisconnect: () => setConnected(false),
      reconnectDelay: 5000,
    });
    client.activate();
    stompClient.current = client;
  };

  const fetchInbox = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/inbox`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) setConversations(data.conversations);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openConversation = async (otherUserId) => {
    setActiveConvo(otherUserId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/conversation/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages || data.messages);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConvo) return;

    const msgData = {
      senderId: user.id,
      receiverId: activeConvo,
      content: inputText.trim(),
      carId: null
    };

    if (stompClient.current && connected) {
      stompClient.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(msgData)
      });
    } else {
      await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeConvo, content: inputText.trim() })
      });
    }

    // Optimistically add to UI
    setMessages(prev => [...prev, {
      id: Date.now(),
      senderId: user.id,
      receiverId: activeConvo,
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
      isRead: false
    }]);
    setInputText('');
    fetchInbox();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConvoData = conversations.find(c => c.otherUserId === activeConvo);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return formatTime(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="inbox-panel">

      {/* ── SIDEBAR ── */}
      <div className="inbox-sidebar">
        <div className="inbox-sidebar-header">
          <h3>Messages</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: '600',
              color: connected ? 'var(--green)' : 'var(--muted)'
            }}>
              {connected ? '● Live' : '○ Offline'}
            </span>
            <button className="inbox-refresh" onClick={fetchInbox} title="Refresh">↻</button>
          </div>
        </div>

        {loading ? (
          <div className="inbox-loading">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="inbox-empty">
            <span>💬</span>
            <p>No conversations yet</p>
            <small>Message a seller from a car listing</small>
          </div>
        ) : (
          <ul className="convo-list">
            {conversations.map(c => (
              <li
                key={c.otherUserId}
                className={`convo-item ${activeConvo === c.otherUserId ? 'active' : ''}`}
                onClick={() => openConversation(c.otherUserId)}
              >
                <div className="convo-avatar">
                  {c.otherUsername?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="convo-info">
                  <div className="convo-top">
                    <span className="convo-name">{c.otherUsername || 'Unknown'}</span>
                    <span className="convo-time">{formatDate(c.latestTime)}</span>
                  </div>
                  <span className="convo-preview">{c.latestMessage || 'No messages yet'}</span>
                </div>
                {c.unreadCount > 0 && (
                  <span className="unread-badge">{c.unreadCount}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── CHAT AREA ── */}
      <div className="inbox-chat">
        {!activeConvo ? (
          <div className="chat-placeholder">
            <span>💬</span>
            <h4>Select a conversation</h4>
            <p>Choose a conversation from the left, or message a seller from a car listing.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-header-bar">
              <div className="chat-header-avatar">
                {activeConvoData?.otherUsername?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="chat-header-name">
                  {activeConvoData?.otherUsername || 'Unknown'}
                </div>
                <div className="chat-header-sub">
                  {connected ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages-area">
              {messages.length === 0 && (
                <div className="chat-no-messages">
                  Start the conversation below 👇
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`msg-row ${msg.senderId === user.id ? 'me' : 'them'}`}
                >
                  {msg.senderId !== user.id && (
                    <div className="msg-avatar">
                      {activeConvoData?.otherUsername?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="msg-block">
                    <div className={`msg-bubble ${msg.senderId === user.id ? 'me' : 'them'}`}>
                      {msg.content}
                    </div>
                    <span className="msg-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-reply-bar">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (Enter to send)"
                rows={2}
                className="chat-reply-input"
                disabled={!connected}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="chat-send-btn"
              >
                ↑
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesInbox;