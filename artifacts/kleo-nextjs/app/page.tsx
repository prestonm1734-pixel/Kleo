'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeScreen from '@/components/HomeScreen';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import LucaStatusDot from '@/components/LucaStatusDot';
import LucaLogDrawer from '@/components/LucaLogDrawer';
import { getStoredUser, updateUser } from '@/lib/auth';
import {
  getConversations,
  createConversation,
  getConversation,
} from '@/lib/conversations';
import { User, Conversation } from '@/types';
import { useLucaSession } from '@/hooks/useLucaSession';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isChat, setIsChat] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showLucaLog, setShowLucaLog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(stored);
    setConversations(getConversations(stored.id));
    setLoading(false);
  }, []);

  // Luca session lives at the page level so its state survives navigation
  // between Home and Chat, and so the status dot reflects it from anywhere.
  const luca = useLucaSession({
    userId: user?.id ?? '',
  });

  function refreshConversations() {
    if (!user) return;
    setConversations(getConversations(user.id));
  }

  function handleSendFromHome(text: string, attachments?: File[]) {
    if (!user) return;
    const convo = createConversation(user.id, 'alex', text);
    setActiveConversation(convo);
    setIsChat(true);
    refreshConversations();
    sessionStorage.setItem(
      'kleo_pending_message',
      JSON.stringify({ text, hasAttachments: !!attachments?.length })
    );
  }

  function handleNewConversation() {
    setActiveConversation(null);
    setIsChat(false);
  }

  function handleSelectConversation(id: string) {
    if (!user) return;
    const convo = getConversation(user.id, id);
    if (convo) {
      setActiveConversation(convo);
      setIsChat(true);
    }
  }

  function handleUserChange(u: User) {
    setUser(u);
    updateUser(u);
  }

  async function handleRunLuca() {
    if (luca.isRunning) return;
    // Drop into chat view so the terminal is visible (creates a thin convo if needed)
    if (!isChat && user) {
      const convo = createConversation(user.id, 'luca', 'Luca scan');
      setActiveConversation(convo);
      setIsChat(true);
      refreshConversations();
    }
    await luca.run();
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100dvh', background: '#0B0B0F' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid #7B6FE8',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        background: '#0B0B0F',
        overflow: 'hidden',
      }}
    >
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <div className="sidebar-desktop">
        <Sidebar
          mode="desktop"
          user={user}
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onConversationsChange={refreshConversations}
          lucaIsRunning={luca.isRunning}
          lucaPastSessions={luca.pastSessions}
          onRunLuca={handleRunLuca}
          onOpenLucaLog={() => setShowLucaLog(true)}
        />
      </div>

      {/* Mobile overlay sidebar */}
      {showMobileSidebar && (
        <Sidebar
          mode="mobile-overlay"
          user={user}
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onConversationsChange={refreshConversations}
          onClose={() => setShowMobileSidebar(false)}
          lucaIsRunning={luca.isRunning}
          lucaPastSessions={luca.pastSessions}
          onRunLuca={handleRunLuca}
          onOpenLucaLog={() => setShowLucaLog(true)}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isChat && activeConversation ? (
          <ChatInterface
            user={user}
            conversation={activeConversation}
            onNewConversation={handleNewConversation}
            onConversationsChange={refreshConversations}
            onUserChange={handleUserChange}
            onOpenMobileSidebar={() => setShowMobileSidebar(true)}
            lucaSession={luca.session}
          />
        ) : (
          <HomeScreen
            user={user}
            onSendMessage={handleSendFromHome}
            onOpenMobileSidebar={() => setShowMobileSidebar(true)}
            onRunLuca={handleRunLuca}
            lucaIsRunning={luca.isRunning}
          />
        )}
      </div>

      {/* Global Luca status indicator */}
      <LucaStatusDot
        userId={user.id}
        activeSession={luca.session}
        onClick={() => setShowLucaLog(true)}
      />

      <LucaLogDrawer
        userId={user.id}
        open={showLucaLog}
        onClose={() => setShowLucaLog(false)}
      />
    </div>
  );
}
