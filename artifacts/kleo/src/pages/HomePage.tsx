import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import HomeScreen from '../components/HomeScreen';
import ChatInterface from '../components/ChatInterface';
import UpgradeModal from '../components/UpgradeModal';
import { getStoredUser } from '../lib/auth';
import {
  getConversations,
  createConversation,
  getConversation,
} from '../lib/conversations';
import { User, Conversation } from '../types';

export default function HomePage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isChat, setIsChat] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      navigate('/login');
      return;
    }
    setUser(stored);
    const convos = getConversations(stored.id);
    setConversations(convos);
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
    sessionStorage.setItem('kleo_pending_message', JSON.stringify({ text, hasAttachments: !!attachments?.length }));
  }

  function handleNewConversation() {
    if (!user) return;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#F2F1EE' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #505A98', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {isChat && activeConversation ? (
        <ChatInterface
          user={user}
          conversation={activeConversation}
          allConversations={conversations}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onConversationsChange={refreshConversations}
          onUserChange={(u) => setUser(u)}
        />
      ) : (
        <HomeScreen user={user} onSendMessage={handleSendFromHome} />
      )}
    </>
  );
}
