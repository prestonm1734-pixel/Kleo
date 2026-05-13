'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Edit3 } from 'lucide-react';
import InputBar from './InputBar';
import MessageBubble from './MessageBubble';
import AgentSelector from './AgentSelector';
import FinanceTeamSheet from './FinanceTeamSheet';
import UpgradeModal from './UpgradeModal';
import { Message, User, Conversation } from '@/types';
import { routeMessage, getAgentById } from '@/lib/agents';
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
  const [streamingAgentId, setStreamingAgentId] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(conversation.agentId || 'alex');
  const [showTeamSheet, setShowTeamSheet] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(conversation.messages);
    setCurrentAgentId(conversation.agentId || 'alex');
  }, [conversation.id]);

  // Auto-send pending first message from home screen
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

  const agent = getAgentById(currentAgentId);

  async function handleSendMessage(text: string, attachments?: File[]) {
    const remaining = getRemainingMessages(currentUser);
    if (currentUser.tier === 'free' && remaining <= 0) {
      setShowUpgrade(true);
      return;
    }

    const routedAgentId = routeMessage(text, currentUser.tier);
    const targetAgentId = currentAgentId !== 'alex' ? currentAgentId : routedAgentId;
    setCurrentAgentId(targetAgentId);

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
    setStreamingAgentId(targetAgentId);

    try {
      abortRef.current = new AbortController();
      const agentObj = getAgentById(targetAgentId);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          agentId: targetAgentId,
          systemPrompt: agentObj?.systemPrompt || '',
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
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const t = parsed.text || '';
              if (t) { full += t; setStreamingContent(full); }
            } catch {}
          }
        }
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: full || 'I could not generate a response. Please check your API key.',
        agentId: targetAgentId,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addMessage(currentUser.id, conversation.id, assistantMsg);
      updateConversation(currentUser.id, conversation.id, { agentId: targetAgentId });
      onConversationsChange();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Please check your API key and try again.',
          agentId: targetAgentId,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingAgentId('');
    }
  }

  const inputPlaceholder = agent
    ? `Ask ${agent.name} about ${agent.role.toLowerCase()}...`
    : 'Ask me anything about your finances...';

  return (
    <div className="flex flex-col h-full" style={{ background: '#F2F1EE' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '10px 14px 10px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: '#F2F1EE',
        }}
      >
        {/* Mobile hamburger / desktop spacer */}
        <button
          onClick={onOpenMobileSidebar}
          className="sidebar-hamburger flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
        >
          <Menu size={19} style={{ color: '#555' }} />
        </button>

        <AgentSelector agentId={currentAgentId} onOpen={() => setShowTeamSheet(true)} />

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
              agentId: streamingAgentId,
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
      <div
        className="flex-shrink-0"
        style={{ padding: '8px 16px 24px', background: '#F2F1EE' }}
      >
        <InputBar
          onSend={handleSendMessage}
          placeholder={inputPlaceholder}
          disabled={isStreaming}
          tier={currentUser.tier}
          messageCount={currentUser.messageCount}
          messageCountDate={currentUser.messageCountDate}
        />
      </div>

      {showTeamSheet && (
        <FinanceTeamSheet
          currentAgentId={currentAgentId}
          userTier={currentUser.tier}
          onSelectAgent={(id) => {
            const a = getAgentById(id);
            if (!a) return;
            if (currentUser.tier === 'free' && a.tier !== 'free') {
              setShowTeamSheet(false); setShowUpgrade(true); return;
            }
            if (currentUser.tier === 'pro' && a.tier === 'elite') {
              setShowTeamSheet(false); setShowUpgrade(true); return;
            }
            setCurrentAgentId(id);
            updateConversation(currentUser.id, conversation.id, { agentId: id });
          }}
          onClose={() => setShowTeamSheet(false)}
        />
      )}

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
