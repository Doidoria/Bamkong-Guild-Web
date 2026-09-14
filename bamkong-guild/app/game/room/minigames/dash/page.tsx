// app/game/room/minigames/dash/page.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, RefreshCw, Award, AlertCircle } from 'lucide-react';
import { useBamkongGrowth } from '@/app/game/hooks/useBamkongGrowth';
import { toast } from 'sonner';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  passed: boolean;
}

export default function BamkongDashPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  // 훅에서 Dash 전용 데이터 가져오기 (가정)
  const { handleDashPlay, dashPlays = 0, isLoading } = useBamkongGrowth();
  const MAX_PLAYS = 5;
  
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0); // 달린 거리
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  const requestRef = useRef<number>(0);
  const frameRef = useRef(0);
  const nextSpawnFrameRef = useRef(100);
  
  // 물리 엔진 변수
  const gravity = 0.5;
  const jumpPower = -11;
  const groundY = 320; // 바닥 높이

  const playerRef = useRef({ 
    x: 100, 
    y: groundY, 
    width: 48, 
    height: 48, 
    velocityY: 0, 
    isJumping: false 
  });
  const obstaclesRef = useRef<Obstacle[]>([]);

  // 점프 액션
  const jump = useCallback(() => {
    if (gameState === 'PLAYING' && !playerRef.current.isJumping) {
      playerRef.current.velocityY = jumpPower;
      playerRef.current.isJumping = true;
    }
  }, [gameState]);

  // 키보드 & 클릭 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const startGame = () => {
    if (dashPlays >= MAX_PLAYS) {
      toast.error('오늘 도전 기회를 모두 소진했습니다! 내일 다시 도전해 주세요.');
      return;
    }
    setGameState('PLAYING');
    setScore(0);
    setEarnedPoints(0);
    obstaclesRef.current = [];
    frameRef.current = 0;
    nextSpawnFrameRef.current = 100;
    
    // 플레이어 초기화
    playerRef.current.y = groundY;
    playerRef.current.velocityY = 0;
    playerRef.current.isJumping = false;
  };

  const gameOver = async () => {
    setGameState('GAMEOVER');
    cancelAnimationFrame(requestRef.current!);
    
    const finalScore = Math.floor(frameRef.current / 5);
    
    const calculatedPoints = Math.min(200, Math.floor(finalScore / 20));
    setEarnedPoints(calculatedPoints);

    if (dashPlays < MAX_PLAYS) {
      if (handleDashPlay) {
        await handleDashPlay(calculatedPoints);
        if (calculatedPoints > 0) {
          toast.success(`질주 성공! ${calculatedPoints} P를 획득했습니다.`);
        } else {
          toast.info('조금 더 멀리 달려보세요! (0 P 획득)');
        }
      }
    }
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    frameRef.current++;
    
    // 스코어(거리) 증가
    if (frameRef.current % 5 === 0) setScore(prev => prev + 1);

    const baseSpeed = 5 + Math.floor(frameRef.current / 800);

    if (frameRef.current >= nextSpawnFrameRef.current) {
      const isLarge = Math.random() > 0.8;
      const obsWidth = isLarge ? 48 : 32;
      const obsHeight = isLarge ? 48 : 32;

      obstaclesRef.current.push({
        x: canvas.width,
        y: groundY + 48 - obsHeight, // 바닥 높이에 정확히 맞춤
        width: obsWidth,
        height: obsHeight,
        speed: baseSpeed,
        passed: false
      });

      const minGap = Math.max(60, 120 - Math.floor(frameRef.current / 100));
      nextSpawnFrameRef.current = frameRef.current + minGap + Math.floor(Math.random() * 40);
    }

    // 물리 업데이트 (중력 적용)
    playerRef.current.velocityY += gravity;
    playerRef.current.y += playerRef.current.velocityY;

    // 바닥 충돌 체크
    if (playerRef.current.y >= groundY) {
      playerRef.current.y = groundY;
      playerRef.current.velocityY = 0;
      playerRef.current.isJumping = false;
    }

    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 바닥 그리기
    ctx.fillStyle = '#292524'; // stone-800
    ctx.fillRect(0, groundY + playerRef.current.height, canvas.width, canvas.height - groundY);

    // 플레이어 그리기 (앰버 컬러)
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 장애물 업데이트 및 충돌 체크
    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const obs = obstaclesRef.current[i];
      obs.x -= obs.speed;

      // 장애물 그리기 (돌/가시 느낌)
      ctx.fillStyle = '#ef4444'; // red-500
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
      ctx.fill();

      // 충돌 판정 (Hitbox 보정 -4px)
      const shrink = 4;
      if (
        playerRef.current.x + shrink < obs.x + obs.width &&
        playerRef.current.x + playerRef.current.width - shrink > obs.x &&
        playerRef.current.y + shrink < obs.y + obs.height &&
        playerRef.current.y + playerRef.current.height - shrink > obs.y
      ) {
        gameOver();
        return;
      }

      // 화면 밖으로 나간 장애물 제거
      if (obs.x + obs.width < 0) {
        obstaclesRef.current.splice(i, 1);
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
      {/* 2D 횡스크롤 느낌의 배경 패턴 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '100px 100%' }}>
      </div>
      
      <div className="w-full max-w-[800px] flex justify-between items-center mb-6 z-10 relative">
        <button onClick={() => router.push('/game/room/minigames')}
          className="flex items-center gap-2 text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> 게임 목록으로
        </button>
        
        <div className="flex gap-3">
          <div className="bg-stone-800/80 border border-stone-600 px-4 py-2 rounded-xl text-stone-300 font-bold flex items-center gap-2">
            도전 횟수 <span className={`${dashPlays >= MAX_PLAYS ? 'text-red-400' : 'text-amber-400'}`}>{MAX_PLAYS - dashPlays} / {MAX_PLAYS}</span>
          </div>
          {gameState === 'PLAYING' && (
            <div className="bg-amber-950/80 border border-amber-500/50 px-6 py-2 rounded-xl text-amber-400 font-bold font-mono text-xl tracking-wider min-w-[120px] text-center">
              {score} m
            </div>
          )}
        </div>
      </div>

      {/* 게임 캔버스 영역 */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-stone-800 bg-stone-950/80 z-10 w-full max-w-[800px] aspect-[2/1] cursor-pointer"
        onPointerDown={jump}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full block"
        />

        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            {gameState === 'START' ? (
              <>
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-amber-500/30">
                  <Play className="w-10 h-10 text-amber-500 ml-1" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">달려라 밤콩!</h1>
                <p className="text-stone-300 mb-6 text-lg">
                  화면을 클릭하거나 <kbd className="bg-stone-800 px-2 py-1 rounded-md text-amber-400 font-mono">Space</kbd> 키를 눌러 점프하세요!<br/>장애물을 피하고 끝없이 달려 포인트를 획득하세요.
                </p>
                {dashPlays >= MAX_PLAYS ? (
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/50 px-6 py-3 rounded-xl border border-red-900/50">
                    <AlertCircle className="w-5 h-5" /> 오늘의 도전 기회를 모두 사용했습니다.
                  </div>
                ) : (
                  <button onClick={startGame} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-10 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    <Play className="fill-current w-6 h-6" /> 달리기 시작
                  </button>
                )}
              </>
            ) : (
              <>
                <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h2>
                <div className="bg-stone-900 border border-stone-700 p-6 rounded-2xl mt-6 mb-8 min-w-[280px]">
                  <p className="text-stone-400 text-sm mb-1">달린 거리</p>
                  <p className="text-white text-3xl font-black font-mono mb-4">{score}<span className="text-lg text-stone-500 ml-1">m</span></p>
                  <div className="h-px w-full bg-stone-700 mb-4"></div>
                  <p className="text-stone-400 text-sm mb-1">획득 포인트</p>
                  <p className="text-amber-400 text-2xl font-black">+{earnedPoints} P</p>
                </div>
                
                {dashPlays >= MAX_PLAYS ? (
                   <div className="flex items-center gap-2 text-red-400 bg-red-950/50 px-6 py-3 rounded-xl border border-red-900/50 mb-4">
                    <AlertCircle className="w-5 h-5" /> 오늘의 기회를 모두 사용했습니다.
                  </div>
                ) : (
                  <button onClick={startGame} className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
                    <RefreshCw className="w-5 h-5" /> 다시 달리기
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