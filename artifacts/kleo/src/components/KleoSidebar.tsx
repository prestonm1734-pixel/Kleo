import { useState } from 'react';
import Icon from './Icon';
import { Conversation, User } from '../types';

const SUGGESTIONS_DATA = [
  { id: 'c1', group: 'Today', title: 'Buying a house in 3 years' },
  { id: 'c2', group: 'Today', title: 'Did I overspend on dining out?' },
  { id: 'c3', group: 'Yesterday', title: 'Roth vs Traditional 401(k)' },
  { id: 'c4', group: 'Yesterday', title: 'Negotiating my Comcast bill' },
];

interface KleoSidebarProps {
  user: User;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onCollapse: () => void;
  onSignOut: () => void;
}

function groupConversations(convos: Conversation[]): Record<string, Conversation[]> {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {};
  convos.forEach((c) => {
    const d = new Date(c.updatedAt);
    let group: string;
    if (d.toDateString() === today) group = 'Today';
    else if (d.toDateString() === yesterday) group = 'Yesterday';
    else if (d >= weekAgo) group = 'This week';
    else group = 'Earlier';
    (groups[group] = groups[group] || []).push(c);
  });
  return groups;
}

export default function KleoSidebar({ user, conversations, activeId, onSelect, onNew, onCollapse, onSignOut }: KleoSidebarProps) {
  const [query, setQuery] = useState('');
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );
  const groups = groupConversations(filtered);
  const groupOrder = ['Today', 'Yesterday', 'This week', 'Earlier'];

  return (
    <aside className="sidebar">
      <div className="sb-head">
        <div className="brand">
          <span className="brand-mark" />
          <span>Kleo</span>
        </div>
        <button className="sb-icon-btn" onClick={onCollapse} title="Collapse sidebar">
          <Icon name="panel" size={16} />
        </button>
      </div>

      <button className="sb-new" onClick={onNew}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon name="edit" size={14} />
          New conversation
        </span>
        <kbd>⌘ N</kbd>
      </button>

      <div className="sb-search">
        <Icon name="search" size={14} />
        <input
          placeholder="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sb-list">
        {conversations.length === 0 && !query && SUGGESTIONS_DATA.map((c) => (
          <button key={c.id} className="sb-item" onClick={onNew}>
            <span className="dot" />
            <span className="title">{c.title}</span>
          </button>
        ))}

        {groupOrder.map((group) => {
          const items = groups[group];
          if (!items?.length) return null;
          return (
            <div key={group} className="sb-group">
              <div className="sb-group-label">{group}</div>
              {items.map((c) => (
                <button
                  key={c.id}
                  className={`sb-item ${activeId === c.id ? 'active' : ''}`}
                  onClick={() => onSelect(c.id)}
                  title={c.title}
                >
                  <span className="dot" />
                  <span className="title">{c.title}</span>
                </button>
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && query && (
          <div style={{ padding: '30px 14px', color: 'var(--ink-4)', fontSize: 13, textAlign: 'center' }}>
            No matches.
          </div>
        )}
      </div>

      <div className="sb-foot">
        <div className="avatar">{initials}</div>
        <div className="who">
          <div className="name">{user.firstName} {user.lastName}</div>
          <div className="plan">Kleo · Pro</div>
        </div>
        <button className="sb-icon-btn" title="Sign out" onClick={onSignOut}>
          <Icon name="logout" size={15} stroke={1.5} />
        </button>
      </div>
    </aside>
  );
}
