import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return undefined;

    const root = document.documentElement;
    root.classList.add('custom-cursor-enabled');

    const position = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let frame;

    const render = () => {
      position.x += (target.x - position.x) * 0.18;
      position.y += (target.y - position.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      }
      frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      const interactive = event.target.closest('a, button, [role="button"], [tabindex]:not([tabindex="-1"])');
      const textInput = event.target.closest('input, textarea, select, [contenteditable="true"]');
      root.classList.toggle('cursor-hovering', Boolean(interactive && !textInput));
      root.classList.toggle('cursor-text', Boolean(textInput));
    };

    const handlePointerLeave = () => {
      root.classList.remove('cursor-hovering', 'cursor-text');
      target.x = -100;
      target.y = -100;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.cancelAnimationFrame(frame);
      root.classList.remove('custom-cursor-enabled', 'cursor-hovering', 'cursor-text');
    };
  }, []);

  return (
    <>
      <span ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <span ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
    </>
  );
}
