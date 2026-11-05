import { useEffect, useRef, useState } from 'react';

const INITIALIZATION_MESSAGES = [
  'Loading core systems...',
  'Initializing developer environment...',
  'Loading projects...',
  'System ready.',
];

export default function BootScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const completedRef = useRef(false);

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setProgress(100);
      setMessageIndex(INITIALIZATION_MESSAGES.length - 1);
      const reducedMotionTimer = window.setTimeout(complete, 250);
      return () => window.clearTimeout(reducedMotionTimer);
    }

    const startedAt = performance.now();
    const duration = 2500;
    let frameId;

    const updateProgress = (timestamp) => {
      const elapsed = timestamp - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);
      setMessageIndex(Math.min(
        INITIALIZATION_MESSAGES.length - 1,
        Math.floor(nextProgress / 25),
      ));

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(updateProgress);
      } else {
        complete();
      }
    };

    frameId = window.requestAnimationFrame(updateProgress);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <section className="entry-screen boot-screen" aria-label="Tushar OS boot screen">
      <div className="boot-grid" aria-hidden="true" />
      <div className="boot-content">
        <div className="boot-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="boot-eyebrow">PERSONAL DEVELOPER OPERATING SYSTEM</p>
        <h1>TUSHAR OS</h1>
        <p className="boot-subtitle">{INITIALIZATION_MESSAGES[messageIndex]}</p>
        <div className="boot-progress-wrap">
          <div className="boot-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div className="boot-progress-value" style={{ width: `${progress}%` }} />
          </div>
          <span className="boot-progress-label">{progress}%</span>
        </div>
        <button className="entry-skip-button" type="button" onClick={complete}>
          Skip initialization <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="boot-status" aria-hidden="true">
        <span>SECURE BOOT</span>
        <span>BUILD 2026.11</span>
      </div>
    </section>
  );
}
