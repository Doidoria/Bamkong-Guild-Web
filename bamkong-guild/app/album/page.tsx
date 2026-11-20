// app/album/page.tsx
import type { Metadata } from 'next';
import SubPageShell from '../components/SubPageShell';
import AlbumGallery from '../components/AlbumGallery';

export const metadata: Metadata = {
  title: '밤콩 길드 앨범',
  description: '밤콩 길드의 따뜻한 추억들을 구경해보세요',
};

export default function AlbumPage() {
  return (
    <SubPageShell
      pageTitle="추억 앨범"
      eyebrow="ALBUM"
      title="밤콩들의 따뜻한 기록"
      description="밤콩들의 '오순도순' 기념적인 사진 앨범들을 모아두는 곳이에요!"
    >
      <AlbumGallery />
    </SubPageShell>
  );
}
