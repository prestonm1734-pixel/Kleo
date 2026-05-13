import { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import KleoSidebar from './components/KleoSidebar';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import Icon from './components/Icon';
import { User, Conversation, Message } from './types';
import { getCurrentUser, onAuthStateChange, signOut } from './lib/auth';
import { getConversations, createConversation, addMessage } from './lib/conversations';
import { streamChat } from './lib/gemini';

export default function App() {
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sbCollapsed, setSbCollapsed] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => setUser(u));
    const unsub = onAuthStateChange((u) => {
      setUser(u);
      if (!u) { setConversations([]); setView('home'); setActiveConvId(null); }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user && user !== 'loading') {
      getConversations(user.id).then(setConversations);
    }
  }, [user]);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const sendMessage = useCallback(async (text: string, convId?: string) => {
    if (!user || user === 'loading' || !text.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    let targetConvId = convId ?? activeConvId;

    if (!targetConvId) {
      const newConv = await createConversation(user.id, text.trim());
      targetConvId = newConv.id;
      setConversations((prev) => [{ ...newConv, messages: [userMsg] }, ...prev]);
      setActiveConvId(newConv.id);
    } else {
      setConversations((prev) => prev.map((c) =>
        c.id === targetConvId ? { ...c, messages: [...c.messages, userMsg] } : c
      ));
    }

    setView('chat');
    setDraft('');
    setThinking(true);

    await addMessage(user.id, targetConvId, userMsg);

    const convMessages = [
      ...(conversations.find((c) => c.id === targetConvId)?.messages ?? []),
      userMsg,
    ].map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const placeholderId = crypto.randomUUID();
    const placeholderMsg: Message = {
      id: placeholderId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setThinking(false);
    setStreamingContent('');
    setConversations((prev) => prev.map((c) =>
      c.id === targetConvId ? { ...c, messages: [...c.messages, placeholderMsg] } : c
    ));

    let fullResponse = '';
    await streamChat(convMessages, (chunk) => {
      fullResponse += chunk;
      setStreamingContent(fullResponse);
    });

    const finalMsg: Message = { ...placeholderMsg, content: fullResponse };
    await addMessage(user.id, targetConvId, finalMsg);

    setConversations((prev) => prev.map((c) =>
      c.id === targetConvId
        ? {
            ...c,
            messages: c.messages.map((m) => m.id === placeholderId ? finalMsg : m),
            updatedAt: new Date().toISOString(),
          }
        : c
    ));
    setStreamingContent('');
    getConversations(user.id).then(setConversations);
  }, [user, activeConvId, conversations]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setConversations([]);
    setActiveConvId(null);
    setView('home');
  };

  if (user === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Kleo
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={(u) => setUser(u)} />;
  }

  return (
    <div className={`app ${sbCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!sbCollapsed && (
        <KleoSidebar
          user={user}
          conversations={conversations}
          activeId={activeConvId}
          onSelect={(id) => { setActiveConvId(id); setView('chat'); setStreamingContent(''); }}
          onNew={() => { setActiveConvId(null); setView('home'); setDraft(''); setStreamingContent(''); setThinking(false); }}
          onCollapse={() => setSbCollapsed(true)}
          onSignOut={handleSignOut}
        />
      )}

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            {sbCollapsed && (
              <button className="tb-btn" onClick={() => setSbCollapsed(false)} title="Open sidebar">
                <Icon name="panel" size={15} />
              </button>
            )}
            <button className="tb-btn" onClick={() => { setActiveConvId(null); setView('home'); setDraft(''); }} title="New conversation">
              <Icon name="edit" size={14} />
            </button>
            <div className="tb-title" style={{ marginLeft: 6 }}>
              <span className="crumb">Kleo</span>
              <span className="sep">/</span>
              <span>{view === 'home' ? 'Home' : (activeConv?.title || 'New conversation')}</span>
            </div>
          </div>
          <div className="topbar-right">
            <button className="tb-btn" title="Notifications">
              <Icon name="bell" size={15} />
            </button>
            <button className="tb-btn" title="More">
              <Icon name="more" size={16} />
            </button>
          </div>
        </div>

        {view === 'home' ? (
          <HomeView
            firstName={user.firstName || user.email.split('@')[0]}
            draft={draft}
            setDraft={setDraft}
            onSend={() => { if (draft.trim()) sendMessage(draft); }}
          />
        ) : (
          <ChatView
            messages={activeConv?.messages ?? []}
            streamingContent={streamingContent}
            thinking={thinking}
            draft={draft}
            setDraft={setDraft}
            onSend={() => { if (draft.trim() && activeConvId) sendMessage(draft, activeConvId); }}
            onFollowup={(text) => setDraft(text)}
          />
        )}
      </div>
    </div>
  );
}
