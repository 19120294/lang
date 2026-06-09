import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const CATEGORIES = ['lo_au', 'tram_cam', 'giac_ngu', 'cang_thang', 'quan_he', 'tu_cham_soc'];

export class CreateArticleDto {
  @IsString() slug: string;
  @IsString() title: string;
  @IsString() excerpt: string;
  @IsString() content: string;
  @IsIn(CATEGORIES, { message: 'Danh mục không hợp lệ' }) category: string;
  @IsInt() @Min(1) readMinutes: number;
  @IsString() reviewedBy: string;
  @IsArray() @IsString({ each: true }) tags: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) sources?: string[];
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsIn(CATEGORIES) category?: string;
  @IsOptional() @IsInt() @Min(1) readMinutes?: number;
  @IsOptional() @IsString() reviewedBy?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) sources?: string[];
  @IsOptional() @IsBoolean() published?: boolean;
}
