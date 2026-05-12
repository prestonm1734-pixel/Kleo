'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Edit3 } from 'lucide-react';
import InputBar from './InputBar';
import MessageBubble from './MessageBubble';
import UpgradeModal from './UpgradeModal';
import KleoLogo from './KleoLogo';
import { Message, User, Conversation } from '@/types';
import { addMessage, updateConversation } from '@/lib/conversations';
import { getRemainingMessages, incrementMessageCount } from '@/lib/auth';

interface ChatInterfaceProps {
  user: User;
  conversation: Conversation;
  onNewConversation: () => void;
  onConversationsChange: () => void;
  onUserChange: (user: User) => void;
  onOpenMobileSidebar: () => void;
}

export default function ChatInterface({
  user,
  conversation,
  onNewConversation,
  onConversationsChange,
  onUserChange,
  onOpenMobileSidebar,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.id]);

  // Auto-send the first message passed from home screen
  useEffect(() => {
    const pending = sessionStorage.getItem('kleo_pending_message');
    if (pending && conversation.messages.length === 0) {
      sessionStorage.removeItem('kleo_pending_message');
      try {
        const { text } = JSON.parse(pending);
        if (text) setTimeout(() => handleSendMessage(text), 100);
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function handleSendMessage(text: string, attachments?: File[]) {
    const remaining = getRemainingMessages(currentUser);
    if (currentUser.tier === 'free' && remaining <= 0) {
      setShowUpgrade(true);
      return;
    }

    if (currentUser.tier === 'free') {
      const updated = incrementMessageCount(currentUser);
      setCurrentUser(updated);
      onUserChange(updated);
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    addMessage(currentUser.id, conversation.id, userMsg);

    let fileContent = '';
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        if (file.type.startsWith('text/') || file.name.endsWith('.csv')) {
          const content = await file.text();
          fileContent += `\n\n[Attached file: ${file.name}]\n${content.slice(0, 3000)}`;
        } else {
          fileContent += `\n\n[Attached file: ${file.name} (${file.type})]`;
        }
      }
    }

    setIsStreaming(true);
    setStreamingContent('');

    try {
      abortRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          fileContent,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const t = JSON.parse(data).text || '';
              if (t) { full += t; setStreamingContent(full); }
            } catch {}
          }
        }
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: full || 'I could not generate a response. Please check your API key.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addMessage(currentUser.id, conversation.id, assistantMsg);
      updateConversation(currentUser.id, conversation.id, {});
      onConversationsChange();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Please check your API key and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F2F1EE' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: '#F2F1EE',
        }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="sidebar-hamburger items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
        >
          <Menu size={19} style={{ color: '#555' }} />
        </button>

        {/* Kleo identity — center */}
        <div className="flex items-center gap-2">
          <KleoLogo size={22} bgColor="#F2F1EE" accentColor="#505A98" />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
            }}
          >
            Kleo
          </span>
        </div>

        {/* New conversation */}
        <button
          onClick={onNewConversation}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
          title="New conversation"
        >
          <Edit3 size={17} style={{ color: '#555' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 16, paddingBottom: 8 }}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} isStreaming={false} />
        ))}

        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: new Date(),
            }}
            isStreaming
          />
        )}

        {isStreaming && !streamingContent && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 16px' }}>
            <div className="flex gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    background: '#BBBBBB',
                    animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0" style={{ padding: '8px 16px 24px', background: '#F2F1EE' }}>
        <InputBar
          onSend={handleSendMessage}
          placeholder="Ask Kleo anything about your finances..."
          disabled={isStreaming}
          tier={currentUser.tier}
          messageCount={currentUser.messageCount}
          messageCountDate={currentUser.messageCountDate}
        />
      </div>

      {showUpgrade && (
        <UpgradeModal
          user={currentUser}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={(tier) => {
            const updated = { ...currentUser, tier };
            setCurrentUser(updated);
            onUserChange(updated);
          }}
        />
      )}
    </div>
  );
}
