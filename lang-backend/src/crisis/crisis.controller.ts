import { Controller, Post, Body } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { CrisisSource } from '@prisma/client';

const SOURCE_VALUES: CrisisSource[] = ['phq9_q9', 'dass21_severe', 'community_post', 'chatbot', 'sos_button'];

export class LogCrisisDto {
  @IsIn(SOURCE_VALUES)
  source: CrisisSource;
}

@Controller('crisis')
export class CrisisController {
  constructor(private prisma: PrismaService) {}

  /** SOS button click — log ẩn danh, không lưu PII */
  @Public()
  @Post('log')
  async log(@Body() dto: LogCrisisDto) {
    await this.prisma.crisisEvent.create({ data: { source: dto.source } });
    return { ok: true };
  }
}
