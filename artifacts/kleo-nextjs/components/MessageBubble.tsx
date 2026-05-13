'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        padding: '0 20px',
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );

  if (isUser) {
    return (
      <Wrapper>
        <div className="flex justify-end mb-2">
          <div
            style={{
              background: '#505A98',
              color: 'white',
              borderRadius: '16px 16px 4px 16px',
              padding: '10px 16px',
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.55,
              maxWidth: '75%',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="mb-4">
        <div
          className="prose-kleo"
          style={{ fontSize: 15, lineHeight: 1.65, color: '#1A1A1A' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p style={{ marginBottom: '0.8em', lineHeight: 1.65 }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: 600, color: '#111111' }}>{children}</strong>
              ),
              em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
              h1: ({ children }) => (
                <h1 style={{ fontSize: '1.25em', fontWeight: 600, margin: '1em 0 0.4em', color: '#111' }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontSize: '1.1em', fontWeight: 600, margin: '1em 0 0.4em', color: '#111' }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontSize: '1em', fontWeight: 600, margin: '0.8em 0 0.3em', color: '#111' }}>{children}</h3>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: '1.4em', marginBottom: '0.8em' }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ paddingLeft: '1.4em', marginBottom: '0.8em' }}>{children}</ol>
              ),
              li: ({ children }) => <li style={{ marginBottom: '0.2em' }}>{children}</li>,
              hr: () => (
                <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '1em 0' }} />
              ),
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <pre style={{ background: '#ECEAE4', padding: '12px 16px', borderRadius: 10, overflowX: 'auto', marginBottom: '0.8em', fontSize: '0.88em' }}>
                      <code style={{ fontFamily: 'monospace' }}>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code style={{ fontFamily: 'monospace', fontSize: '0.88em', background: '#ECEAE4', padding: '0.1em 0.35em', borderRadius: 4 }}>
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
              style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                background: '#505A98',
                verticalAlign: 'text-bottom',
                marginLeft: 1,
                animation: 'blink 1s step-end infinite',
              }}
            />
          )}
        </div>
      </div>
    </Wrapper>
  );
}
