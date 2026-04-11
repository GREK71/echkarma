import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './SystemMessage.css';

export function SystemMessage() {
  const messages = useGameStore((s) => s.systemMessages);
  const shiftMessage = useGameStore((s) => s.shiftMessage);
  const [current, setCurrent] = useState<{ type: string; text: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (messages.length > 0 && !current) {
      const msg = messages[0];
      setCurrent(msg);
      setVisible(true);
      shiftMessage();

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setCurrent(null), 400);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [messages, current]);

  if (!current) return null;

  return (
    <div className={`system-message ${current.type} ${visible ? 'show' : 'hide'}`}>
      <span className="sys-tag">[{getTagLabel(current.type)}]</span>
      <span className="sys-text">{current.text}</span>
    </div>
  );
}

function getTagLabel(type: string): string {
  switch (type) {
    case 'affinity': return '\uad00\uacc4';
    case 'clue': return '\ub2e8\uc11c';
    case 'resource': return '\uc790\uc6d0';
    case 'warning': return '\uacbd\uace0';
    case 'memory': return '\uae30\uc5b5';
    default: return '\uc2dc\uc2a4\ud15c';
  }
}
