import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CommunityService, CreatePostDto } from './community.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

export class ApproveDto {
  @IsBoolean() @IsOptional() hasCW?: boolean;
  @IsString()  @IsOptional() cwLabel?: string;
}
export class RejectDto {
  @IsString() @IsOptional() note?: string;
}

@Controller('community')
export class CommunityController {
  constructor(private service: CommunityService) {}

  @Public() @Get()                   findApproved() { return this.service.findApproved(); }
  @Public() @Post(':id/react/:type') react(@Param('id') id: string, @Param('type') type: 'like' | 'hug') { return this.service.react(id, type); }
  @Public() @Post(':id/report')      report(@Param('id') id: string) { return this.service.report(id); }

  // Submit cần auth (kể cả guest token)
  @UseGuards(JwtAuthGuard)
  @Post()
  submit(@Body() dto: CreatePostDto, @Request() req: any) {
    return this.service.submit(req.user?.id ?? null, dto);
  }

  // ===== MODERATION — chỉ admin =====
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('pending')
  findPending() { return this.service.findPending(); }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveDto) {
    return this.service.approve(id, dto.hasCW ?? false, dto.cwLabel);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.reject(id, dto.note);
  }
}
