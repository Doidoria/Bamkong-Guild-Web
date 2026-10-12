// app/inquiry/actions.ts
'use server';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { runMemberAction } from '@/app/lib/memberAction';
import { ValidationError, assertDocId, type ActionResult } from '@/app/lib/adminAction';
import { postDiscordWebhook, escapeDiscordMarkdown } from '@/app/lib/discordWebhook';
import {
  COLLECTIONS, INQUIRY_CATEGORIES, MAX_CONTENT, MAX_TITLE, MIN_CONTENT, MIN_TITLE, RATE_LIMIT,
  type InquiryCategory, type InquiryPage, type ListParams, type ReactionResult, type ReactionType,
} from './types';
import { fetchInquiryPage, parseListParams, reactionDocId, toCount, toReaction } from './inquiryStore';

export async function listInquiries(params: ListParams): Promise<ActionResult<InquiryPage>> {
  return runMemberAction((member) => fetchInquiryPage(parseListParams(params), member.discordId), 'inquiry list');
}

function cleanText(value: unknown, min: number, max: number, label: string): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min) throw new ValidationError(`${label}을 ${min}자 이상 적어 주세요.`);
  if (text.length > max) throw new ValidationError(`${label}은 ${max}자까지 쓸 수 있어요.`);
  return text;
}

export async function createInquiry(input: {
  category: InquiryCategory;
  title: string;
  content: string;
}): Promise<ActionResult<null>> {
  // 길드원 확인만 하고 세션 정보는 일부러 쓰지 않음 → 작성자 기록이 어디에도 남지 않음
  return runMemberAction(async () => {
    const category = INQUIRY_CATEGORIES.find((c) => c === input?.category);
    if (!category) throw new ValidationError('분류를 선택해 주세요.');

    const title = cleanText(input?.title, MIN_TITLE, MAX_TITLE, '제목').replace(/\s+/g, ' ');
    const content = cleanText(input?.content, MIN_CONTENT, MAX_CONTENT, '내용');

    const db = getAdminDb();
    const inquiryRef = db.collection(COLLECTIONS.inquiries).doc();
    const rateRef = db.collection(COLLECTIONS.meta).doc('rate');

    // 전체 속도 제한 확인과 저장을 한 트랜잭션으로
    await db.runTransaction(async (tx) => {
      const rate = await tx.get(rateRef);
      const windowStart = rate.get('windowStart');
      const count = toCount(rate.get('count'));
      const inWindow =
        windowStart instanceof Timestamp && Date.now() - windowStart.toMillis() < RATE_LIMIT.windowMs;

      if (inWindow && count >= RATE_LIMIT.max) {
        throw new ValidationError('지금 문의가 많이 몰리고 있어요. 잠시 후 다시 시도해 주세요.');
      }

      tx.set(rateRef, inWindow ? { windowStart, count: count + 1 } : { windowStart: Timestamp.now(), count: 1 });
      tx.set(inquiryRef, {
        category,
        title,
        content,
        status: '접수',
        up: 0,
        down: 0,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    // 관리자 알림. 알림 실패가 등록 실패가 되지 않도록 기록만 남김
    const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;
    if (webhookUrl) {
      const preview = content.length > 200 ? `${content.slice(0, 200)}…` : content;
      const sent = await postDiscordWebhook(webhookUrl, [
        {
          title: `📮 새 익명 문의 · ${category}`,
          description: `**${escapeDiscordMarkdown(title)}**\n${escapeDiscordMarkdown(preview)}`,
          color: 16100911,
          timestamp: new Date().toISOString(),
        },
      ]).catch(() => false);
      if (!sent) console.error('[inquiry] 웹후크 전송 실패');
    }

    return null;
  }, 'inquiry create');
}

/** 👍/👎 중 하나만. 같은 걸 다시 누르면 취소, 다른 걸 누르면 변경 */
export async function reactToInquiry(
  inquiryId: string,
  type: ReactionType,
): Promise<ActionResult<ReactionResult>> {
  return runMemberAction(async (member) => {
    const id = assertDocId(inquiryId, '문의 ID');
    if (type !== 'up' && type !== 'down') throw new ValidationError('잘못된 반응입니다.');

    const db = getAdminDb();
    const inquiryRef = db.collection(COLLECTIONS.inquiries).doc(id);
    const reactionRef = db.collection(COLLECTIONS.reactions).doc(reactionDocId(id, member.discordId));

    return db.runTransaction(async (tx) => {
      const [inquiry, reaction] = await tx.getAll(inquiryRef, reactionRef);
      if (!inquiry?.exists) throw new ValidationError('삭제된 문의입니다.');

      const prev = toReaction(reaction?.get('type'));
      const counts = { up: toCount(inquiry.get('up')), down: toCount(inquiry.get('down')) };
      let mine: ReactionType | null;

      if (prev === type) {
        counts[type] -= 1;
        mine = null;
        tx.delete(reactionRef);
      } else {
        if (prev) counts[prev] -= 1;
        counts[type] += 1;
        mine = type;
        tx.set(reactionRef, {
          inquiryId: id,
          userId: member.discordId,
          type,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      counts.up = Math.max(0, counts.up);
      counts.down = Math.max(0, counts.down);
      tx.update(inquiryRef, counts);
      return { ...counts, mine };
    });
  }, 'inquiry react');
}