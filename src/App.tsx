import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/TitleScreen';
import { GameScreen } from './components/GameScreen';
import { EndingScreen } from './components/EndingScreen';
import { EndingGallery } from './components/EndingGallery';

function App() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'title':
      return <TitleScreen />;
    case 'playing':
      return <GameScreen />;
    case 'ending':
      return <EndingScreen />;
    case 'gallery':
      return <EndingGallery />;
  }
}

export default App;
