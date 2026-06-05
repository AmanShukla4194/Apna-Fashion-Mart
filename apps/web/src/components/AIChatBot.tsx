'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Minimize2, RefreshCw, Send, Sparkles, Trash2, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const SUGGESTIONS = [
  'What styles are trending?',
  'Find ethnic wear near me',
  'How do I track my order?',
  'Return policy?',
  'Same-day delivery?',
];

const GREETING: Message = {
  role: 'assistant',
  content:
    "Namaste! 👋 I'm **Apna AI**, your personal style assistant.\n\n" +
    'I can help you discover **local boutiques**, find the perfect outfit, track **orders**, ' +
    'or answer anything about Apna Fashion Mart.\n\nWhat can I help you with today?',
};

function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

function MsgBubble({ msg, isLast, loading }: { msg: Message; isLast: boolean; loading: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-chat-msg ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="ai-chat-msg-avatar"><Sparkles size={12}/></div>
      )}
      <div className={`ai-chat-bubble-msg${msg.error ? ' ai-chat-bubble-error' : ''}`}>
        {msg.content
          ? msg.content.split('\n').map((line, li, arr) => (
              <React.Fragment key={li}>
                {renderText(line)}
                {li < arr.length - 1 && <br/>}
              </React.Fragment>
            ))
          : isLast && loading
            ? <span className="ai-typing"><span/><span/><span/></span>
            : null}
      </div>
    </div>
  );
}

export default function AIChatBot() {
  const [open, setOpen]           = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages]   = useState<Message[]>([GREETING]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [isMobile, setIsMobile]   = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Detect mobile to switch to full-screen mode
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimised]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, minimised]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isMobile && open && !minimised) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, open, minimised]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content };
    const history = [...messages, userMsg];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      });

      // Handle error responses
      if (!res.ok) {
        let errMsg = 'Sorry, I had trouble responding. Please try again.';
        try {
          const data = await res.json();
          if (res.status === 503) errMsg = '⚙️ Apna AI is not yet configured. The admin needs to add the GROQ_API_KEY in Amplify environment variables.';
          else if (res.status === 401) errMsg = '🔑 API key issue. Please contact support.';
          else if (data?.error) errMsg = data.error;
        } catch { /* ignore parse error */ }
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: errMsg, error: true },
        ]);
        return;
      }

      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map((m, i) => i === prev.length - 1 ? { ...m, content: accumulated } : m)
        );
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Connection error — please check your internet and try again.', error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([GREETING]);

  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* ── FAB button ───────────────────────────────────────────── */}
      {!open && (
        <button className="ai-chat-bubble" onClick={() => setOpen(true)} aria-label="Open Apna AI">
          <Sparkles size={20}/>
          <span className="ai-chat-bubble-label">Apna AI</span>
        </button>
      )}

      {/* ── Chat panel ───────────────────────────────────────────── */}
      {open && (
        <>
          {/* Mobile backdrop */}
          {isMobile && !minimised && (
            <div className="ai-mobile-backdrop" onClick={() => setOpen(false)}/>
          )}

          <div className={`ai-chat-panel${minimised ? ' minimised' : ''}${isMobile ? ' mobile' : ''}`}>
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-left">
                <div className="ai-chat-avatar"><Sparkles size={16}/></div>
                <div>
                  <div className="ai-chat-name">Apna AI</div>
                  <div className="ai-chat-status">
                    <span className={`ai-chat-dot${loading ? ' thinking' : ''}`}/>
                    {loading ? 'Thinking…' : 'Online · always here to help'}
                  </div>
                </div>
              </div>
              <div className="ai-chat-header-actions">
                <button onClick={clearChat} aria-label="Clear chat" title="Clear chat">
                  <Trash2 size={14}/>
                </button>
                <button onClick={() => setMinimised(m => !m)} aria-label="Minimise">
                  <Minimize2 size={14}/>
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X size={15}/>
                </button>
              </div>
            </div>

            {!minimised && (
              <>
                {/* Messages */}
                <div className="ai-chat-messages">
                  {messages.map((msg, i) => (
                    <MsgBubble key={i} msg={msg} isLast={i === messages.length - 1} loading={loading}/>
                  ))}
                  {/* Retry button after error */}
                  {messages[messages.length - 1]?.error && !loading && (
                    <div style={{ display:'flex', justifyContent:'center', marginTop: 8 }}>
                      <button
                        onClick={() => {
                          const lastUser = [...messages].reverse().find(m => m.role === 'user');
                          if (lastUser) { setMessages(prev => prev.slice(0, -1)); send(lastUser.content); }
                        }}
                        style={{ display:'flex', alignItems:'center', gap:6, font:'500 12px Poppins', color:'var(--magenta-600)', background:'none', border:'1px solid var(--magenta-600)', borderRadius:99, padding:'6px 14px', cursor:'pointer' }}
                      >
                        <RefreshCw size={12}/> Retry
                      </button>
                    </div>
                  )}
                  <div ref={bottomRef}/>
                </div>

                {/* Suggestion chips */}
                {showSuggestions && (
                  <div className="ai-chat-suggestions">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} className="ai-suggestion-chip" onClick={() => send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Compact chips while chatting */}
                {!showSuggestions && !loading && (
                  <div className="ai-compact-chips">
                    {SUGGESTIONS.slice(0, 3).map((s, i) => (
                      <button key={i} className="ai-compact-chip" onClick={() => send(s)}>{s}</button>
                    ))}
                  </div>
                )}

                {/* Input bar */}
                <div className="ai-chat-input-row">
                  <input
                    ref={inputRef}
                    className="ai-chat-input"
                    placeholder="Ask about styles, orders, boutiques…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={loading}
                    maxLength={500}
                    autoComplete="off"
                  />
                  <button
                    className="ai-send-btn"
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    aria-label="Send"
                  >
                    {loading ? <Loader2 size={16} className="ai-spin"/> : <Send size={16}/>}
                  </button>
                </div>
                <div className="ai-chat-footer">Powered by Apna Fashion Mart</div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
