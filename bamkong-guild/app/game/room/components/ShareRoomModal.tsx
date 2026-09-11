'use client';

import React, { useState } from 'react';
import { domToPng } from 'modern-screenshot'; 
import { Camera, Download, Send, X, Loader2 } from 'lucide-react';

interface ShareRoomModalProps {
  roomRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  userName: string;
}

export default function ShareRoomModal({ roomRef, onClose, userName }: ShareRoomModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleCapture = async () => {
    if (!roomRef.current) return;
    setIsCapturing(true);
    
    try {
      // 💡 Turbopack 환경과 oklab 색상 충돌을 모두 우회하는 최적화된 캡처 실행
      const dataUrl = await domToPng(roomRef.current, {
        scale: 2, // 1920x1080 고화질 대응 (pixelRatio 역할)
        backgroundColor: '#1c1917', // 빈 공간 발생 시 배경색
        fetch: {
          bypassingCache: true, // 이미지 캐시 충돌 방지
        },
        // Framer Motion 요소의 크기 틀어짐 방지
        style: {
          transform: 'none',
        }
      });
      
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('화면 캡처에 실패했습니다. (관리자에게 문의해 주세요)');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `${userName}_bamkong_room.png`;
    link.click();
  };

  const handleDiscordShare = async () => {
    if (!previewUrl) return;
    setIsSending(true);
    
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const formData = new FormData();
      const payload = {
        embeds: [
          {
            title: "🌰 밤콩이 방 자랑하기!",
            description: `**${userName}**님이 정성스럽게 꾸민 방이에요!\n어떤가요? 너무 아늑해 보이지 않나요? ✨`,
            color: 16100911, // Tailwind amber-500 색상의 Decimal 값 (0xf59e0b)
            image: {
              url: "attachment://room.png" // 하단에 첨부된 파일을 이미지 레이아웃으로 삽입
            },
            footer: {
              text: "테일즈런너 밤콩 길드 웹 시스템"
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      // 단순 텍스트(content) 대신 payload_json으로 Embed 데이터를 전송합니다.
      formData.append('payload_json', JSON.stringify(payload));
      formData.append('file', blob, 'room.png');

      const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || ''; 
      
      if (!webhookUrl) {
        alert('디스코드 웹후크 URL이 설정되지 않았습니다.');
        return;
      }

      await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      alert('디스코드 자랑하기 성공!');
      onClose();
    } catch (error) {
      console.error('디스코드 전송 실패:', error);
      alert('디스코드 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-stone-800/50">
          <h3 className="text-xl font-bold text-stone-200 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            내 방 자랑하기
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          {!previewUrl ? (
            <button 
              onClick={handleCapture}
              disabled={isCapturing}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                {isCapturing ? <Loader2 className="w-8 h-8 text-amber-500 animate-spin" /> : <Camera className="w-8 h-8 text-amber-500" />}
              </div>
              <span className="text-stone-300 font-medium group-hover:text-amber-400 transition-colors">
                {isCapturing ? '방을 촬영하는 중...' : '클릭하여 멋진 방 캡처하기'}
              </span>
            </button>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <img src={previewUrl} alt="Preview" className="w-full rounded-xl border border-white/10 shadow-lg object-contain bg-black" />
              <div className="flex gap-4 w-full">
                <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600 text-white py-3 rounded-xl font-bold transition-colors">
                  <Download className="w-5 h-5" /> 이미지 저장
                </button>
                <button onClick={handleDiscordShare} disabled={isSending} className="flex-1 flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 
                  {isSending ? '전송 중...' : '디스코드 자랑하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}