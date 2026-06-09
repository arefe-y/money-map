import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { RedisService } from './redis.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
