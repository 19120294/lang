import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Controller('books')
export class BooksController {
  constructor(private service: BooksService) {}

  @Public() @Get() findAll(@Query('category') cat?: string) { return this.service.findAll(cat); }

  // ===== Admin =====
  @UseGuards(JwtAuthGuard, AdminGuard) @Get('admin/all') adminAll() { return this.service.adminFindAll(); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Post()           create(@Body() dto: CreateBookDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Patch(':id')     update(@Param('id') id: string, @Body() dto: UpdateBookDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Delete(':id')    remove(@Param('id') id: string) { return this.service.remove(id); }
}
