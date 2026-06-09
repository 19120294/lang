import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  findAll(q?: string, category?: string) {
    return this.prisma.article.findMany({
      where: {
        published: true,
        ...(category && { category: category as any }),
        ...(q && { OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ]}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.article.findFirst({ where: { slug, published: true } });
  }

  // ===== Admin =====
  adminFindAll() {
    return this.prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateArticleDto) {
    return this.prisma.article.create({
      data: { ...dto, category: dto.category as any, sources: dto.sources ?? [], published: dto.published ?? false },
    });
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.ensureExists(id);
    return this.prisma.article.update({
      where: { id },
      data: { ...dto, ...(dto.category && { category: dto.category as any }) },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.article.delete({ where: { id } });
    return { message: 'Đã xóa bài viết' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.article.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy bài viết');
  }
}
