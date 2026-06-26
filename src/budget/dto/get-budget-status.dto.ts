import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetBudgetStatusDto {
  @IsNotEmpty()
  @IsNumber()
  month: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;
}
