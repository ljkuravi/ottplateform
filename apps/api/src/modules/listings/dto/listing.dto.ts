import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccessType, ListingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InventorySlotDto {
  @ApiProperty({ example: 'netflix.user1@gmail.com' })
  @IsString()
  @IsNotEmpty()
  accountEmailOrId: string;

  @ApiProperty({ example: 'Pass: MySecret#99 | Profile: Screen 1 | PIN: 1234' })
  @IsString()
  @IsNotEmpty()
  credentials: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @ApiProperty({ example: 'Netflix Premium 4K - Private Screen' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Ultra HD 4K' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  durationMonths: number;

  @ApiProperty({ example: 189.0 })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ example: 649.0, required: false })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiProperty({ enum: AccessType, default: AccessType.SHARED_SCREEN })
  @IsEnum(AccessType)
  accessType: AccessType;

  @ApiProperty({ example: '1 Screen' })
  @IsString()
  deviceLimit: string;

  @ApiProperty({ example: '4K UHD' })
  @IsString()
  quality: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  region: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ type: [InventorySlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventorySlotDto)
  inventory: InventorySlotDto[];
}

export class UpdateListingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  planName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiProperty({ required: false, enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class AddInventoryDto {
  @ApiProperty({ type: [InventorySlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventorySlotDto)
  slots: InventorySlotDto[];
}
