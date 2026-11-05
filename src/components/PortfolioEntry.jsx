import { useCallback, useEffect, useState } from 'react';
import BootScreen from './BootScreen';
import LockScreen from './LockScreen';

export default function PortfolioEntry({ children }) {
  const [stage, setStage] = useState('booting');

  const showLockScreen = useCallback(() => setStage('locked'), []);
  const unlock = useCallback(() => setStage((currentStage) => (
    currentStage === 'locked' ? 'unlocking' : currentStage
  )), []);

  useEffect(() => {
    if (stage !== 'unlocking') return undefined;
    const transitionTimer = window.setTimeout(() => setStage('unlocked'), 420);
    return () => window.clearTimeout(transitionTimer);
  }, [stage]);

  if (stage === 'booting') {
    return <BootScreen onComplete={showLockScreen} />;
  }

  if (stage === 'locked') {
    return <LockScreen onUnlock={unlock} />;
  }

  if (stage === 'unlocking') {
    return <LockScreen onUnlock={unlock} isExiting />;
  }

  return children;
}
