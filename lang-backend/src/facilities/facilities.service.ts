import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto } from './dto/facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  findAll(area?: string, cost?: string, type?: string) {
    return this.prisma.facility.findMany({
      where: {
        published: true,
        ...(area && { area: area as any }),
        ...(cost && { cost: { has: cost as any } }),
        ...(type && { type: { has: type as any } }),
      },
      orderBy: [{ verified: 'desc' }, { name: 'asc' }],
    });
  }

  // ===== Admin =====
  adminFindAll() {
    return this.prisma.facility.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateFacilityDto) {
    return this.prisma.facility.create({
      data: {
        ...dto,
        area: dto.area as any,
        cost: dto.cost as any,
        type: dto.type as any,
        verified: dto.verified ?? false,
        published: dto.published ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateFacilityDto) {
    await this.ensureExists(id);
    return this.prisma.facility.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.area && { area: dto.area as any }),
        ...(dto.cost && { cost: dto.cost as any }),
        ...(dto.type && { type: dto.type as any }),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.facility.delete({ where: { id } });
    return { message: 'Đã xóa cơ sở' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.facility.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy cơ sở');
  }
}
