import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { scenes } from '../data/scenes';
import { KarmaGauge } from './KarmaGauge';
import { NPCStatus } from './NPCStatus';
import './GameScreen.css';

export function GameScreen() {
  const { currentSceneId, karma, npcs, makeChoice } = useGameStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);

  const scene = scenes.find((s) => s.id === currentSceneId);

  useEffect(() => {
    if (!scene) return;
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    let i = 0;
    const text = scene.narration;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowChoices(true), 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentSceneId, scene]);

  const handleSkip = () => {
    if (isTyping && scene) {
      setDisplayedText(scene.narration);
      setIsTyping(false);
      setTimeout(() => setShowChoices(true), 100);
    }
  };

  const handleChoice = (choiceIndex: number) => {
    if (!scene) return;
    const choice = scene.choices[choiceIndex];

    // Check karma restrictions for branch C
    if (scene.id === 'branch_c') {
      if (choice.branchResult === 'c_spare' && karma > 4) {
        return; // Can't spare with high karma
      }
      if (choice.branchResult === 'c_dialogue' && karma > 8) {
        return; // Can't dialogue with very high karma
      }
    }

    // Check if luka negotiation is available
    if (scene.id === 'branch_b' && choice.branchResult === 'b_luka_negotiate') {
      if (!npcs.luka.revealed) return;
    }

    setShowChoices(false);
    makeChoice(choice);
  };

  if (!scene) return <div className="game-screen">씬을 불러올 수 없습니다.</div>;

  const actLabel = scene.act === 1 ? '제1막' : scene.act === 2 ? '제2막' : '제3막';

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="turn-info">
          <span className="act-label">{actLabel}</span>
          <span className="turn-label">턴 {scene.turn}/20</span>
        </div>
        <KarmaGauge />
        <NPCStatus />
      </div>

      <div className="story-area" onClick={handleSkip}>
        {scene.isBranch && (
          <div className="branch-indicator">분기점</div>
        )}
        {scene.speaker && (
          <div className="speaker-name">{scene.speaker}</div>
        )}
        <p className="narration-text">
          {displayedText}
          {isTyping && <span className="cursor">|</span>}
        </p>
      </div>

      <div className={`choices-area ${showChoices ? 'visible' : ''}`}>
        {scene.choices.map((choice, idx) => {
          let disabled = false;
          let lockReason = '';

          if (scene.id === 'branch_c') {
            if (choice.branchResult === 'c_spare' && karma > 4) {
              disabled = true;
              lockReason = '(업보 ≤4 필요)';
            }
            if (choice.branchResult === 'c_dialogue' && karma > 8) {
              disabled = true;
              lockReason = '(업보 ≤8 필요)';
            }
          }
          if (scene.id === 'branch_b' && choice.branchResult === 'b_luka_negotiate' && !npcs.luka.revealed) {
            disabled = true;
            lockReason = '(루카를 만나지 못했다)';
          }

          return (
            <button
              key={idx}
              className={`choice-btn ${disabled ? 'disabled' : ''} ${scene.isBranch ? 'branch-choice' : ''}`}
              onClick={() => handleChoice(idx)}
              disabled={disabled}
            >
              {choice.text}
              {lockReason && <span className="lock-reason">{lockReason}</span>}
              {choice.karmaChange !== 0 && !disabled && (
                <span className={`karma-hint ${choice.karmaChange > 0 ? 'bad' : 'good'}`}>
                  {choice.karmaChange > 0 ? `+${choice.karmaChange}` : choice.karmaChange}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
