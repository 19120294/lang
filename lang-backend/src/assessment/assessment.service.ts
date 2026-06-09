import { Injectable } from '@nestjs/common';
import { IsIn, IsObject, IsArray, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CrisisDetectorService } from '../common/crisis-detector.service';
import { TestType } from '@prisma/client';

const TEST_VALUES: TestType[] = ['phq9', 'gad7', 'dass21', 'epds', 'gds15', 'pss10'];

export class SaveAssessmentDto {
  @IsIn(TEST_VALUES)
  testId: TestType;

  @IsObject()
  scores: Record<string, number>;

  @IsArray()
  @IsInt({ each: true })
  answers: number[];

  @IsInt()
  @IsOptional()
  q9Score?: number;

  @IsBoolean()
  consentGiven: boolean;
}

@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService, private crisis: CrisisDetectorService) {}

  async save(userId: string | null, dto: SaveAssessmentDto) {
    // PHQ-9 câu 9 hoặc EPDS câu 10 (ý nghĩ tự hại) > 0, hoặc DASS-21 trầm cảm rất nặng
    const crisisTriggered =
      ((dto.testId === 'phq9' || dto.testId === 'epds') && (dto.q9Score ?? 0) > 0) ||
      (dto.testId === 'dass21' && (dto.scores['d'] ?? 0) >= 28);

    const result = await this.prisma.assessmentResult.create({
      data: {
        userId,
        testId: dto.testId,
        scores: dto.scores,
        answers: dto.answers,
        q9Score: dto.q9Score,
        crisisTriggered,
        consentGiven: dto.consentGiven,
      },
    });

    // Log crisis event — aggregate only, không lưu PII
    if (crisisTriggered) {
      await this.prisma.crisisEvent.create({
        data: {
          source: dto.testId === 'dass21' ? 'dass21_severe' : 'phq9_q9',
          testId: dto.testId,
          severity: dto.testId === 'dass21' ? 'dass21_d_severe' : 'self_harm_item_positive',
        },
      });
    }

    return { id: result.id, crisisTriggered };
  }

  async findHistory(userId: string) {
    return this.prisma.assessmentResult.findMany({
      where: { userId, consentGiven: true },
      select: { id: true, testId: true, scores: true, createdAt: true, crisisTriggered: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
