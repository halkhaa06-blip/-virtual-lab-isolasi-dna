import React, { useState, useRef } from 'react';
import { soundFx } from '../../utils/audio';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface RealisticMicropipetteProps {
  volumeMicroLiters: number;
  onVolumeChange: (vol: number) => void;
  liquidColor?: string;
  liquidAmountPct: number; // 0 to 100
  onAspirate: () => void;
  onDispense: () => void;
  canAspirate: boolean;
  canDispense: boolean;
  isTargetCapOpen?: boolean; // Required: tube cap must be open!
  onAttemptDispenseWithClosedCap?: () => void;
  labelSource?: string;
  labelTarget?: string;
  sourcePos?: { x: number; y: number };
  targetPos?: { x: number; y: number };
}

export const RealisticMicropipette: React.FC<RealisticMicropipetteProps> = ({
  volumeMicroLiters,
  onVolumeChange,
  liquidColor = '#38bdf8',
  liquidAmountPct,
  onAspirate,
  onDispense,
  canAspirate,
  canDispense,
  isTargetCapOpen = true,
  onAttemptDispenseWithClosedCap,
  labelSource = 'Sumber',
  labelTarget = 'Tabung Target',
  sourcePos = { x: 130, y: 20 },
  targetPos = { x: 400, y: 20 },
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(sourcePos);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [plungerPressed, setPlungerPressed] = useState(false);
  const [isFlowing, setIsFlowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pointer drag events for smooth movement on desktop & touch
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const parent = containerRef.current?.parentElement?.getBoundingClientRect();
    const maxX = parent ? parent.width - 90 : 500;
    const maxY = parent ? parent.height - 180 : 250;
    
    const newX = Math.max(10, Math.min(maxX, e.clientX - dragOffset.x));
    const newY = Math.max(5, Math.min(maxY, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const snapToSource = () => {
    soundFx.playClick();
    setPosition(sourcePos);
  };

  const snapToTarget = () => {
    soundFx.playClick();
    setPosition(targetPos);
  };

  const handlePressPlunger = () => {
    setPlungerPressed(true);
    soundFx.playClick();

    if (liquidAmountPct === 0 && canAspirate) {
      // Aspirate fluid
      setTimeout(() => {
        soundFx.playPour();
        onAspirate();
        setPlungerPressed(false);
      }, 200);
    } else if (liquidAmountPct > 0) {
      // Check if target tube cap is open!
      if (!isTargetCapOpen) {
        setPlungerPressed(false);
        soundFx.playBeep(false);
        if (onAttemptDispenseWithClosedCap) {
          onAttemptDispenseWithClosedCap();
        }
        return;
      }

      if (canDispense) {
        setIsFlowing(true);
        soundFx.playPour();
        setTimeout(() => {
          onDispense();
          setIsFlowing(false);
          setPlungerPressed(false);
        }, 350);
      } else {
        setPlungerPressed(false);
      }
    } else {
      setPlungerPressed(false);
    }
  };

  const paddedVol = Math.min(1000, Math.max(10, volumeMicroLiters)).toString().padStart(4, '0');

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`absolute z-30 select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'shadow-2xl scale-[1.03]' : ''
      }`}
    >
      {/* Sleek, Realistic Compact Micropipette Chassis (Pure Instrument, Zero Text) */}
      <div className="relative flex flex-col items-center w-16 group">
        {/* 1. Push Plunger Button on Top */}
        <button
          type="button"
          onClick={handlePressPlunger}
          style={{
            transform: plungerPressed ? 'translateY(6px)' : 'translateY(0)',
          }}
          className="no-drag z-30 w-7 h-4 rounded-t bg-gradient-to-b from-blue-400 via-blue-600 to-blue-800 border border-blue-300 shadow-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          title="Tekan Plunger Mikropipet"
        >
          <div className="w-3 h-0.5 bg-white/70 rounded-full" />
        </button>

        {/* 2. Plunger Shaft */}
        <div className="w-2 h-3 bg-gradient-to-r from-slate-300 via-white to-slate-400 border-x border-slate-500" />

        {/* 3. Ergonomic Finger Hook */}
        <div className="relative w-12 h-6 rounded-lg bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 border border-slate-500 shadow flex items-center justify-between px-1">
          <div className="w-1 h-3 rounded-l bg-blue-500/80" />
          <div className="w-1 h-3 rounded-r bg-slate-700" />
        </div>

        {/* 4. Compact Body with Volume Window */}
        <div className="w-10 h-16 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 border border-slate-600 rounded-b-md shadow-lg flex flex-col items-center justify-between py-1 px-0.5">
          {/* Digital Counter Window */}
          <div className="w-full bg-slate-950 border border-slate-700 rounded p-0.5 flex flex-col items-center">
            <div className="flex items-center bg-black/70 px-1 py-0.5 rounded font-mono text-[8px] font-black text-emerald-400">
              {paddedVol}
            </div>

            {/* Quick adjust */}
            <div className="no-drag flex items-center justify-between w-full mt-0.5 px-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onVolumeChange(Math.max(50, volumeMicroLiters - 50));
                }}
                className="w-3.5 h-2.5 bg-slate-800 text-slate-300 rounded flex items-center justify-center text-[7px] cursor-pointer"
              >
                <ChevronDown className="w-2 h-2" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onVolumeChange(Math.min(1000, volumeMicroLiters + 50));
                }}
                className="w-3.5 h-2.5 bg-slate-800 text-slate-300 rounded flex items-center justify-center text-[7px] cursor-pointer"
              >
                <ChevronUp className="w-2 h-2" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Metallic Tip Shaft */}
        <div className="w-3 h-10 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-x border-slate-500" />

        {/* 6. Translucent Disposable Conical Tip with Liquid */}
        <div className="relative w-4 h-14 flex flex-col items-center">
          <div className="w-4 h-1.5 rounded-t-sm bg-blue-500/80 border border-blue-400" />
          <div
            className="relative w-3 h-12 bg-cyan-200/20 border-x border-b border-cyan-400/40 shadow-inner flex flex-col justify-end overflow-hidden"
            style={{
              clipPath: 'polygon(10% 0%, 90% 0%, 65% 100%, 35% 100%)',
            }}
          >
            {liquidAmountPct > 0 && (
              <div
                className="w-full transition-all duration-300"
                style={{
                  height: `${liquidAmountPct}%`,
                  backgroundColor: liquidColor,
                  boxShadow: `inset 0 1px 2px rgba(255,255,255,0.4), 0 0 6px ${liquidColor}`,
                }}
              />
            )}
          </div>

          {/* Dispensing Liquid Stream */}
          {isFlowing && (
            <div
              className="absolute -bottom-8 w-1 h-8 animate-pulse rounded-full"
              style={{
                backgroundColor: liquidColor,
                boxShadow: `0 0 8px ${liquidColor}`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
