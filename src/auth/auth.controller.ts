import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('Authentication')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  logout(@Body() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }

  //   @Post('refresh')
  //   refresh(
  //     @Body() body: { userId: string; refreshToken: string },
  //   ) {
  //     return this.authService.refresh(
  //       body.userId,
  //       body.refreshToken,
  //     );
  //   }
}
