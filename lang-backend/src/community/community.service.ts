import { Injectable, ForbiddenException } from '@nestjs/common';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CrisisDetectorService } from '../common/crisis-detector.service';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService, private crisis: CrisisDetectorService) {}

  /** Chỉ trả về bài đã duyệt — public */
  findApproved() {
    return this.prisma.communityPost.findMany({
      where: { status: 'approved' },
      select: { id: true, content: true, hasCW: true, cwLabel: true, likes: true, hugs: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** Submit bài — luôn vào hàng chờ kiểm duyệt */
  async submit(userId: string | null, dto: CreatePostDto) {
    const riskDetected = this.crisis.detect(dto.content);

    const post = await this.prisma.communityPost.create({
      data: { userId, content: dto.content, riskDetected, status: 'pending' },
    });

    // Log crisis event nếu phát hiện rủi ro
    if (riskDetected) {
      await this.prisma.crisisEvent.create({
        data: { source: 'community_post', severity: 'keyword_detected' },
      });
    }

    return { id: post.id, status: 'pending', riskDetected };
  }

  async react(postId: string, type: 'like' | 'hug') {
    return this.prisma.communityPost.update({
      where: { id: postId, status: 'approved' },
      data: type === 'like' ? { likes: { increment: 1 } } : { hugs: { increment: 1 } },
      select: { id: true, likes: true, hugs: true },
    });
  }

  // ===== MODERATION (admin) =====

  /** Bài cần admin xử lý: chờ duyệt + bị báo cáo. Ưu tiên rủi ro lên đầu */
  findPending() {
    return this.prisma.communityPost.findMany({
      where: { status: { in: ['pending', 'flagged'] } },
      orderBy: [{ riskDetected: 'desc' }, { status: 'asc' }, { createdAt: 'asc' }],
    });
  }

  approve(id: string, hasCW: boolean, cwLabel?: string) {
    return this.prisma.communityPost.update({
      where: { id },
      data: { status: 'approved', hasCW, cwLabel: hasCW ? cwLabel : null },
    });
  }

  reject(id: string, note?: string) {
    return this.prisma.communityPost.update({
      where: { id },
      data: { status: 'rejected', moderatorNote: note },
    });
  }

  /**
   * Người dùng báo cáo bài viết → chuyển sang 'flagged' (ẩn khỏi feed,
   * ưu tiên cho admin xem lại). Trả về tối thiểu, không lộ thông tin.
   */
  async report(id: string) {
    await this.prisma.communityPost.updateMany({
      where: { id, status: 'approved' },
      data: { status: 'flagged', moderatorNote: 'Bị người dùng báo cáo' },
    });
    return { ok: true };
  }

  /** Bài bị flagged — admin xem lại (gộp chung trang kiểm duyệt) */
  findFlagged() {
    return this.prisma.communityPost.findMany({
      where: { status: 'flagged' },
      orderBy: { updatedAt: 'asc' },
    });
  }
}
