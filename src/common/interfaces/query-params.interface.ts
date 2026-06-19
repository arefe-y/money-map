import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsOptional()
  @IsArray()
  where?: string | string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  relations?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  select?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiProperty()
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
