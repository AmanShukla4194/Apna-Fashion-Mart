'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Minimize2, Send, Sparkles, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What styles are trending this season?',
  'Help me find ethnic wear near me',
  'How do I track my order?',
  'What is your return policy?',
  'How does same-day delivery work?',
];

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! 👋 I'm **Apna AI**, your personal style assistant. I can help you discover local boutiques, find the perfect outfit, track orders, or answer any questions about Apna Fashion Mart.\n\nWhat can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimised, messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map((m, i) => i === prev.length - 1 ? { ...m, content: accumulated } : m)
        );
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: 'Sorry, I had trouble connecting. Please try again.' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const renderContent = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          className="ai-chat-bubble"
          onClick={() => setOpen(true)}
          aria-label="Open Apna AI chat"
        >
          <Sparkles size={22} />
          <span className="ai-chat-bubble-label">Apna AI</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={`ai-chat-panel ${minimised ? 'minimised' : ''}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-chat-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="ai-chat-name">Apna AI</div>
                <div className="ai-chat-status">
                  <span className="ai-chat-dot"></span>
                  {loading ? 'Thinking…' : 'Online · always here to help'}
                </div>
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <button onClick={() => setMinimised(m => !m)} aria-label="Minimise">
                <Minimize2 size={15} />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div className="ai-chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-chat-msg ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="ai-chat-msg-avatar"><Sparkles size={12} /></div>
                    )}
                    <div className="ai-chat-bubble-msg">
                      {msg.content
                        ? msg.content.split('\n').map((line, li) => (
                            <React.Fragment key={li}>
                              {renderContent(line)}
                              {li < msg.content.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))
                        : loading && i === messages.length - 1
                          ? <span className="ai-typing"><span></span><span></span><span></span></span>
                          : null}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions (show only when 1 message = initial greeting) */}
              {messages.length === 1 && (
                <div className="ai-chat-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="ai-suggestion-chip" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="ai-chat-input-row">
                <input
                  ref={inputRef}
                  className="ai-chat-input"
                  placeholder="Ask about styles, orders, boutiques…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  aria-label="Send"
                >
                  {loading ? <Loader2 size={16} className="ai-spin" /> : <Send size={16} />}
                </button>
              </div>
              <div className="ai-chat-footer">Powered by Claude · Apna Fashion Mart</div>
            </>
          )}
        </div>
      )}
    </>
  );
}
