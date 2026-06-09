import { Controller, Get, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MoodService, UpsertMoodDto } from './mood.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('mood')
export class MoodController {
  constructor(private service: MoodService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.service.findAll(user.id, month);
  }

  @Put()
  upsert(@CurrentUser() user: User, @Body() dto: UpsertMoodDto) {
    return this.service.upsert(user.id, dto);
  }

  @Delete(':date')
  remove(@CurrentUser() user: User, @Param('date') date: string) {
    return this.service.remove(user.id, date);
  }
}
