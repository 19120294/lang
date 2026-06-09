import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JournalService, CreateJournalDto, UpdateJournalDto } from './journal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private service: JournalService) {}
  @Get()      findAll(@CurrentUser() u: User)                          { return this.service.findAll(u.id); }
  @Post()     create(@CurrentUser() u: User, @Body() dto: CreateJournalDto) { return this.service.create(u.id, dto); }
  @Patch(':id') update(@CurrentUser() u: User, @Param('id') id: string, @Body() dto: UpdateJournalDto) { return this.service.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: User, @Param('id') id: string) { return this.service.remove(u.id, id); }
}
