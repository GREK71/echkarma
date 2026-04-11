import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { scenes } from '../data/scenes';
import { RESOURCE_CONFIG } from '../game/resources';
import { KarmaGauge } from './KarmaGauge';
import { NPCStatus } from './NPCStatus';
import { ResourceBar } from './ResourceBar';
import './GameScreen.css';

export function GameScreen() {
  const {
    currentSceneId, karma, resources, npcs,
    makeChoice, makeRandomEventChoice, clearResourceEvent,
    responseText, dismissResponse, activeRandomEvent,
  } = useGameStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'visible' | 'out'>('in');
  const [screenShake, setScreenShake] = useState(false);

  const scene = scenes.find((s) => s.id === currentSceneId);

  // Determine what to display: response text, random event, or scene
  const isShowingResponse = responseText !== null && activeRandomEvent === null;
  const isShowingRandomEvent = activeRandomEvent !== null && responseText === null;
  const isShowingScene = !isShowingResponse && !isShowingRandomEvent;

  const displayNarration = isShowingResponse
    ? responseText
    : isShowingRandomEvent
    ? activeRandomEvent!.narration
    : scene?.narration ?? '';

  const displaySpeaker = isShowingRandomEvent
    ? activeRandomEvent!.speaker
    : isShowingScene
    ? scene?.speaker
    : undefined;

  // Scene/content change effect
  useEffect(() => {
    setFadeState('in');
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    if (isShowingScene) {
      clearResourceEvent();
    }

    const fadeTimer = setTimeout(() => setFadeState('visible'), 400);

    if (isShowingScene && scene?.isBranch) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }

    let i = 0;
    const text = displayNarration;
    let interval: ReturnType<typeof setInterval>;
    const typingDelay = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          setTimeout(() => setShowChoices(true), 400);
        }
      }, 25);
    }, 500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(typingDelay);
      if (interval) clearInterval(interval);
    };
  }, [currentSceneId, responseText, activeRandomEvent?.id]);

  const handleSkip = () => {
    if (isTyping) {
      setDisplayedText(displayNarration);
      setIsTyping(false);
      setTimeout(() => setShowChoices(true), 100);
    }
  };

  const handleResponseDismiss = () => {
    setFadeState('out');
    setShowChoices(false);
    setTimeout(() => dismissResponse(), 350);
  };

  const handleChoice = (choiceIndex: number) => {
    if (!scene) return;
    const choice = scene.choices[choiceIndex];

    if (scene.id === 'branch_c') {
      if (choice.branchResult === 'c_spare' && karma > 4) return;
      if (choice.branchResult === 'c_dialogue' && karma > 8) return;
    }
    if (scene.id === 'branch_b' && choice.branchResult === 'b_luka_negotiate' && !npcs.luka.revealed) return;
    if (choice.requireResource) {
      const { resource, min } = choice.requireResource;
      if (resources[resource] < min) return;
    }

    setFadeState('out');
    setShowChoices(false);
    setTimeout(() => makeChoice(choice), 350);
  };

  const handleRandomEventChoice = (choiceIndex: number) => {
    if (!activeRandomEvent) return;
    const choice = activeRandomEvent.choices[choiceIndex];
    setFadeState('out');
    setShowChoices(false);
    setTimeout(() => makeRandomEventChoice(choice), 350);
  };

  if (!scene) return <div className="game-screen">씬을 불러올 수 없습니다.</div>;

  const actLabel = scene.act === 1 ? '제1막' : scene.act === 2 ? '제2막' : '제3막';
  const isBranchScene = isShowingScene && scene.isBranch;

  return (
    <div className={`game-screen ${screenShake ? 'screen-shake' : ''}`}>
      <div className="game-header">
        <div className="turn-info">
          <span className="act-label">{actLabel}</span>
          <span className="turn-label">턴 {scene.turn}/20</span>
        </div>
        <ResourceBar />
        <KarmaGauge />
        <NPCStatus />
      </div>

      <div className={`story-area scene-fade scene-fade-${fadeState}`} onClick={handleSkip}>
        {isBranchScene && (
          <div className="branch-indicator">
            <span className="branch-pulse" />
            분기점
          </div>
        )}
        {isShowingRandomEvent && (
          <div className="random-event-indicator">돌발 상황</div>
        )}
        {displaySpeaker && (
          <div className="speaker-name">{displaySpeaker}</div>
        )}
        <p className="narration-text">
          {displayedText}
          {isTyping && <span className="cursor">|</span>}
        </p>
      </div>

      <div className={`choices-area ${showChoices ? 'visible' : ''}`}>
        {/* Response text dismiss */}
        {isShowingResponse && (
          <button className="choice-btn" onClick={handleResponseDismiss}>
            <span className="choice-text">계속...</span>
          </button>
        )}

        {/* Random event choices */}
        {isShowingRandomEvent && activeRandomEvent!.choices.map((choice, idx) => {
          const costHints: string[] = [];
          if (choice.resourceCost) {
            for (const [key, val] of Object.entries(choice.resourceCost)) {
              if (val === 0) continue;
              const cfg = RESOURCE_CONFIG[key as keyof typeof RESOURCE_CONFIG];
              costHints.push(`${cfg.icon}${val > 0 ? `+${val}` : val}`);
            }
          }
          return (
            <button
              key={idx}
              className="choice-btn random-event-choice"
              onClick={() => handleRandomEventChoice(idx)}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="choice-text">{choice.text}</span>
              <span className="choice-hints">
                {costHints.length > 0 && <span className="cost-hints">{costHints.join(' ')}</span>}
                {choice.karmaChange !== 0 && (
                  <span className={`karma-hint ${choice.karmaChange > 0 ? 'bad' : 'good'}`}>
                    {choice.karmaChange > 0 ? `+${choice.karmaChange}` : choice.karmaChange}
                  </span>
                )}
              </span>
            </button>
          );
        })}

        {/* Normal scene choices */}
        {isShowingScene && scene.choices.map((choice, idx) => {
          let disabled = false;
          let lockReason = '';

          if (scene.id === 'branch_c') {
            if (choice.branchResult === 'c_spare' && karma > 4) { disabled = true; lockReason = '업보 \u22644 필요'; }
            if (choice.branchResult === 'c_dialogue' && karma > 8) { disabled = true; lockReason = '업보 \u22648 필요'; }
          }
          if (scene.id === 'branch_b' && choice.branchResult === 'b_luka_negotiate' && !npcs.luka.revealed) {
            disabled = true; lockReason = '루카를 만나지 못했다';
          }
          if (choice.requireResource) {
            const { resource, min } = choice.requireResource;
            if (resources[resource] < min) { disabled = true; lockReason = `${RESOURCE_CONFIG[resource].label} ${min} 이상 필요`; }
          }

          const costHints: string[] = [];
          if (choice.resourceCost) {
            for (const [key, val] of Object.entries(choice.resourceCost)) {
              if (val === 0) continue;
              const cfg = RESOURCE_CONFIG[key as keyof typeof RESOURCE_CONFIG];
              costHints.push(`${cfg.icon}${val > 0 ? `+${val}` : val}`);
            }
          }

          return (
            <button
              key={idx}
              className={`choice-btn ${disabled ? 'disabled' : ''} ${isBranchScene ? 'branch-choice' : ''}`}
              onClick={() => handleChoice(idx)}
              disabled={disabled}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="choice-text">{choice.text}</span>
              <span className="choice-hints">
                {lockReason && <span className="lock-reason">{lockReason}</span>}
                {!disabled && costHints.length > 0 && <span className="cost-hints">{costHints.join(' ')}</span>}
                {!disabled && choice.karmaChange !== 0 && (
                  <span className={`karma-hint ${choice.karmaChange > 0 ? 'bad' : 'good'}`}>
                    {choice.karmaChange > 0 ? `+${choice.karmaChange}` : choice.karmaChange}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
