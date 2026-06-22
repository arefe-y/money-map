import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
} from 'typeorm';

export interface IValidParams {
  filters: string[];
  sort: string[];
  relations: string[];
  select: string[];
}

export class FindQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  where?: string | string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  take?: number;
}
export interface FindQuery<T> {
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindOptionsOrder<T>;
  relations?: string[] | FindOptionsRelations<T>;
  select?: FindOptionsSelect<T> | FindOptionsSelectByString<T>;
  skip?: number;
  take?: number;
}
