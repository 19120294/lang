import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private service: KnowledgeService) {}

  @Public() @Get()        findAll(@Query('q') q?: string, @Query('category') cat?: string) { return this.service.findAll(q, cat); }

  // ===== Admin (đặt trước :slug để không bị nuốt route) =====
  @UseGuards(JwtAuthGuard, AdminGuard) @Get('admin/all') adminAll() { return this.service.adminFindAll(); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Post()           create(@Body() dto: CreateArticleDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Patch(':id')     update(@Param('id') id: string, @Body() dto: UpdateArticleDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Delete(':id')    remove(@Param('id') id: string) { return this.service.remove(id); }

  @Public() @Get(':slug') findOne(@Param('slug') slug: string) { return this.service.findOne(slug); }
}
