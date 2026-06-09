import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateFacilityDto, UpdateFacilityDto } from './dto/facility.dto';

@Controller('facilities')
export class FacilitiesController {
  constructor(private service: FacilitiesService) {}

  @Public() @Get() findAll(@Query('area') area?: string, @Query('cost') cost?: string, @Query('type') type?: string) {
    return this.service.findAll(area, cost, type);
  }

  // ===== Admin =====
  @UseGuards(JwtAuthGuard, AdminGuard) @Get('admin/all') adminAll() { return this.service.adminFindAll(); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Post()           create(@Body() dto: CreateFacilityDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Patch(':id')     update(@Param('id') id: string, @Body() dto: UpdateFacilityDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard, AdminGuard) @Delete(':id')    remove(@Param('id') id: string) { return this.service.remove(id); }
}
