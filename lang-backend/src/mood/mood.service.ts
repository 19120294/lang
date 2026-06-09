import { Injectable } from '@nestjs/common';
import { IsString, IsIn, IsOptional, Matches } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { MoodLevel } from '@prisma/client';

const MOOD_VALUES: MoodLevel[] = ['great', 'ok', 'anxious', 'angry', 'bad'];

export class UpsertMoodDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date phải có dạng YYYY-MM-DD' })
  date: string;

  @IsIn(MOOD_VALUES)
  mood: MoodLevel;

  @IsString()
  @IsOptional()
  note?: string;
}

@Injectable()
export class MoodService {
  constructor(private prisma: PrismaService, private enc: EncryptionService) {}

  async upsert(userId: string, dto: UpsertMoodDto) {
    return this.prisma.moodEntry.upsert({
      where: { userId_date: { userId, date: dto.date } },
      create: { userId, date: dto.date, mood: dto.mood, noteEnc: dto.note ? this.enc.encrypt(dto.note) : null },
      update: { mood: dto.mood, noteEnc: dto.note ? this.enc.encrypt(dto.note) : null },
    });
  }

  async findAll(userId: string, month?: string) {
    const where: any = { userId };
    if (month) where.date = { startsWith: month }; // YYYY-MM
    const entries = await this.prisma.moodEntry.findMany({ where, orderBy: { date: 'desc' } });
    return entries.map(e => ({ ...e, note: this.enc.safeDecrypt(e.noteEnc), noteEnc: undefined }));
  }

  async remove(userId: string, date: string) {
    return this.prisma.moodEntry.deleteMany({ where: { userId, date } });
  }
}
