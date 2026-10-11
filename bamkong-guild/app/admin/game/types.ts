// app/admin/game/types.ts
export const MAX_AP = 15;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 200;
export const EVOLUTION_LEVEL = 100;

export interface BamkongUser {
  id: string;
  name?: string;          // NextAuth 기본 닉네임
  guildNickname?: string; // 길드 서버 별명
  globalName: string;
  level: number;
  exp: number;
  ap: number;
}

/** 액션 결과로 클라이언트 상태에 덮어쓸 값 */
export type GameUserPatch = Partial<Pick<BamkongUser, 'level' | 'exp' | 'ap'>>;