import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

const CATEGORIES = ['tram_cam', 'lo_au', 'chanh_niem', 'chua_lanh', 'y_nghia', 'thoi_quen'];

export class CreateBookDto {
  @IsString() title: string;
  @IsString() author: string;
  @IsString() excerpt: string;
  @IsIn(CATEGORIES, { message: 'Danh mục không hợp lệ' }) category: string;
  @IsNumber() @Min(0) @Max(5) rating: number;
  @IsString() coverGradient: string;

  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() detail?: string;
  @IsOptional() @IsString() whyRead?: string;
  @IsOptional() @IsBoolean() reviewedByExpert?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateBookDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsIn(CATEGORIES) category?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsString() coverGradient?: string;
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() detail?: string;
  @IsOptional() @IsString() whyRead?: string;
  @IsOptional() @IsBoolean() reviewedByExpert?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
