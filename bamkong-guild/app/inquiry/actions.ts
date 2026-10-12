// app/inquiry/actions.ts
'use server';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { runMemberAction } from '@/app/lib/memberAction';
import { ValidationError, assertDocId, type ActionResult } from '@/app/lib/adminAction';
import { postDiscordWebhook, escapeDiscordMarkdown } from '@/app/lib/discordWebhook';
import {
  COLLECTIONS, INQUIRY_CATEGORIES, MAX_CONTENT, MIN_CONTENT, POST_COOLDOWN_MS,
  type InquiryCategory, type InquiryPage, type ReactionResult, type ReactionType,
} from './types';
import { fetchInquiryPage, reactionDocId, toCount, toReaction } from './inquiryStore';

export async function listInquiries(cursor: string | null = null): Promise<ActionResult<InquiryPage>> {
  return runMemberAction((member) => fetchInquiryPage(cursor, member.discordId), 'inquiry list');
}

export async function createInquiry(input: {
  category: InquiryCategory;
  content: string;
}): Promise<ActionResult<{ id: string }>> {
  return runMemberAction(async (member) => {
    const category = INQUIRY_CATEGORIES.find((c) => c === input?.category);
    if (!category) throw new ValidationError('분류를 선택해 주세요.');

    const content = typeof input?.content === 'string' ? input.content.trim() : '';
    if (content.length < MIN_CONTENT) throw new ValidationError(`내용을 ${MIN_CONTENT}자 이상 적어 주세요.`);
    if (content.length > MAX_CONTENT) throw new ValidationError(`내용은 ${MAX_CONTENT}자까지 쓸 수 있어요.`);

    const db = getAdminDb();
    const inquiryRef = db.collection(COLLECTIONS.inquiries).doc();
    const authorRef = db.collection(COLLECTIONS.authors).doc(inquiryRef.id);
    const cooldownRef = db.collection(COLLECTIONS.cooldowns).doc(member.discordId);

    // 쿨다운 확인과 저장을 한 트랜잭션으로 → 연타해도 1건만 저장
    await db.runTransaction(async (tx) => {
      const cooldown = await tx.get(cooldownRef);
      const lastAt = cooldown.get('lastAt');
      if (lastAt instanceof Timestamp && Date.now() - lastAt.toMillis() < POST_COOLDOWN_MS) {
        throw new ValidationError('문의는 1분에 한 번만 남길 수 있어요. 잠시 후 다시 시도해 주세요.');
      }

      const now = FieldValue.serverTimestamp();
      tx.set(inquiryRef, { category, content, up: 0, down: 0, createdAt: now });
      // 작성자는 별도 컬렉션에 분리 저장 → 목록 조회 때 절대 같이 나가지 않음
      tx.set(authorRef, { discordId: member.discordId, nickname: member.nickname ?? null, createdAt: now });
      tx.set(cooldownRef, { lastAt: now });
    });

    // 관리자 알림 (작성자 정보 제외). 알림 실패가 등록 실패가 되지 않도록 기록만 남김
    const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;
    if (webhookUrl) {
      const preview = content.length > 200 ? `${content.slice(0, 200)}…` : content;
      const sent = await postDiscordWebhook(webhookUrl, [
        {
          title: `📮 새 익명 문의 · ${category}`,
          description: escapeDiscordMarkdown(preview),
          color: 16100911,
          timestamp: new Date().toISOString(),
        },
      ]).catch(() => false);
      if (!sent) console.error('[inquiry] 웹후크 전송 실패');
    }

    return { id: inquiryRef.id };
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