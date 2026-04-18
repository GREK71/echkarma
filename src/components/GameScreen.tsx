import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { findScene, EPISODES } from '../data/episodes';
import { SystemMessage } from './SystemMessage';
import './GameScreen.css';

export function GameScreen() {
  const currentSceneId = useGameStore((s) => s.currentSceneId);
  const currentEpisode = useGameStore((s) => s.currentEpisode);
  const flags = useGameStore((s) => s.flags);
  const responseText = useGameStore((s) => s.responseText);
  const makeChoice = useGameStore((s) => s.makeChoice);
  const dismissResponse = useGameStore((s) => s.dismissResponse);

  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'visible' | 'out'>('in');

  const scene = findScene(currentSceneId);
  const epMeta = currentEpisode ? EPISODES[currentEpisode] : null;

  const isShowingResponse = responseText !== null;
  const displayText = isShowingResponse ? responseText : scene?.narration ?? '';
  const displaySpeaker = isShowingResponse ? null : scene?.speaker;

  useEffect(() => {
    setFadeState('in');
    setDisplayed('');
    setIsTyping(true);
    setShowChoices(false);

    const fadeT = setTimeout(() => setFadeState('visible'), 300);

    let i = 0;
    const text = displayText;
    let interval: ReturnType<typeof setInterval>;
    const startT = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          setTimeout(() => setShowChoices(true), 400);
        }
      }, 22);
    }, 400);

    return () => {
      clearTimeout(fadeT);
      clearTimeout(startT);
      if (interval) clearInterval(interval);
    };
  }, [currentSceneId, responseText]);

  const handleSkip = () => {
    if (isTyping) {
      setDisplayed(displayText);
      setIsTyping(false);
      setTimeout(() => setShowChoices(true), 80);
    }
  };

  const handleChoice = (idx: number) => {
    if (!scene) return;
    const choice = scene.choices[idx];
    // Lock check
    if (choice.requireFlag) {
      const cur = flags[choice.requireFlag.key];
      if (cur !== choice.requireFlag.equals) return;
    }
    setFadeState('out');
    setShowChoices(false);
    setTimeout(() => makeChoice(choice), 300);
  };

  const handleDismissResponse = () => {
    setFadeState('out');
    setShowChoices(false);
    setTimeout(() => dismissResponse(), 300);
  };

  if (!scene) return <div className="game-screen">불러올 수 없습니다.</div>;

  return (
    <div className="game-screen">
      <div className="game-wrap">
        <header className="game-header">
          <div className="game-meta">
            {epMeta && <span className="game-ep">{epMeta.number}</span>}
            {epMeta && <span className="game-sep">·</span>}
            {epMeta && <span className="game-title">{epMeta.title}</span>}
          </div>
        </header>

        <main className={`game-body scene-fade scene-fade-${fadeState}`} onClick={handleSkip}>
          {scene.isFlashback && !isShowingResponse && (
            <div className="tag-flashback">회상</div>
          )}
          {scene.isBranch && !isShowingResponse && (
            <div className="tag-branch">분기점</div>
          )}
          {displaySpeaker && (
            <div className="speaker">{displaySpeaker}</div>
          )}
          <p className={`narration ${scene.isFlashback && !isShowingResponse ? 'flashback-text' : ''}`}>
            {displayed}
            {isTyping && <span className="cursor">|</span>}
          </p>
        </main>

        <footer className={`choices ${showChoices ? 'visible' : ''}`}>
          {isShowingResponse ? (
            <button className="choice-btn continue" onClick={handleDismissResponse}>
              <span className="choice-text">계속...</span>
            </button>
          ) : (
            scene.choices.map((choice, idx) => {
              let disabled = false;
              let lockReason = '';
              if (choice.requireFlag) {
                const cur = flags[choice.requireFlag.key];
                if (cur !== choice.requireFlag.equals) {
                  disabled = true;
                  lockReason = choice.lockReason ?? '조건 미충족';
                }
              }
              return (
                <button
                  key={idx}
                  className={`choice-btn ${disabled ? 'disabled' : ''}`}
                  onClick={() => handleChoice(idx)}
                  disabled={disabled}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <span className="choice-text">{choice.text}</span>
                  {disabled && lockReason && <span className="choice-lock">{lockReason}</span>}
                </button>
              );
            })
          )}
        </footer>
      </div>

      <SystemMessage />
    </div>
  );
}
