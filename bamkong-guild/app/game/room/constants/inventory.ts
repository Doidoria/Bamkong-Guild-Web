// app/game/room/constants/inventory.ts

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  xPos: number;
  yPos: number;
  baseZIndex?: number;
  src: string;
  sizeClass: string;
  isLightSource?: boolean;
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  { 
    id: 'rug_01', name: '가을 낙엽 러그', type: 'floor', 
    xPos: 50, yPos: 94, baseZIndex: 1, 
    src: '/images/room/rug.png', 
    sizeClass: 'w-[120px] md:w-[145px]' 
  },
  { 
    id: 'bed_01', name: '도토리 침대', type: 'furniture', 
    xPos: 56, yPos: 62, 
    src: '/images/room/bed.png', 
    sizeClass: 'w-[150px] md:w-[200px]' 
  },
  { 
    id: 'table_01', name: '테이블', type: 'furniture', 
    xPos: 37, yPos: 85, 
    src: '/images/room/table.png', 
    sizeClass: 'w-[135px] md:w-[165px]' 
  },
  {
    id: 'chair_01', name: '도토리 의자', type: 'furniture',
    xPos: 31, yPos: 80,
    src: '/images/room/chair.png',
    sizeClass: 'w-[90px] md:w-[110px]'
  },
  { 
    id: 'window_01', name: '원형 창문', type: 'wall', 
    xPos: 22, yPos: 52, baseZIndex: 2, 
    src: '/images/room/window.png', 
    sizeClass: 'w-[80px] md:w-[100px]',
    isLightSource: true
  },
  {
    id: 'closet_01', name: '참나무 옷장', type: 'furniture',
    xPos: 46, yPos: 52,
    src: '/images/room/closet.png',
    sizeClass: 'w-[80px] md:w-[160px]'
  },
  {
    id: 'camera_01', name: '카메라', type: 'furniture',
    xPos: 56, yPos: 89,
    src: '/images/room/camera.png',
    sizeClass: 'w-[30px] md:w-[70px]'
  },
  {
    id: 'doll_01', name: '다람쥐 인형', type: 'furniture',
    xPos: 28, yPos: 82,
    src: '/images/room/doll.png',
    sizeClass: 'w-[40px] md:w-[90px]'
  },
  {
    id: 'flowerpot_01', name: '화분', type: 'furniture',
    xPos: 75, yPos: 78, 
    src: '/images/room/flowerpot.png',
    sizeClass: 'w-[80px] md:w-[90px]'
  },
  {
    id: 'trophy_01', name: '트로피', type: 'furniture',
    xPos: 28, yPos: 67,
    src: '/images/room/trophy.png',
    sizeClass: 'w-[100px] md:w-[100px]'
  },
  {
    id: 'album_01', name: '앨범', type: 'furniture',
    xPos: 41, yPos: 89,
    src: '/images/room/album.png',
    sizeClass: 'w-[150px] md:w-[100px]'
  },
];