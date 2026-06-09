import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AssessmentService, SaveAssessmentDto } from './assessment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('assessment')
export class AssessmentController {
  constructor(private service: AssessmentService) {}

  // Xác thực tùy chọn: có token → gắn userId; không có → ẩn danh (userId null)
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('save')
  save(@Body() dto: SaveAssessmentDto, @Request() req: any) {
    const userId = req.user?.id ?? null;
    return this.service.save(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@CurrentUser() user: User) {
    return this.service.findHistory(user.id);
  }
}
