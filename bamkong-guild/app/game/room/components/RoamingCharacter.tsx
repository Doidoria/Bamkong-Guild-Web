// app/game/room/components/RoamingCharacter.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';

interface RoamingCharacterProps {
  level: number;
  isEvolved: boolean;
  evolutionId: number | null;
  userName: string;
  initialX?: number;
  initialY?: number;
}

export default function RoamingCharacter({ level, isEvolved, evolutionId, userName, initialX, initialY }: RoamingCharacterProps) {
  const [position, setPosition] = useState({ x: initialX ?? 75, y: initialY ?? 67 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);

  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInsideIsometricFloor = (x: number, y: number) => {
    const centerX = 50; 
    const centerY = 70;
    const widthRatio = 40;  
    const heightRatio = 20; 
    
    return (Math.abs(x - centerX) / widthRatio) + (Math.abs(y - centerY) / heightRatio) <= 1;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const updatePosition = () => {
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 0.11;
        let moved = false;

        if (keys.current['w']) { newY -= speed; moved = true; }
        if (keys.current['s']) { newY += speed; moved = true; }
        if (keys.current['a']) { newX -= speed; moved = true; setIsFlipped(true); }
        if (keys.current['d']) { newX += speed; moved = true; setIsFlipped(false); }

        if (!isInsideIsometricFloor(newX, newY)) {
          newX = prev.x;
          newY = prev.y;
        }

        setIsWalking(moved);
        return { x: newX, y: newY };
      });
      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 캐릭터 클릭 이벤트 (상호작용)
  const handleCharacterClick = () => {
    const dialogues = [
      `${userName}님, 방이 참 아늑하네요! 🌰`, 
      `더 멋진 가구는 없나요, ${userName}님?`, 
      `바닥이 너무 푹신해요! 최고야!`
    ];
    const randomSpeech = dialogues[Math.floor(Math.random() * dialogues.length)];
    setSpeech(randomSpeech);
    
    // 기존에 돌고 있던 타이머가 있다면 캔슬 (연속 클릭 시 끊김 방지)
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    // 새로운 타이머 시작
    speechTimeoutRef.current = setTimeout(() => {
      setSpeech(null);
    }, 3000);
  };

  const characterSrc = isEvolved && evolutionId
    ? `/images/evolutions/final-${evolutionId}.png`
    : `/images/characters/level-${Math.min(Math.floor(level / 10) + 1, 10)}.png`;

  return (
    <div className="absolute" 
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        zIndex: 99999,
        transform: 'translate(-50%, -100%)' 
      }}
    >
      <div className="relative cursor-pointer" onClick={handleCharacterClick}>
        
        {/* 말풍선 렌더링 영역 */}
        {speech && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-stone-800 text-xs font-black px-3 py-1.5 rounded-2xl shadow-lg border-2 border-stone-100 whitespace-nowrap animate-[bounce_0.3s_ease-out] z-50 pointer-events-none">
            {speech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-stone-100 rotate-45"></div>
          </div>
        )}

        {/* 레벨 뱃지 */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border-2 border-white pointer-events-none whitespace-nowrap">
          Lv.{level}
        </div>

        {/* 캐릭터 렌더링 */}
        <div className={`${isFlipped ? '-scale-x-100' : 'scale-x-100'}`}>
          <img 
            src={characterSrc}
            alt="밤콩이"
            className={`w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] hover:brightness-110 transition-all
              ${isWalking ? 'animate-[bounce_0.3s_infinite]' : ''}
            `}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
}