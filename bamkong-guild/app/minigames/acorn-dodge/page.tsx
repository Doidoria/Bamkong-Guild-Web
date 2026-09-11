// app/minigames/acorn-dodge/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, RefreshCw, Award } from 'lucide-react';
import { useBamkongGrowth } from '@/app/game/hooks/useBamkongGrowth';

interface Acorn {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export default function AcornDodgePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { user, handleMinigamePlay } = useBamkongGrowth();
  
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);
  
  // 게임 루프용 Refs
  const requestRef = useRef<number>(0);
  const playerRef = useRef({ x: 400, y: 500, width: 48, height: 48 });
  const acornsRef = useRef<Acorn[]>([]);
  const frameRef = useRef(0);

  // 마우스 이동으로 플레이어 조작
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    
    // 마우스의 X 좌표에 맞게 플레이어 위치 업데이트
    let newX = (e.clientX - rect.left) * scaleX - playerRef.current.width / 2;
    // 캔버스 밖으로 나가지 않도록 제한
    newX = Math.max(0, Math.min(newX, canvas.width - playerRef.current.width));
    playerRef.current.x = newX;
  };

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setTimeSurvived(0);
    acornsRef.current = [];
    frameRef.current = 0;
  };

  const gameOver = async () => {
    setGameState('GAMEOVER');
    cancelAnimationFrame(requestRef.current!);
    
    // 생존 시간에 비례하여 AP 보상 산정 (최대 5 AP)
    const rewardAp = Math.min(5, Math.floor(score / 500));
    if (rewardAp > 0) {
      await handleMinigamePlay('acorn' as any, rewardAp);
      alert(`🎉 생존 성공! 행동력(AP) ${rewardAp}을(를) 획득했습니다.`);
    }
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    frameRef.current++;
    setScore(prev => prev + 1);
    
    // 60프레임(약 1초)마다 생존 시간 증가
    if (frameRef.current % 60 === 0) setTimeSurvived(prev => prev + 1);

    // 난이도 상승 로직: 시간이 지날수록 도토리 생성 주기 단축
    const spawnRate = Math.max(5, 30 - Math.floor(frameRef.current / 300));
    if (frameRef.current % spawnRate === 0) {
      acornsRef.current.push({
        x: Math.random() * (canvas.width - 24),
        y: -30,
        speed: 3 + Math.random() * 4 + (frameRef.current / 1000), // 점진적 속도 증가
        size: 24
      });
    }

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 그리기 (실제 프로젝트에서는 텍스트 없는 순수 이미지 에셋 drawImage 사용)
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height, 12);
    ctx.fill();
    ctx.shadowBlur = 0; // 도토리 그리기 전 쉐도우 초기화

    // 도토리 업데이트 및 충돌 검사
    for (let i = acornsRef.current.length - 1; i >= 0; i--) {
      const acorn = acornsRef.current[i];
      acorn.y += acorn.speed;

      ctx.fillStyle = '#78350f'; // amber-900
      ctx.beginPath();
      ctx.arc(acorn.x + acorn.size / 2, acorn.y + acorn.size / 2, acorn.size / 2, 0, Math.PI * 2);
      ctx.fill();

      // 바닥을 벗어난 도토리 제거
      if (acorn.y > canvas.height) {
        acornsRef.current.splice(i, 1);
        continue;
      }

      // AABB 충돌 판정 (Hitbox를 살짝 작게 주어 억울한 죽음 방지)
      const hitBoxShrink = 6;
      if (
        playerRef.current.x + hitBoxShrink < acorn.x + acorn.size &&
        playerRef.current.x + playerRef.current.width - hitBoxShrink > acorn.x &&
        playerRef.current.y + hitBoxShrink < acorn.y + acorn.size &&
        playerRef.current.y + playerRef.current.height - hitBoxShrink > acorn.y
      ) {
        gameOver();
        return;
      }
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center p-6 select-none relative overflow-hidden">
      {/* 백그라운드 디자인 에셋 요소 (텍스트 없음) */}
      <div className="absolute inset-0 bg-[url('/images/minigame/acorn-bg.jpg')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="w-full max-w-[800px] flex justify-between items-center mb-6 z-10 relative">
        <button onClick={() => router.push('/game/room')} 
          className="flex items-center gap-2 text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> 방으로 돌아가기
        </button>
        <div className="flex gap-4">
          <div className="bg-amber-950/50 border border-amber-500/30 px-6 py-2 rounded-xl text-amber-400 font-bold font-mono text-xl tracking-wider">
            {timeSurvived}s
          </div>
          <div className="bg-stone-800/50 border border-white/10 px-6 py-2 rounded-xl text-stone-300 font-bold font-mono text-xl">
            {score} pt
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-stone-800 bg-stone-950/80 z-10 cursor-none w-full max-w-[800px] aspect-[4/3]">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseMove={handleMouseMove}
          className="w-full h-full block"
        />

        {/* 오버레이 UI (타이포그래피는 웹 렌더링에 온전히 의존) */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            {gameState === 'START' ? (
              <>
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-amber-500/30">
                  <Award className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">떨어지는 도토리 피하기</h1>
                <p className="text-stone-300 mb-10 text-lg">마우스를 좌우로 움직여 쏟아지는 도토리를 피하세요!<br/>오래 버틸수록 행동력(AP) 보상이 증가합니다.</p>
                <button onClick={startGame} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-10 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  <Play className="fill-current w-6 h-6" /> 게임 시작
                </button>
              </>
            ) : (
              <>
                <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h2>
                <p className="text-stone-300 text-xl mt-4">생존 시간: <span className="text-amber-400 font-bold">{timeSurvived}초</span></p>
                <p className="text-stone-400 mt-2 mb-10">최종 점수: {score} pt</p>
                <button onClick={startGame} className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                  <RefreshCw className="w-5 h-5" /> 다시 도전하기
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}