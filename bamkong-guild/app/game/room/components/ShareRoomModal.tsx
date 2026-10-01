// app/game/room/components/ShareRoomModal.tsx
'use client';

import React, { useState } from 'react';
import { domToPng } from 'modern-screenshot'; 
import { Camera, Download, Send, X, Loader2 } from 'lucide-react';
import { shareRoomToDiscord } from '../actions';

const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

interface ShareRoomModalProps {
  roomRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  userName: string;
}

export default function ShareRoomModal({ roomRef, onClose, userName }: ShareRoomModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  /** 디스코드 전송용: PNG dataURL → JPEG Blob (가로 최대 1920px) */
  async function compressForDiscord(dataUrl: string, maxWidth = 1920, quality = 0.85): Promise<Blob> {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    const ratio = Math.min(1, maxWidth / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('캔버스를 생성할 수 없습니다.');

    // JPEG는 투명도가 없으므로 배경색을 먼저 칠함
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('이미지 변환에 실패했습니다.'))),
        'image/jpeg',
        quality,
      );
    });
  }

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
      const blob = await compressForDiscord(previewUrl);
      if (blob.size > MAX_UPLOAD_BYTES) {
        alert('이미지 용량이 너무 큽니다. 다시 캡처해 주세요.');
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'room.jpg');

      const result = await shareRoomToDiscord(formData);
      alert(result.message);
      if (result.ok) onClose();
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