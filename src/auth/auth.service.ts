import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginDto } from './dtos/login.dto';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    const user = await this.usersService.findOne({ phone });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);

    return {
      message: 'Logged out successfully',
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const storedToken = await this.redis.get(`refresh_token:${userId}`);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user);

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(user: User) {
    const { password, createdAt, ...safeUserData } = user;

    const payload = {
      sub: user.id,
      ...safeUserData,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(userId: string, token: string) {
    await this.redis.set(`refresh_token:${userId}`, token, 7 * 24 * 60 * 60);
  }
}
