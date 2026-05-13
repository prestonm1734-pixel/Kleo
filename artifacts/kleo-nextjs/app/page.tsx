'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeScreen from '@/components/HomeScreen';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import { getStoredUser, updateUser } from '@/lib/auth';
import {
  getConversations,
  createConversation,
  getConversation,
} from '@/lib/conversations';
import { User, Conversation } from '@/types';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isChat, setIsChat] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100dvh', background: '#F2F1EE' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid #505A98',
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
        background: '#F2F1EE',
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
          />
        ) : (
          <HomeScreen
            user={user}
            onSendMessage={handleSendFromHome}
            onOpenMobileSidebar={() => setShowMobileSidebar(true)}
          />
        )}
      </div>
    </div>
  );
}
