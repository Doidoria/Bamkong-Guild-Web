// app/minigames/acorn-dodge/page.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, RefreshCw, Award, AlertCircle } from 'lucide-react';
import { useBamkongGrowth } from '@/app/game/hooks/useBamkongGrowth';
import { toast } from 'sonner';

interface Acorn {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export default function AcornDodgePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  // 훅에서 도토리 전용 데이터 가져오기
  const { handleAcornPlay, acornPlays, isLoading } = useBamkongGrowth();
  const MAX_PLAYS = 5;
  
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0); // 획득한 포인트 기록용
  
  const requestRef = useRef<number>(0);
  const playerRef = useRef({ x: 400, y: 500, width: 48, height: 48 });
  const acornsRef = useRef<Acorn[]>([]);
  const frameRef = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    
    let newX = (e.clientX - rect.left) * scaleX - playerRef.current.width / 2;
    newX = Math.max(0, Math.min(newX, canvas.width - playerRef.current.width));
    playerRef.current.x = newX;
  };

  const startGame = () => {
    if (acornPlays >= MAX_PLAYS) {
      toast.error('오늘 도전 기회를 모두 소진했습니다! 내일 다시 도전해 주세요.');
      return;
    }
    setGameState('PLAYING');
    setScore(0);
    setTimeSurvived(0);
    setEarnedPoints(0);
    acornsRef.current = [];
    frameRef.current = 0;
  };

  const gameOver = async () => {
    setGameState('GAMEOVER');
    cancelAnimationFrame(requestRef.current!);
    
    // 밸런싱: 1초당 3포인트, 최대 200포인트 제한
    const currentSurvived = frameRef.current / 60;
    const calculatedPoints = Math.min(200, Math.floor(currentSurvived * 3));
    setEarnedPoints(calculatedPoints);

    if (calculatedPoints > 0 && acornPlays < MAX_PLAYS) {
      await handleAcornPlay(calculatedPoints);
      toast.success(`생존 성공! ${calculatedPoints} P를 획득했습니다.`);
    }
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    frameRef.current++;
    setScore(prev => prev + 1);
    if (frameRef.current % 60 === 0) setTimeSurvived(prev => prev + 1);

    const spawnRate = Math.max(5, 30 - Math.floor(frameRef.current / 300));
    if (frameRef.current % spawnRate === 0) {
      acornsRef.current.push({
        x: Math.random() * (canvas.width - 24),
        y: -30,
        speed: 3 + Math.random() * 4 + (frameRef.current / 1000),
        size: 24
      });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height, 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = acornsRef.current.length - 1; i >= 0; i--) {
      const acorn = acornsRef.current[i];
      acorn.y += acorn.speed;

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(acorn.x + acorn.size / 2, acorn.y + acorn.size / 2, acorn.size / 2, 0, Math.PI * 2);
      ctx.fill();

      if (acorn.y > canvas.height) {
        acornsRef.current.splice(i, 1);
        continue;
      }

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

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center p-6 select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/minigame/acorn-bg.jpg')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="w-full max-w-[800px] flex justify-between items-center mb-6 z-10 relative">
        <button onClick={() => router.push('/game/room/minigames')}
          className="flex items-center gap-2 text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> 게임 목록으로
        </button>
        
        {/* 플레이 횟수 및 스코어 표시 */}
        <div className="flex gap-3">
          <div className="bg-stone-800/80 border border-stone-600 px-4 py-2 rounded-xl text-stone-300 font-bold flex items-center gap-2">
            도전 횟수 <span className={`${acornPlays >= MAX_PLAYS ? 'text-red-400' : 'text-amber-400'}`}>{MAX_PLAYS - acornPlays} / {MAX_PLAYS}</span>
          </div>
          {gameState === 'PLAYING' && (
            <div className="bg-amber-950/80 border border-amber-500/50 px-6 py-2 rounded-xl text-amber-400 font-bold font-mono text-xl tracking-wider min-w-[100px] text-center">
              {timeSurvived}s
            </div>
          )}
        </div>
      </div>

      <div className={`relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-stone-800 bg-stone-950/80 z-10 w-full max-w-[800px] aspect-[4/3] ${gameState === 'PLAYING' ? 'cursor-none' : 'cursor-default'}`}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseMove={handleMouseMove}
          className="w-full h-full block"
        />

        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            {gameState === 'START' ? (
              <>
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-amber-500/30">
                  <Award className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">떨어지는 도토리 피하기</h1>
                <p className="text-stone-300 mb-6 text-lg">
                  쏟아지는 도토리를 피하세요!<br/>버틴 시간에 비례하여 포인트가 지급됩니다. (최대 200P)
                </p>
                {acornPlays >= MAX_PLAYS ? (
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/50 px-6 py-3 rounded-xl border border-red-900/50">
                    <AlertCircle className="w-5 h-5" /> 오늘의 도전 기회를 모두 사용했습니다.
                  </div>
                ) : (
                  <button onClick={startGame} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-10 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    <Play className="fill-current w-6 h-6" /> 게임 시작
                  </button>
                )}
              </>
            ) : (
              <>
                <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h2>
                <div className="bg-stone-900 border border-stone-700 p-6 rounded-2xl mt-6 mb-8 min-w-[280px]">
                  <p className="text-stone-400 text-sm mb-1">버틴 시간</p>
                  <p className="text-white text-3xl font-black font-mono mb-4">{timeSurvived}<span className="text-lg text-stone-500 ml-1">초</span></p>
                  <div className="h-px w-full bg-stone-700 mb-4"></div>
                  <p className="text-stone-400 text-sm mb-1">획득 포인트</p>
                  <p className="text-amber-400 text-2xl font-black">+{earnedPoints} P</p>
                </div>
                
                {acornPlays >= MAX_PLAYS ? (
                   <div className="flex items-center gap-2 text-red-400 bg-red-950/50 px-6 py-3 rounded-xl border border-red-900/50 mb-4">
                    <AlertCircle className="w-5 h-5" /> 오늘의 기회를 모두 사용했습니다.
                  </div>
                ) : (
                  <button onClick={startGame} className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
                    <RefreshCw className="w-5 h-5" /> 다시 도전하기
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}