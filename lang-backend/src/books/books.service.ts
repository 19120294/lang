import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.book.findMany({
      where: { published: true, ...(category && { category: category as any }) },
      orderBy: [{ reviewedByExpert: 'desc' }, { rating: 'desc' }],
    });
  }

  // ===== Admin =====
  adminFindAll() {
    return this.prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: { ...dto, category: dto.category as any, reviewedByExpert: dto.reviewedByExpert ?? false, published: dto.published ?? false },
    });
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.ensureExists(id);
    return this.prisma.book.update({
      where: { id },
      data: { ...dto, ...(dto.category && { category: dto.category as any }) },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.book.delete({ where: { id } });
    return { message: 'Đã xóa sách' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.book.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy sách');
  }
}
