'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { getAgentById } from '@/lib/agents';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agent = message.agentId ? getAgentById(message.agentId) : null;

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 px-4">
        <div
          className="max-w-[75%] px-4 py-3"
          style={{
            background: '#505A98',
            color: 'white',
            borderRadius: '18px 18px 4px 18px',
            fontSize: 17,
            fontWeight: 500,
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-4 px-4">
      {/* Agent identifier */}
      {agent && (
        <div
          className="flex items-center gap-1.5 mb-2"
          style={{ fontSize: 10, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: agent.avatarColor,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span>{agent.name}</span>
        </div>
      )}

      {/* Response card */}
      <div
        className="max-w-[85%]"
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        <div className="prose-kleo">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p style={{ marginBottom: '0.75em', lineHeight: 1.6 }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: 600 }}>{children}</strong>
              ),
              em: ({ children }) => <em>{children}</em>,
              h1: ({ children }) => (
                <h1 style={{ fontSize: '1.3em', fontWeight: 600, marginBottom: '0.5em', marginTop: '1em' }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontSize: '1.15em', fontWeight: 600, marginBottom: '0.5em', marginTop: '1em' }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontSize: '1.05em', fontWeight: 600, marginBottom: '0.4em', marginTop: '0.8em' }}>{children}</h3>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: '1.5em', marginBottom: '0.75em' }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ paddingLeft: '1.5em', marginBottom: '0.75em' }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: '0.25em' }}>{children}</li>
              ),
              hr: () => (
                <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '1em 0' }} />
              ),
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <pre style={{ background: 'rgba(0,0,0,0.06)', padding: '0.75em 1em', borderRadius: 8, overflowX: 'auto', marginBottom: '0.75em' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code style={{ fontFamily: 'monospace', fontSize: '0.9em', background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.3em', borderRadius: 4 }}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span
              className="inline-block ml-0.5"
              style={{
                width: 2,
                height: '1em',
                background: '#505A98',
                verticalAlign: 'text-bottom',
                animation: 'blink 1s step-end infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
