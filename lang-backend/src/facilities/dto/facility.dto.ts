import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

const AREAS = ['hn', 'hcm', 'dn', 'online'];
const COSTS = ['free', 'insurance', 'affordable', 'private_pay'];
const TYPES = ['online', 'clinic', 'hospital'];

export class CreateFacilityDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsOptional() @IsString() address?: string;
  @IsIn(AREAS, { message: 'Khu vực không hợp lệ' }) area: string;
  @IsArray() @IsIn(COSTS, { each: true }) cost: string[];
  @IsArray() @IsIn(TYPES, { each: true }) type: string[];
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsString() hours: string;
  @IsArray() @IsString({ each: true }) tags: string[];
  @IsOptional() @IsBoolean() verified?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateFacilityDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsIn(AREAS) area?: string;
  @IsOptional() @IsArray() @IsIn(COSTS, { each: true }) cost?: string[];
  @IsOptional() @IsArray() @IsIn(TYPES, { each: true }) type?: string[];
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() hours?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() verified?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
