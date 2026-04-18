import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import './SystemMessage.css';

export function SystemMessage() {
  const messages = useGameStore((s) => s.systemMessages);
  const shiftMessage = useGameStore((s) => s.shiftMessage);
  const currentSceneId = useGameStore((s) => s.currentSceneId);
  const [display, setDisplay] = useState<{ type: string; text: string } | null>(null);
  const [phase, setPhase] = useState<'hidden' | 'showing' | 'visible' | 'hiding'>('hidden');
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (display) {
      setPhase('hiding');
      timerRef.current = setTimeout(() => {
        setDisplay(null);
        setPhase('hidden');
        busyRef.current = false;
      }, 300);
    }
  }, [currentSceneId]);

  useEffect(() => {
    if (busyRef.current || messages.length === 0) return;
    busyRef.current = true;
    const msg = messages[0];
    shiftMessage();

    setDisplay(msg);
    setPhase('showing');

    timerRef.current = setTimeout(() => {
      setPhase('visible');
      timerRef.current = setTimeout(() => {
        setPhase('hiding');
        timerRef.current = setTimeout(() => {
          setDisplay(null);
          setPhase('hidden');
          busyRef.current = false;
        }, 400);
      }, 1600);
    }, 50);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [messages, phase]);

  if (!display || phase === 'hidden') return null;

  const cssPhase = phase === 'showing' || phase === 'visible' ? 'show' : 'hide';

  return (
    <div className={`sys-msg ${display.type} ${cssPhase}`}>
      <span className="sys-tag">[{tagLabel(display.type)}]</span>
      <span className="sys-text">{display.text}</span>
    </div>
  );
}

function tagLabel(type: string): string {
  switch (type) {
    case 'flag': return '\uae30\ub85d';
    case 'memory': return '\uc2ec\uacbd';
    case 'warning': return '\uacbd\uace0';
    case 'choice': return '\uc120\ud0dd';
    default: return '\uc2dc\uc2a4\ud15c';
  }
}
