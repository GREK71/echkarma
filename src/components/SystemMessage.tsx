import { useEffect, useState, useRef, useCallback } from 'react';
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

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // 새 턴 시작 시 즉시 숨김
  useEffect(() => {
    clearTimers();
    if (display) {
      setPhase('hiding');
      timerRef.current = setTimeout(() => {
        setDisplay(null);
        setPhase('hidden');
        busyRef.current = false;
      }, 300);
    }
  }, [currentSceneId]);

  // 큐에서 메시지 하나씩 처리
  useEffect(() => {
    if (busyRef.current || messages.length === 0) return;

    busyRef.current = true;
    const msg = messages[0];
    shiftMessage();

    // 1) slide down
    setDisplay(msg);
    setPhase('showing');

    timerRef.current = setTimeout(() => {
      setPhase('visible');

      // 2) 1.5초 유지 후 slide up
      timerRef.current = setTimeout(() => {
        setPhase('hiding');

        // 3) 애니메이션 후 제거
        timerRef.current = setTimeout(() => {
          setDisplay(null);
          setPhase('hidden');
          busyRef.current = false;
        }, 400);
      }, 1500);
    }, 50);

    return clearTimers;
  }, [messages, phase]);

  if (!display || phase === 'hidden') return null;

  const cssClass = phase === 'showing' || phase === 'visible' ? 'show' : 'hide';

  return (
    <div className={`system-message ${display.type} ${cssClass}`}>
      <span className="sys-tag">[{getTagLabel(display.type)}]</span>
      <span className="sys-text">{display.text}</span>
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
