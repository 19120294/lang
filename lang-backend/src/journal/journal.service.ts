import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IsString, IsOptional, IsIn, MinLength, Matches } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { MoodLevel } from '@prisma/client';

const MOOD_VALUES: MoodLevel[] = ['great', 'ok', 'anxious', 'angry', 'bad'];

export class CreateJournalDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsIn(MOOD_VALUES)
  @IsOptional()
  mood?: MoodLevel;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  date?: string;
}

export class UpdateJournalDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  title?: string;
}

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService, private enc: EncryptionService) {}

  async create(userId: string, dto: CreateJournalDto) {
    return this.prisma.journalEntry.create({
      data: {
        userId,
        date: dto.date ?? new Date().toISOString().slice(0, 10),
        contentEnc: this.enc.encrypt(dto.content),
        titleEnc: dto.title ? this.enc.encrypt(dto.title) : null,
        mood: dto.mood,
      },
    }).then(e => this.decrypt(e));
  }

  async findAll(userId: string) {
    const entries = await this.prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return entries.map(e => this.decrypt(e));
  }

  async update(userId: string, id: string, dto: UpdateJournalDto) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException();
    if (entry.userId !== userId) throw new ForbiddenException();
    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        ...(dto.content && { contentEnc: this.enc.encrypt(dto.content) }),
        ...(dto.title !== undefined && { titleEnc: dto.title ? this.enc.encrypt(dto.title) : null }),
      },
    }).then(e => this.decrypt(e));
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException();
    if (entry.userId !== userId) throw new ForbiddenException();
    return this.prisma.journalEntry.delete({ where: { id } });
  }

  private decrypt(e: any) {
    return {
      id: e.id, date: e.date, mood: e.mood, createdAt: e.createdAt, updatedAt: e.updatedAt,
      title:   this.enc.safeDecrypt(e.titleEnc),
      content: this.enc.safeDecrypt(e.contentEnc) ?? '',
    };
  }
}
