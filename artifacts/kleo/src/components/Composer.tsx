import { useRef, useEffect } from 'react';
import Icon from './Icon';

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function Composer({
  value,
  onChange,
  onSend,
  placeholder = 'Ask Kleo about your money…',
  autoFocus = false,
  disabled = false,
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = Math.min(200, ref.current.scrollHeight) + 'px';
  }, [value]);

  const ready = value.trim().length > 0 && !disabled;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (ready) onSend();
    }
  };

  return (
    <div className="composer">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="composer-row">
        <div className="composer-tools">
          <button className="cmp-btn" title="Attach a file">
            <Icon name="file" size={14} />
            Attach
          </button>
          <button className="cmp-btn" title="All accounts">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            All accounts
            <Icon name="chev" size={12} stroke={1.8} />
          </button>
          <button className="cmp-btn" title="Deep think">
            <Icon name="sparkle" size={13} />
            Deep think
          </button>
        </div>
        <button
          className={`send-btn ${ready ? 'ready' : ''}`}
          disabled={!ready}
          onClick={onSend}
          title="Send (↵)"
        >
          <Icon name="arrowUp" size={15} stroke={2} />
        </button>
      </div>
    </div>
  );
}
