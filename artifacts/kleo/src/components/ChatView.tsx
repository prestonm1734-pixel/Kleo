import { useRef, useEffect } from 'react';
import Composer from './Composer';
import Icon from './Icon';
import { Message } from '../types';

interface ChatViewProps {
  messages: Message[];
  streamingContent: string;
  thinking: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onFollowup: (text: string) => void;
}

function UserInitials({ email }: { email?: string }) {
  return email ? email.slice(0, 2).toUpperCase() : 'U';
}

function MessageBubble({ message, isStreaming, streamContent }: {
  message: Message;
  isStreaming?: boolean;
  streamContent?: string;
}) {
  const content = isStreaming ? streamContent ?? '' : message.content;

  const copyToClipboard = () => navigator.clipboard.writeText(message.content);

  return (
    <div className={`msg ${message.role}`}>
      <div className="who-mark">
        {message.role === 'user' ? <UserInitials /> : null}
      </div>
      <div className="bubble">
        <div className="meta">
          {message.role === 'user'
            ? `You · ${new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : 'Kleo · ' + new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="body">
          {message.role === 'user' ? (
            <p>{content}</p>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content}
              {isStreaming && <span className="streaming-cursor" />}
            </div>
          )}
        </div>
        {message.role === 'assistant' && !isStreaming && (
          <div className="msg-actions">
            <button className="act-btn" onClick={copyToClipboard}>
              <Icon name="copy" size={13} /> Copy
            </button>
            <button className="act-btn">
              <Icon name="thumbup" size={13} />
            </button>
            <button className="act-btn">
              <Icon name="thumbdown" size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatView({ messages, streamingContent, thinking, draft, setDraft, onSend, onFollowup }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking, streamingContent]);

  const isStreaming = streamingContent !== '';

  return (
    <div className="chat-wrap">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="thread">
          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1;
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isStreaming={isLast && m.role === 'assistant' && isStreaming}
                streamContent={isLast && m.role === 'assistant' ? streamingContent : undefined}
              />
            );
          })}

          {thinking && !isStreaming && (
            <div className="msg assistant">
              <div className="who-mark" />
              <div className="bubble">
                <div className="meta">Kleo</div>
                <div className="thinking">
                  <span className="dot-anim" /> Thinking
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-compose-wrap">
        <div className="chat-compose">
          <Composer
            value={draft}
            onChange={setDraft}
            onSend={onSend}
            placeholder="Reply to Kleo…"
            disabled={thinking || isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
