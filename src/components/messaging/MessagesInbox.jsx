import React, { useState, useEffect, useRef } from 'react';
import './MessagesInbox.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const MessagesInbox = ({ user, sessionToken }) => {
  const [conversations,    setConversations]    = useState([]);
  const [activeConvo,      setActiveConvo]      = useState(null); // { otherUserId, otherUsername }
  const [messages,         setMessages]         = useState([]);
  const [newMessage,       setNewMessage]       = useState('');
  const [loadingInbox,     setLoadingInbox]     = useState(true);
  const [loadingMessages,  setLoadingMessages]  = useState(false);
  const [sending,          setSending]          = useState(false);
  const messagesEndRef = useRef(null);

  const token = sessionToken || localStorage.getItem('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };

  // ── Load inbox on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchInbox();
  }, []);

  // ── Auto-scroll to latest message ─────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchInbox = async () => {
    setLoadingInbox(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/messages/inbox`, { headers: authHeader });
      const data = await res.json();
      if (data.success) setConversations(data.conversations);
    } catch (err) {
      console.error('Inbox fetch error:', err);
    } finally {
      setLoadingInbox(false);
    }
  };

  // ── Open a conversation ────────────────────────────────────────────────
  const openConversation = async (convo) => {
    setActiveConvo(convo);
    setLoadingMessages(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/messages/conversation/${convo.otherUserId}`, { headers: authHeader });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (err) {
      console.error('Conversation fetch error:', err);
    } finally {
      setLoadingMessages(false);
    }
    // Refresh inbox to clear unread badge
    fetchInbox();
  };

  // ── Send a reply ───────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvo) return;
    setSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body:    JSON.stringify({
          receiverId: activeConvo.otherUserId,
          carId:      activeConvo.carId || null,
          content:    newMessage.trim()
        })
      });
      const data = await res.json();

      if (data.success) {
        // Optimistically add message to the thread
        const optimistic = {
          id:          Date.now(),
          senderId:    user.id,
          senderName:  user.username,
          receiverId:  activeConvo.otherUserId,
          content:     newMessage.trim(),
          createdAt:   new Date().toISOString(),
          isRead:      false
        };
        setMessages(prev => [...prev, optimistic]);
        setNewMessage('');
        // Refresh inbox for latest preview
        fetchInbox();
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)   return 'just now';
    if (diffMins < 60)  return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="inbox-panel">

      {/* ── Conversation list (left) ── */}
      <div className="inbox-sidebar">
        <div className="inbox-sidebar-header">
          <h3>Messages</h3>
          <button className="inbox-refresh" onClick={fetchInbox} title="Refresh">↻</button>
        </div>

        {loadingInbox ? (
          <div className="inbox-loading">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="inbox-empty">
            <span>✉️</span>
            <p>No messages yet</p>
            <small>Browse cars and contact a seller to start a conversation.</small>
          </div>
        ) : (
          <ul className="convo-list">
            {conversations.map(convo => (
              <li
                key={convo.otherUserId}
                className={`convo-item ${activeConvo?.otherUserId === convo.otherUserId ? 'active' : ''}`}
                onClick={() => openConversation(convo)}
              >
                <div className="convo-avatar">
                  {(convo.otherUsername || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="convo-info">
                  <div className="convo-top">
                    <span className="convo-name">{convo.otherUsername}</span>
                    <span className="convo-time">{formatTime(convo.latestTime)}</span>
                  </div>
                  <div className="convo-preview">
                    {convo.latestMessage?.length > 48
                      ? convo.latestMessage.slice(0, 48) + '…'
                      : convo.latestMessage}
                  </div>
                </div>
                {convo.unreadCount > 0 && (
                  <span className="unread-badge">{convo.unreadCount}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Chat area (right) ── */}
      <div className="inbox-chat">
        {!activeConvo ? (
          <div className="chat-placeholder">
            <span>💬</span>
            <h4>Select a conversation</h4>
            <p>Choose a conversation from the list to read and reply to messages.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="chat-header-bar">
              <div className="chat-header-avatar">
                {activeConvo.otherUsername.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="chat-header-name">{activeConvo.otherUsername}</div>
                {activeConvo.carId && (
                  <div className="chat-header-sub">Re: car listing</div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages-area">
              {loadingMessages ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-no-messages">No messages yet. Say hello!</div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user.id || msg.senderId === Number(user.id);
                  return (
                    <div key={msg.id || i} className={`msg-row ${isMe ? 'me' : 'them'}`}>
                      {!isMe && (
                        <div className="msg-avatar">
                          {(msg.senderName || activeConvo.otherUsername).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="msg-block">
                        <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                          {msg.content}
                        </div>
                        <div className="msg-time">{formatMsgTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="chat-reply-bar">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Reply to ${activeConvo.otherUsername}...`}
                rows={2}
                disabled={sending}
                className="chat-reply-input"
              />
              <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? '...' : '→'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesInbox;