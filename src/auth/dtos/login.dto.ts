import { IsString, MinLength, IsEmail } from 'class-validator';

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}
