import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number } | null) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const radius = 55; // max radius for joystick head

  const handlePointerStart = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }

    setKnobPos({ x: dx, y: dy });
    onMove({
      x: dx / radius,
      y: dy / radius,
    });
  }, [onMove]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handlePointerEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(null);
  }, [isDragging, onMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerEnd]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerStart}
      className="fixed bottom-4 left-4 z-40 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/60 backdrop-blur-md border-4 border-slate-600/60 shadow-2xl flex items-center justify-center cursor-pointer touch-none select-none active:border-blue-400"
    >
      {/* 4 Directional Triangle notches */}
      <div className="absolute top-2.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-400" />
      <div className="absolute bottom-2.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-400" />
      <div className="absolute left-2.5 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-slate-400" />
      <div className="absolute right-2.5 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-slate-400" />

      {/* Movable Thumb Stick */}
      <div
        className="w-14 h-14 rounded-full bg-slate-700/90 border-2 border-slate-400/80 shadow-lg flex items-center justify-center transition-transform pointer-events-none"
        style={{
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
        }}
      >
        <div className="w-5 h-5 rounded-full bg-blue-400/80 shadow-inner" />
      </div>
    </div>
  );
};
