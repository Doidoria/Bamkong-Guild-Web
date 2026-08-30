// app/admin/utils.ts
// 오늘 날짜 기준 가입 경과 일수 계산
export const getDaysSinceJoined = (joinedAtStr: string) => {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const joinedDate = new Date(joinedAtStr);
  const jDate = new Date(joinedDate.getFullYear(), joinedDate.getMonth(), joinedDate.getDate());
  
  const diffTime = todayDate.getTime() - jDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24))); // 경과 일수이므로 오늘이면 0일
};

export const getDaysSinceLastPromotion = (joinedAt: string, lastPromotedAt?: string) => {
  const targetDateStr = lastPromotedAt || joinedAt;
  
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const target = new Date(targetDateStr);
  const tDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  
  const diffTime = todayDate.getTime() - tDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24))); // 경과 일수이므로 오늘이면 0일
};

export const getPromotionInfo = (currentRank: string, customReqDays?: number | null) => {
  let defaultDays = 0;
  let nextRank = '';
  switch (currentRank) {
    case '새싹':
      defaultDays = 1;
      nextRank = '밤콩';
      break;
    case '밤콩':
      defaultDays = 30;
      nextRank = '알밤콩';
      break;
    case '알밤콩':
      defaultDays = 90;
      nextRank = '명예 밤콩';
      break;
    default:
      return null; // '명예 밤콩', '부대장'은 자동 계산 제외
  }

  // 수동 지정값이 입력되어 있으면 해당 값을 쓰고, 없으면 기본값 사용!
  const reqDays = (customReqDays !== undefined && customReqDays !== null && customReqDays > 0) 
    ? customReqDays 
    : defaultDays;

  return { nextRank, reqDays };
};