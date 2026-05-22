'use client';

import { useRef, useState, useEffect } from 'react';
import { Paperclip, ArrowUp, X } from 'lucide-react';
import { getRemainingMessages } from '@/lib/auth';
import { User } from '@/types';

interface InputBarProps {
  onSend: (text: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  tier: User['tier'];
  messageCount: number;
  messageCountDate: string;
}

export default function InputBar({
  onSend,
  placeholder = 'Ask me anything about your finances...',
  disabled = false,
  tier,
  messageCount,
  messageCountDate,
}: InputBarProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fakeUser = { tier, messageCount, messageCountDate } as User;
  const remaining = getRemainingMessages(fakeUser);
  const isLimitReached = tier === 'free' && remaining === 0;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [text]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (!text.trim() || disabled || isLimitReached) return;
    onSend(text.trim(), files.length > 0 ? files : undefined);
    setText('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  const canSend = text.trim().length > 0 && !disabled && !isLimitReached;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Free tier counter */}
      {tier === 'free' && (
        <p
          style={{
            fontSize: 11,
            color: isLimitReached ? '#FF6B6B' : '#5A5A66',
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {isLimitReached
            ? 'Daily limit reached — upgrade to continue'
            : `${remaining} of 10 messages remaining today`}
        </p>
      )}

      {/* File chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 px-1">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
              style={{ background: '#1C1C24', color: '#F2F1EE', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="truncate max-w-[110px]">{f.name}</span>
              <button
                onClick={() => removeFile(i)}
                className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        className="input-bar-focus flex items-end gap-2 rounded-2xl px-4 py-3.5"
        style={{
          background: '#15151B',
          border: '1.5px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Paperclip */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 opacity-50 hover:opacity-90 transition-opacity mb-0.5"
          type="button"
          style={{ color: '#8B8B96' }}
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLimitReached ? 'Upgrade to send more messages' : placeholder}
          disabled={disabled || isLimitReached}
          rows={1}
          className="flex-1 resize-none bg-transparent leading-relaxed placeholder:text-[#5A5A66]"
          style={{
            fontSize: 15,
            color: '#F2F1EE',
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            border: 'none',
            maxHeight: 160,
            overflowY: 'auto',
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all mb-0.5"
          style={{
            background: canSend ? '#7B6FE8' : 'rgba(255,255,255,0.08)',
            color: canSend ? 'white' : 'rgba(255,255,255,0.25)',
          }}
          type="button"
        >
          <ArrowUp size={15} />
        </button>
      </div>
    </div>
  );
}
