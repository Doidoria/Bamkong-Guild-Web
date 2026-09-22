// app/game/room/components/IsometricItem.tsx
'use client';
import React, { useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface IsometricItemProps {
  id: string;
  name: string;
  src: string;
  xPos: number;
  yPos: number;
  baseZIndex?: number;
  sizeClass?: string;
  isLightSource?: boolean; // 조명 여부
  isNight?: boolean;       // 현재 밤인지 여부
  onPositionChange: (id: string, newX: number, newY: number) => void;
  onInteract?: (id: string) => void;
}

export default function IsometricItem({ 
  id, name, src, xPos, yPos, baseZIndex, 
  sizeClass = 'w-32', isLightSource, isNight, onPositionChange, onInteract
}: IsometricItemProps) {
  const isDragging = useRef(false);
  const controls = useAnimation();
  const calculatedZIndex = baseZIndex !== undefined ? baseZIndex : Math.floor(yPos * 100);

  const clampToIsometricFloor = (targetX: number, targetY: number, oldX: number, oldY: number) => {
    const centerX = 50; 
    const centerY = 70;
    const widthRatio = 40;
    const heightRatio = 20;
    
    if ((Math.abs(targetX - centerX) / widthRatio) + (Math.abs(targetY - centerY) / heightRatio) <= 1) {
      return { x: targetX, y: targetY };
    }
    return { x: oldX, y: oldY }; 
  };

  // 밤일 때 빛나는 효과 조건부 적용
  const glowClass = isNight && isLightSource 
    ? 'drop-shadow-[0_0_25px_rgba(251,191,36,0.8)] brightness-125' 
    : 'drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]';

  return (
    <motion.div
      drag 
      dragElastic={0.05}
      dragMomentum={false}
      animate={controls}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onClick={() => {
        if (!isDragging.current && onInteract) {
          onInteract(id);
        }
      }}
      onDragEnd={(event, info) => {
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
        const SENSITIVITY = 0.6; // 취향에 따라 0.2 ~ 0.5 사이로 조절해 보세요.
        const percentX = (info.offset.x / window.innerWidth) * 100 * SENSITIVITY;
        const percentY = (info.offset.y / window.innerHeight) * 100 * SENSITIVITY;
        const rawNewX = xPos + percentX;
        const rawNewY = yPos + percentY;

        const { x: finalX, y: finalY } = clampToIsometricFloor(rawNewX, rawNewY, xPos, yPos);

        onPositionChange(id, finalX, finalY);
        controls.set({ x: 0, y: 0 });
      }}
      // 드래그 중일 때 붕 떠오르는 애니메이션
      whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
      className="absolute group pointer-events-none"
      style={{
        left: `${xPos}%`,
        top: `${yPos}%`,
        zIndex: calculatedZIndex,
      }}
    >
      <div className="relative pointer-events-auto cursor-grab active:cursor-grabbing" style={{ transform: 'translate(-50%, -100%)' }}>
        <img
          src={src}
          alt={name}
          className={`${sizeClass} object-contain transition-all duration-300 ${glowClass}`}
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm border border-white/20">
          {name}
        </div>
      </div>
    </motion.div>
  );
}